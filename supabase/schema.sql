-- Gemeindebau Tabernacle Church – Datenbank-Schema (Supabase / Postgres)
-- Zugriff: nur angemeldete Gemeindemitglieder (Profil per Beitrittscode). Bauleitung darf mehr.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- Grundtabellen
create table if not exists public.einstellung (
  schluessel text primary key,
  wert text not null
);
insert into public.einstellung values ('beitrittscode', 'TABERNACLE2026')
  on conflict (schluessel) do nothing;

create table if not exists public.profil (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  rolle text not null default 'mitglied' check (rolle in ('admin','bauleitung','mitglied')),
  schwerpunkte text[] not null default '{}',
  hinweis text,
  telefon text,
  erstellt timestamptz not null default now()
);

-- Leitungsgruppe (wie von Tobi vorgegeben); profil_id wird verknüpft, sobald die Person registriert ist
create table if not exists public.leitung (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  schwerpunkt text,
  hinweis text,
  profil_id uuid references public.profil on delete set null,
  sort int not null default 0
);

create table if not exists public.team (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  gewerk text,
  beschreibung text,
  leiter text,
  farbe text,
  sort int not null default 0
);

create table if not exists public.team_mitglied (
  team_id uuid references public.team on delete cascade,
  profil_id uuid references public.profil on delete cascade,
  primary key (team_id, profil_id)
);

create table if not exists public.aufgabe (
  id uuid primary key default gen_random_uuid(),
  titel text not null,
  beschreibung text,
  gewerk text,
  bereich text,
  status text not null default 'offen' check (status in ('offen','geplant','in_arbeit','erledigt')),
  prio int not null default 2,
  datum date,
  team_id uuid references public.team on delete set null,
  zugewiesen uuid[] not null default '{}',
  vorschlag boolean not null default false,
  erstellt_von uuid default auth.uid(),
  erstellt timestamptz not null default now()
);

create table if not exists public.eintrag (
  id uuid primary key default gen_random_uuid(),
  datum date not null default current_date,
  text text,
  aufgabe_id uuid references public.aufgabe on delete set null,
  fotos text[] not null default '{}',
  autor uuid not null default auth.uid() references public.profil on delete cascade,
  erstellt timestamptz not null default now()
);

create table if not exists public.verfuegbarkeit (
  id uuid primary key default gen_random_uuid(),
  profil_id uuid not null default auth.uid() references public.profil on delete cascade,
  datum date not null,
  von time,
  bis time,
  taetigkeiten text[] not null default '{}',   -- in Wunsch-Reihenfolge
  alles_gleich boolean not null default false,
  notiz text,
  unique (profil_id, datum)
);

create table if not exists public.material (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  menge numeric,
  einheit text,
  gewerk text,
  status text not null default 'angefragt'
    check (status in ('bedarf','angefragt','freigegeben','bestellt','geliefert','abgelehnt')),
  notiz text,
  aufgabe_id uuid references public.aufgabe on delete set null,
  vorschlag boolean not null default false,
  angefragt_von uuid default auth.uid(),
  erstellt timestamptz not null default now()
);

create table if not exists public.werkzeug (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kategorie text,
  anzahl int not null default 1,
  verfuegbarkeit text,
  notiz text,
  besitzer uuid not null default auth.uid() references public.profil on delete cascade,
  erstellt timestamptz not null default now()
);

create table if not exists public.planobjekt (
  id uuid primary key default gen_random_uuid(),
  typ text not null,
  x real not null, y real not null,
  rot real not null default 0,
  label text,
  geaendert_von uuid default auth.uid(),
  geaendert timestamptz not null default now()
);

-- ---------------------------------------------------------------- Hilfsfunktionen
create or replace function public.ist_mitglied() returns boolean
  language sql stable security definer set search_path = public as
$$ select exists (select 1 from profil where id = auth.uid()) $$;

create or replace function public.ist_leitung() returns boolean
  language sql stable security definer set search_path = public as
$$ select exists (select 1 from profil where id = auth.uid() and rolle in ('admin','bauleitung')) $$;

create or replace function public.ist_admin() returns boolean
  language sql stable security definer set search_path = public as
$$ select exists (select 1 from profil where id = auth.uid() and rolle = 'admin') $$;

-- Beitritt mit Gemeinde-Code; das allererste Profil wird Admin
create or replace function public.beitreten(p_code text, p_name text) returns text
  language plpgsql security definer set search_path = public as
