-- Gemeindebau – Erweiterung 2: Phasen für Aufgaben, Benutzerverwaltung (Liste, sperren, Zugänge anlegen), Tagesplan
-- Ausführen: Supabase → SQL Editor → New query → alles einfügen → Run

-- Aufgaben bekommen eine Bauphase (0 = Vorbereitung … 6 = Abnahmen)
alter table public.aufgabe add column if not exists phase int check (phase between 0 and 9);

-- Gesperrte Benutzer verlieren jeden Zugriff, ihre Einträge bleiben erhalten
alter table public.profil add column if not exists gesperrt boolean not null default false;

create or replace function public.ist_mitglied() returns boolean
  language sql stable security definer set search_path = public as
$$ select exists (select 1 from profil where id = auth.uid() and not gesperrt) $$;

create or replace function public.ist_leitung() returns boolean
  language sql stable security definer set search_path = public as
$$ select exists (select 1 from profil where id = auth.uid() and not gesperrt and rolle in ('admin','bauleitung')) $$;

create or replace function public.ist_admin() returns boolean
  language sql stable security definer set search_path = public as
$$ select exists (select 1 from profil where id = auth.uid() and not gesperrt and rolle = 'admin') $$;

-- Rolle und Sperre darf nur ein Admin ändern
create or replace function public.rolle_schuetzen() returns trigger
  language plpgsql security definer set search_path = public as
$$
begin
  -- Ausnahme: automatische Einstufung der Leitungsgruppe beim Beitritt
  if not ist_admin() and coalesce(current_setting('gb.beitritt', true), '') <> '1' then
    new.rolle := old.rolle;
    new.gesperrt := old.gesperrt;
  end if;
  return new;
end $$;

-- Beitritt: gesperrte Profile bleiben gesperrt
create or replace function public.beitreten(p_code text, p_name text) returns text
  language plpgsql security definer set search_path = public as
$$
declare v_rolle text;
begin
  if auth.uid() is null then raise exception 'nicht angemeldet'; end if;
  if exists (select 1 from profil where id = auth.uid() and gesperrt) then
    raise exception 'Dein Zugang ist gesperrt. Bitte wende dich an die Bauleitung.';
  end if;
  if p_code is distinct from (select wert from einstellung where schluessel = 'beitrittscode') then
    raise exception 'Gemeinde-Code stimmt nicht';
  end if;
  perform set_config('gb.beitritt', '1', true);
  v_rolle := case when exists (select 1 from profil where rolle = 'admin') then 'mitglied' else 'admin' end;
  insert into profil (id, name, rolle) values (auth.uid(), trim(p_name), v_rolle)
    on conflict (id) do update set name = excluded.name;
  update leitung set profil_id = auth.uid()
    where profil_id is null and lower(split_part(name,' ',1)) = lower(split_part(trim(p_name),' ',1));
  update profil set rolle = 'bauleitung'
    where id = auth.uid() and rolle = 'mitglied' and exists (select 1 from leitung where profil_id = auth.uid() and coalesce(schwerpunkt,'') not ilike '%Pastor%');
  perform set_config('gb.beitritt', '', true);
  return (select rolle from profil where id = auth.uid());
end $$;

-- Benutzerliste mit E-Mail und letzter Anmeldung – nur für Admins
create or replace function public.benutzer_liste()
  returns table (id uuid, email text, zuletzt timestamptz, registriert timestamptz)
  language plpgsql stable security definer set search_path = public as
$$
begin
  if not ist_admin() then raise exception 'nur Admin'; end if;
  return query select u.id, u.email::text, u.last_sign_in_at, u.created_at
    from auth.users u join profil p on p.id = u.id;
end $$;

-- Sperren / entsperren – nur Admin, nicht sich selbst
create or replace function public.benutzer_sperren(p_id uuid, p_sperren boolean) returns void
  language plpgsql security definer set search_path = public as
$$
begin
  if not ist_admin() then raise exception 'nur Admin'; end if;
  if p_id = auth.uid() then raise exception 'Du kannst dich nicht selbst sperren'; end if;
  update profil set gesperrt = p_sperren where id = p_id;
end $$;

revoke execute on function public.benutzer_liste(), public.benutzer_sperren(uuid, boolean) from public, anon;
grant execute on function public.benutzer_liste(), public.benutzer_sperren(uuid, boolean) to authenticated;

-- Ringanker an beiden langen Wänden (Trennwand und Wand hinter der Bühne)
update public.team set beschreibung = 'Neue Wände (gelb im Plan) in Ytong; Ringanker an beiden langen Wänden'
  where name = 'Mauerwerk & Ytong';

