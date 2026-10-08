-- Gemeindebau – Erweiterung 4: Sicherheit (Prüfung vom 08.10.2026)
-- Ausführen: Supabase → SQL Editor → New query → alles einfügen → Run. Kann gefahrlos mehrfach laufen.
--
-- Was sich ändert:
--  1. Beitritt mit Gemeinde-Code macht niemanden mehr automatisch zur Bauleitung (vorher reichte der passende Vorname).
--     Die Rolle vergibt nur noch der Admin (Benutzer → Bekannte Personen → „Zuordnen“ oder Rolle in der Liste).
--  2. Falsche Gemeinde-Codes werden gezählt: 5 Fehlversuche pro Konto bzw. 50 insgesamt pro Stunde, dann Pause.
--  3. Wer einer Aufgabe zugewiesen ist, darf nur noch den Status ändern – nicht Titel, Zuweisung, Datum usw.
--  4. Gesperrte Benutzer können nirgends mehr schreiben und sehen beim Anmelden, dass sie gesperrt sind.
--  5. Produktlinks nur noch mit http(s), Teamfarben nur als Farbcode (Schutz vor eingeschleustem Code).
--  6. Unangemeldete Besucher haben keinerlei Tabellenrechte mehr; Funktionen mit festem Suchpfad.

-- ---------- 1 + 2: Beitreten ----------
create table if not exists public.beitritt_versuch (
  uid uuid primary key,
  fehl int not null default 0,
  zuletzt timestamptz not null default now()
);
alter table public.beitritt_versuch enable row level security;   -- keine Policy: nur die Funktion selbst liest und schreibt

create or replace function public.beitreten(p_code text, p_name text) returns text
  language plpgsql security definer set search_path = public, pg_temp as
$$
declare v_rolle text; v_fehl int; v_gesamt int;
begin
  if auth.uid() is null then raise exception 'nicht angemeldet'; end if;
  if trim(coalesce(p_name, '')) = '' then raise exception 'Bitte deinen Namen angeben'; end if;
  if exists (select 1 from profil where id = auth.uid() and gesperrt) then
    raise exception 'Dein Zugang ist gesperrt. Bitte wende dich an die Bauleitung.';
  end if;
  select fehl into v_fehl from beitritt_versuch where uid = auth.uid() and zuletzt > now() - interval '1 hour';
  select coalesce(sum(fehl), 0) into v_gesamt from beitritt_versuch where zuletzt > now() - interval '1 hour';
  if coalesce(v_fehl, 0) >= 5 or v_gesamt >= 50 then return 'zu_viele'; end if;
  if p_code is distinct from (select wert from einstellung where schluessel = 'beitrittscode') then
    -- zählen und mit RETURN beenden (ein RAISE würde den Zähler zurückrollen)
    insert into beitritt_versuch (uid, fehl, zuletzt) values (auth.uid(), 1, now())
      on conflict (uid) do update set
        fehl = case when beitritt_versuch.zuletzt > now() - interval '1 hour' then beitritt_versuch.fehl + 1 else 1 end,
        zuletzt = now();
    return 'falsch';
  end if;
  delete from beitritt_versuch where uid = auth.uid();
  -- nur das allererste Profil wird Admin, alle anderen Gemeindemitglied
  v_rolle := case when exists (select 1 from profil where rolle = 'admin') then 'mitglied' else 'admin' end;
  insert into profil (id, name, rolle) values (auth.uid(), trim(p_name), v_rolle)
    on conflict (id) do update set name = excluded.name;
  return (select rolle from profil where id = auth.uid());
end $$;

-- Rolle und Sperre ändert ausschließlich ein Admin (die frühere Ausnahme beim Beitritt entfällt)
create or replace function public.rolle_schuetzen() returns trigger
  language plpgsql security definer set search_path = public, pg_temp as
$$
begin
  if not ist_admin() then
    new.rolle := old.rolle;
    new.gesperrt := old.gesperrt;
    new.pw_wechseln := old.pw_wechseln and new.pw_wechseln;   -- selbst nur auf „erledigt“ setzen
  end if;
  return new;