$$
declare v_rolle text;
begin
  if auth.uid() is null then raise exception 'nicht angemeldet'; end if;
  if p_code is distinct from (select wert from einstellung where schluessel = 'beitrittscode') then
    raise exception 'Gemeinde-Code stimmt nicht';
  end if;
  v_rolle := case when exists (select 1 from profil where rolle = 'admin') then 'mitglied' else 'admin' end;
  insert into profil (id, name, rolle) values (auth.uid(), trim(p_name), v_rolle)
    on conflict (id) do update set name = excluded.name;
  -- Leitungsgruppe automatisch verknüpfen, wenn der Name passt
  update leitung set profil_id = auth.uid()
    where profil_id is null and lower(split_part(name,' ',1)) = lower(split_part(trim(p_name),' ',1));
  update profil set rolle = 'bauleitung'
    where id = auth.uid() and rolle = 'mitglied' and exists (select 1 from leitung where profil_id = auth.uid() and coalesce(schwerpunkt,'') not ilike '%Pastor%');
  return (select rolle from profil where id = auth.uid());
end $$;

create or replace function public.code_setzen(p_code text) returns void
  language plpgsql security definer set search_path = public as
$$
begin
  if not ist_admin() then raise exception 'nur Admin'; end if;
  update einstellung set wert = trim(p_code) where schluessel = 'beitrittscode';
end $$;

-- Rolle darf nur Admin ändern
create or replace function public.rolle_schuetzen() returns trigger
  language plpgsql security definer set search_path = public as
$$
begin
  if new.rolle is distinct from old.rolle and not ist_admin() then
    new.rolle := old.rolle;
  end if;
  return new;
end $$;
drop trigger if exists profil_rolle on public.profil;
create trigger profil_rolle before update on public.profil for each row execute function public.rolle_schuetzen();

-- ---------------------------------------------------------------- Zugriffsregeln (RLS)
alter table public.einstellung enable row level security;   -- keine Policy: nicht lesbar
alter table public.profil enable row level security;
alter table public.leitung enable row level security;
alter table public.team enable row level security;
alter table public.team_mitglied enable row level security;
alter table public.aufgabe enable row level security;
alter table public.eintrag enable row level security;
alter table public.verfuegbarkeit enable row level security;
alter table public.material enable row level security;
alter table public.werkzeug enable row level security;
alter table public.planobjekt enable row level security;

-- Lesen: alle Mitglieder
do $$
declare t text;
begin
  foreach t in array array['profil','leitung','team','team_mitglied','aufgabe','eintrag','verfuegbarkeit','material','werkzeug','planobjekt'] loop
    execute format('drop policy if exists lesen on public.%I', t);
    execute format('create policy lesen on public.%I for select to authenticated using (public.ist_mitglied())', t);
  end loop;
end $$;

-- Profil: eigenes bearbeiten, Admin alle
drop policy if exists bearbeiten on public.profil;
create policy bearbeiten on public.profil for update to authenticated
  using (id = auth.uid() or public.ist_admin()) with check (id = auth.uid() or public.ist_admin());

-- Leitung, Team: Bauleitung pflegt
drop policy if exists schreiben on public.leitung;
create policy schreiben on public.leitung for all to authenticated using (public.ist_leitung()) with check (public.ist_leitung());
drop policy if exists schreiben on public.team;
create policy schreiben on public.team for all to authenticated using (public.ist_leitung()) with check (public.ist_leitung());

-- Team-Mitgliedschaft: selbst ein-/austreten, Bauleitung alle
drop policy if exists schreiben on public.team_mitglied;
create policy schreiben on public.team_mitglied for all to authenticated
  using (profil_id = auth.uid() or public.ist_leitung()) with check (profil_id = auth.uid() or public.ist_leitung());

-- Aufgaben: Bauleitung anlegen/löschen; Zugewiesene dürfen Status ändern
drop policy if exists anlegen on public.aufgabe;
create policy anlegen on public.aufgabe for insert to authenticated with check (public.ist_leitung());
drop policy if exists aendern on public.aufgabe;
create policy aendern on public.aufgabe for update to authenticated
  using (public.ist_leitung() or auth.uid() = any (zugewiesen)) with check (public.ist_leitung() or auth.uid() = any (zugewiesen));
drop policy if exists loeschen on public.aufgabe;
create policy loeschen on public.aufgabe for delete to authenticated using (public.ist_leitung());

-- Einträge (Bautagebuch, Notizen, Fotos): jedes Mitglied; ändern eigene oder Bauleitung
drop policy if exists anlegen on public.eintrag;
create policy anlegen on public.eintrag for insert to authenticated with check (public.ist_mitglied() and autor = auth.uid());
drop policy if exists aendern on public.eintrag;
create policy aendern on public.eintrag for update to authenticated using (autor = auth.uid() or public.ist_leitung());
drop policy if exists loeschen on public.eintrag;
create policy loeschen on public.eintrag for delete to authenticated using (autor = auth.uid() or public.ist_leitung());