-- ---------- Zugänge anlegen (Admin) ----------
-- Die App legt das Konto mit E-Mail und Startpasswort an (normale Registrierung über einen zweiten,
-- unabhängigen Client – die Admin-Sitzung bleibt bestehen). Hier entsteht danach das Profil mit Rolle.
-- Beim ersten Anmelden muss die Person ein eigenes Passwort festlegen (pw_wechseln).
alter table public.profil add column if not exists pw_wechseln boolean not null default false;

create or replace function public.zugang_anlegen(p_id uuid, p_name text, p_rolle text) returns void
  language plpgsql security definer set search_path = public as
$$
begin
  if not ist_admin() then raise exception 'nur Admin'; end if;
  if p_rolle not in ('mitglied','bauleitung','admin') then raise exception 'unbekannte Rolle'; end if;
  if trim(coalesce(p_name,'')) = '' then raise exception 'Name fehlt'; end if;
  if not exists (select 1 from auth.users where id = p_id) then raise exception 'Konto nicht gefunden'; end if;
  if exists (select 1 from profil where id = p_id) then raise exception 'Diese Person hat schon einen Zugang'; end if;
  insert into profil (id, name, rolle, pw_wechseln) values (p_id, trim(p_name), p_rolle, true);
  update leitung set profil_id = p_id
    where profil_id is null and lower(split_part(name,' ',1)) = lower(split_part(trim(p_name),' ',1));
end $$;

create or replace function public.passwort_gewechselt() returns void
  language sql security definer set search_path = public as
$$ update profil set pw_wechseln = false where id = auth.uid() $$;

revoke execute on function public.zugang_anlegen(uuid, text, text), public.passwort_gewechselt() from public, anon;
grant execute on function public.zugang_anlegen(uuid, text, text), public.passwort_gewechselt() to authenticated;

-- ---------- Tagesplan ----------
-- Für jeden Bautag eine Liste zum Abhaken: Start, Arbeiten, Schluss (Sauber machen, Werkzeug aufräumen …).
-- Anlegen, ändern und löschen darf die Leitung; abhaken darf jedes Mitglied.
create table if not exists public.tagesplan_punkt (
  id uuid primary key default gen_random_uuid(),
  datum date not null,
  abschnitt text not null default 'arbeit' check (abschnitt in ('start','arbeit','ende')),
  titel text not null,
  notiz text,
  wer text,
  aufgabe_id uuid references public.aufgabe on delete set null,
  sort int not null default 0,
  erledigt boolean not null default false,
  erledigt_von uuid references public.profil on delete set null,
  erledigt_um timestamptz,
  erstellt timestamptz not null default now()
);
create index if not exists tagesplan_punkt_datum on public.tagesplan_punkt (datum, abschnitt, sort);
alter table public.tagesplan_punkt enable row level security;
drop policy if exists lesen on public.tagesplan_punkt;
create policy lesen on public.tagesplan_punkt for select to authenticated using (public.ist_mitglied());
drop policy if exists anlegen on public.tagesplan_punkt;
create policy anlegen on public.tagesplan_punkt for insert to authenticated with check (public.ist_leitung());
drop policy if exists aendern on public.tagesplan_punkt;
create policy aendern on public.tagesplan_punkt for update to authenticated using (public.ist_mitglied()) with check (public.ist_mitglied());
drop policy if exists loeschen on public.tagesplan_punkt;
create policy loeschen on public.tagesplan_punkt for delete to authenticated using (public.ist_leitung());

-- Mitglieder dürfen nur abhaken; wer und wann setzt die Datenbank selbst
create or replace function public.tagesplan_schuetzen() returns trigger
  language plpgsql security definer set search_path = public as
$$
begin
  if not ist_leitung() then
    new.datum := old.datum; new.abschnitt := old.abschnitt; new.titel := old.titel; new.notiz := old.notiz;
    new.wer := old.wer; new.aufgabe_id := old.aufgabe_id; new.sort := old.sort;
  end if;
  if new.erledigt and not old.erledigt then new.erledigt_von := auth.uid(); new.erledigt_um := now();
  elsif not new.erledigt then new.erledigt_von := null; new.erledigt_um := null;
  else new.erledigt_von := old.erledigt_von; new.erledigt_um := old.erledigt_um; end if;
  return new;
end $$;
drop trigger if exists tagesplan_schutz on public.tagesplan_punkt;
create trigger tagesplan_schutz before update on public.tagesplan_punkt for each row execute function public.tagesplan_schuetzen();

-- Live-Abgleich: Änderungen erscheinen sofort auf allen Geräten
do $$
declare t text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array['profil','leitung','team','team_mitglied','aufgabe','eintrag','verfuegbarkeit','material','werkzeug','planobjekt','tagesplan_punkt'] loop
      if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
        execute format('alter publication supabase_realtime add table public.%I', t);
      end if;
    end loop;
  end if;
end $$;

select 'Erweiterung 2 eingespielt' as ergebnis;
