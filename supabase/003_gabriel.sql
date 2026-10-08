-- Gabriel Nachtnebel in die Leitungsgruppe (einmalig; macht nichts, wenn er schon drin ist)
insert into public.leitung (name, schwerpunkt, hinweis, sort)
select 'Gabriel Nachtnebel', 'alles', null, coalesce((select max(sort) from public.leitung), 0) + 1
where not exists (select 1 from public.leitung where name = 'Gabriel Nachtnebel');
select name, schwerpunkt, sort from public.leitung order by sort;