-- Verfügbarkeit: eigene, Bauleitung alle
drop policy if exists schreiben on public.verfuegbarkeit;
create policy schreiben on public.verfuegbarkeit for all to authenticated
  using (profil_id = auth.uid() or public.ist_leitung()) with check (profil_id = auth.uid() or public.ist_leitung());

-- Material: jeder fragt an; Status/Freigabe nur Bauleitung; eigene Anfragen solange offen
drop policy if exists anlegen on public.material;
create policy anlegen on public.material for insert to authenticated
  with check (public.ist_leitung() or (public.ist_mitglied() and status = 'angefragt' and angefragt_von = auth.uid()));
drop policy if exists aendern on public.material;
create policy aendern on public.material for update to authenticated
  using (public.ist_leitung() or (angefragt_von = auth.uid() and status = 'angefragt'))
  with check (public.ist_leitung() or (angefragt_von = auth.uid() and status = 'angefragt'));
drop policy if exists loeschen on public.material;
create policy loeschen on public.material for delete to authenticated
  using (public.ist_leitung() or (angefragt_von = auth.uid() and status = 'angefragt'));

-- Werkzeug: eigenes, Bauleitung alle
drop policy if exists schreiben on public.werkzeug;
create policy schreiben on public.werkzeug for all to authenticated
  using (besitzer = auth.uid() or public.ist_leitung()) with check (besitzer = auth.uid() or public.ist_leitung());

-- Planobjekte: alle Mitglieder planen gemeinsam
drop policy if exists schreiben on public.planobjekt;
create policy schreiben on public.planobjekt for all to authenticated
  using (public.ist_mitglied()) with check (public.ist_mitglied());

grant execute on function public.beitreten(text, text), public.code_setzen(text),
  public.ist_mitglied(), public.ist_leitung(), public.ist_admin() to authenticated;

-- ---------------------------------------------------------------- Fotos (privater Speicher)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', false, 10485760, array['image/jpeg','image/png','image/webp','image/heic'])
on conflict (id) do nothing;

drop policy if exists "fotos lesen" on storage.objects;
create policy "fotos lesen" on storage.objects for select to authenticated
  using (bucket_id = 'fotos' and public.ist_mitglied());
drop policy if exists "fotos hochladen" on storage.objects;
create policy "fotos hochladen" on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and public.ist_mitglied() and owner = auth.uid());
drop policy if exists "fotos loeschen" on storage.objects;
create policy "fotos loeschen" on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and (owner = auth.uid() or public.ist_leitung()));

-- ---------------------------------------------------------------- Startdaten (von Tobi vorgegeben)
insert into public.leitung (name, schwerpunkt, hinweis, sort)
select * from (values
  ('Tobi',            'alles', null, 1),
  ('Andreas Kollert', 'alles', null, 2),
  ('Roland',          'alles', null, 3),
  ('Christoph',       'alles', null, 4),
  ('Bernd',           'alles', 'lange Anreise – eher am Wochenende', 5),
  ('Igor',            'alles, vor allem Mauern', 'lange Anreise – eher am Wochenende', 6),
  ('Andre',           'alles, vor allem Mauern und Fliesenlegen', null, 7),
  ('Daniel Lutz',     'Elektrik', null, 8),
  ('Linda',           'Verpflegung', null, 9),
  ('Jonas',           'Verpflegung', null, 10),
  ('Parfait',         'Pastor (übergeordnet, kein Bautrupp)', null, 11),
  ('Gabriel Nachtnebel', 'alles', null, 12)
) v(name, schwerpunkt, hinweis, sort)
where not exists (select 1 from public.leitung);

insert into public.team (name, gewerk, beschreibung, leiter, farbe, sort)
select * from (values
  ('Mauerwerk & Ytong',  'Mauern',      'Neue Wände (gelb im Plan), Ytong mit Ringanker', 'Andre, Igor',    '#c2410c', 1),
  ('Fliesen',            'Fliesen',     'WC-Block, Küche, Sanitär',                        'Andre',          '#0e7490', 2),
  ('Elektrik',           'Elektrik',    'Leitungen, Verteilung, Licht, Bühne & LED-Wand',  'Daniel Lutz',    '#ca8a04', 3),
  ('Rückbau & Allgemein','Rückbau',     'Wände zurückbauen, Entsorgen, Aufräumen, Helfen', 'Leitungsgruppe', '#475569', 4),
  ('Verpflegung',        'Verpflegung', 'Essen und Getränke für die Bautage',              'Linda, Jonas',   '#be185d', 5)
) v(name, gewerk, beschreibung, leiter, farbe, sort)
where not exists (select 1 from public.team);
