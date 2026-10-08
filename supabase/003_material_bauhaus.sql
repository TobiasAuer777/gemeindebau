-- Gemeindebau – Erweiterung 3: Material mit Bauhaus-Link und Preis; Gabriel Nachtnebel in der Leitungsgruppe
-- Ausführen: Supabase → SQL Editor → New query → alles einfügen → Run

alter table public.material add column if not exists link text;          -- Produktseite, z. B. bei bauhaus.info
alter table public.material add column if not exists preis numeric(10,2); -- Preis je Einheit in Euro (zur Orientierung)

insert into public.leitung (name, schwerpunkt, hinweis, sort)
select 'Gabriel Nachtnebel', 'alles', null, coalesce((select max(sort) from public.leitung), 0) + 1
where not exists (select 1 from public.leitung where name = 'Gabriel Nachtnebel');

select 'Erweiterung 3 eingespielt' as ergebnis;