end $$;

-- Gemeinde-Code: mindestens 10 Zeichen
create or replace function public.code_setzen(p_code text) returns void
  language plpgsql security definer set search_path = public, pg_temp as
$$
begin
  if not ist_admin() then raise exception 'nur Admin'; end if;
  if length(trim(coalesce(p_code, ''))) < 10 then raise exception 'Der Gemeinde-Code muss mindestens 10 Zeichen haben'; end if;
  update einstellung set wert = trim(p_code) where schluessel = 'beitrittscode';
end $$;

-- Zugang durch den Admin: Leitungsgruppe nur bei vollem Namen verknüpfen (nicht mehr nur Vorname)
create or replace function public.zugang_anlegen(p_id uuid, p_name text, p_rolle text) returns void
  language plpgsql security definer set search_path = public, pg_temp as
$$
begin
  if not ist_admin() then raise exception 'nur Admin'; end if;
  if p_rolle not in ('mitglied','bauleitung','admin') then raise exception 'unbekannte Rolle'; end if;
  if trim(coalesce(p_name,'')) = '' then raise exception 'Name fehlt'; end if;
  if not exists (select 1 from auth.users where id = p_id) then raise exception 'Konto nicht gefunden'; end if;
  if exists (select 1 from profil where id = p_id) then raise exception 'Diese Person hat schon einen Zugang'; end if;
  insert into profil (id, name, rolle, pw_wechseln) values (p_id, trim(p_name), p_rolle, true);
  update leitung set profil_id = p_id where profil_id is null and lower(trim(name)) = lower(trim(p_name));
end $$;

-- ---------- 3: Aufgaben – Zugewiesene ändern nur den Status ----------
create or replace function public.aufgabe_schuetzen() returns trigger
  language plpgsql security definer set search_path = public, pg_temp as
$$
declare v_status text := new.status;
begin
  if not ist_leitung() then
    new := old;
    new.status := v_status;
  end if;
  return new;
end $$;
drop trigger if exists aufgabe_schutz on public.aufgabe;
create trigger aufgabe_schutz before update on public.aufgabe for each row execute function public.aufgabe_schuetzen();

-- Tagesplan: auch id und erstellt sind für Mitglieder tabu
create or replace function public.tagesplan_schuetzen() returns trigger
  language plpgsql security definer set search_path = public, pg_temp as
$$
begin
  if not ist_leitung() then
    new.id := old.id; new.erstellt := old.erstellt;
    new.datum := old.datum; new.abschnitt := old.abschnitt; new.titel := old.titel; new.notiz := old.notiz;
    new.wer := old.wer; new.aufgabe_id := old.aufgabe_id; new.sort := old.sort;
  end if;
  if new.erledigt and not old.erledigt then new.erledigt_von := auth.uid(); new.erledigt_um := now();
  elsif not new.erledigt then new.erledigt_von := null; new.erledigt_um := null;
  else new.erledigt_von := old.erledigt_von; new.erledigt_um := old.erledigt_um; end if;
  return new;
end $$;

-- ---------- 4: Gesperrte Benutzer ----------
-- eigenes Profil bleibt lesbar, damit die App „gesperrt“ anzeigen kann
drop policy if exists lesen on public.profil;
create policy lesen on public.profil for select to authenticated using (public.ist_mitglied() or id = auth.uid());
drop policy if exists bearbeiten on public.profil;
create policy bearbeiten on public.profil for update to authenticated
  using ((id = auth.uid() and public.ist_mitglied()) or public.ist_admin())
  with check ((id = auth.uid() and public.ist_mitglied()) or public.ist_admin());

drop policy if exists schreiben on public.team_mitglied;
create policy schreiben on public.team_mitglied for all to authenticated
  using (public.ist_mitglied() and (profil_id = auth.uid() or public.ist_leitung()))
  with check (public.ist_mitglied() and (profil_id = auth.uid() or public.ist_leitung()));
