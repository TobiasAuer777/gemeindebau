-- Gemeindebau – Erweiterung 2: Phasen für Aufgaben, Benutzerverwaltung (Liste, sperren)
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

-- Planverständnis korrigiert: Ringanker nur an der durchgehenden Wand hinter der Bühne
update public.team set beschreibung = 'Neue Wände (gelb im Plan) in Ytong; Ringanker an der Wand hinter der Bühne'
  where name = 'Mauerwerk & Ytong';

select 'Erweiterung 2 eingespielt' as ergebnis;