drop policy if exists schreiben on public.verfuegbarkeit;
create policy schreiben on public.verfuegbarkeit for all to authenticated
  using (public.ist_mitglied() and (profil_id = auth.uid() or public.ist_leitung()))
  with check (public.ist_mitglied() and (profil_id = auth.uid() or public.ist_leitung()));
drop policy if exists schreiben on public.werkzeug;
create policy schreiben on public.werkzeug for all to authenticated
  using (public.ist_mitglied() and (besitzer = auth.uid() or public.ist_leitung()))
  with check (public.ist_mitglied() and (besitzer = auth.uid() or public.ist_leitung()));
drop policy if exists aendern on public.eintrag;
create policy aendern on public.eintrag for update to authenticated
  using (public.ist_mitglied() and (autor = auth.uid() or public.ist_leitung()))
  with check (public.ist_mitglied() and (autor = auth.uid() or public.ist_leitung()));
drop policy if exists loeschen on public.eintrag;
create policy loeschen on public.eintrag for delete to authenticated
  using (public.ist_mitglied() and (autor = auth.uid() or public.ist_leitung()));
drop policy if exists aendern on public.material;
create policy aendern on public.material for update to authenticated
  using (public.ist_leitung() or (public.ist_mitglied() and angefragt_von = auth.uid() and status = 'angefragt'))
  with check (public.ist_leitung() or (public.ist_mitglied() and angefragt_von = auth.uid() and status = 'angefragt'));
drop policy if exists loeschen on public.material;
create policy loeschen on public.material for delete to authenticated
  using (public.ist_leitung() or (public.ist_mitglied() and angefragt_von = auth.uid() and status = 'angefragt'));
drop policy if exists "fotos loeschen" on storage.objects;
create policy "fotos loeschen" on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and public.ist_mitglied() and (owner = auth.uid() or public.ist_leitung()));

-- ---------- 5: Nur saubere Werte ----------
alter table public.material drop constraint if exists material_link_http;
alter table public.material add constraint material_link_http check (link is null or link ~* '^https?://[^\s"<>]+$') not valid;
alter table public.team drop constraint if exists team_farbe_hex;
alter table public.team add constraint team_farbe_hex check (farbe is null or farbe ~ '^#[0-9a-fA-F]{6}$') not valid;
alter table public.eintrag drop constraint if exists eintrag_fotos_pfad;
alter table public.eintrag add constraint eintrag_fotos_pfad check (array_to_string(fotos, '|') !~ '[<>"'' ]|data:|javascript:') not valid;

-- ---------- 6: Rechte und Suchpfad ----------
revoke all on all tables in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;
drop policy if exists aendern on public.aufgabe;
create policy aendern on public.aufgabe for update to authenticated
  using (public.ist_leitung() or (public.ist_mitglied() and auth.uid() = any (zugewiesen)))
  with check (public.ist_leitung() or (public.ist_mitglied() and auth.uid() = any (zugewiesen)));
alter function public.ist_mitglied() set search_path = public, pg_temp;
alter function public.ist_leitung() set search_path = public, pg_temp;
alter function public.ist_admin() set search_path = public, pg_temp;
alter function public.benutzer_liste() set search_path = public, pg_temp;
alter function public.benutzer_sperren(uuid, boolean) set search_path = public, pg_temp;
alter function public.passwort_gewechselt() set search_path = public, pg_temp;
revoke execute on function public.beitreten(text, text), public.code_setzen(text), public.zugang_anlegen(uuid, text, text),
  public.ist_mitglied(), public.ist_leitung(), public.ist_admin() from public, anon;
grant execute on function public.beitreten(text, text), public.code_setzen(text), public.zugang_anlegen(uuid, text, text),
  public.ist_mitglied(), public.ist_leitung(), public.ist_admin() to authenticated;

select 'Erweiterung 4 eingespielt' as ergebnis;
