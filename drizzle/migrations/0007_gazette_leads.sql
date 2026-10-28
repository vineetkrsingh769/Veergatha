-- awards.gazette_ref is shown to the public, so it must hold only verified
-- gazette notifications. Unverified references are kept as editor-only leads
-- until someone confirms them against a primary copy of the gazette.

create table public.award_gazette_leads (
  id uuid primary key default gen_random_uuid(),
  award_id uuid not null references public.awards(id) on delete cascade,
  gazette_ref text not null,
  origin text not null,
  reason text not null,
  created_at timestamptz not null default now(),
  unique (award_id, gazette_ref)
);
create index award_gazette_leads_award_idx on public.award_gazette_leads (award_id);

-- Leads are never public, not even through the API. Supabase's default
-- privileges grant new tables to anon, so revoke explicitly rather than rely on RLS alone.
revoke all on public.award_gazette_leads from anon, authenticated;
grant select, insert, update, delete on public.award_gazette_leads to authenticated;
grant all on public.award_gazette_leads to service_role;
alter table public.award_gazette_leads enable row level security;
create policy "Editors manage gazette leads" on public.award_gazette_leads for all to authenticated
  using (public.is_editor(auth.uid())) with check (public.is_editor(auth.uid()));

-- The only gazette references in the seed data are the four Kargil Param Vir
-- Chakras ("No. 42-Pres/99"). None could be confirmed, so they become leads.
insert into public.award_gazette_leads (award_id, gazette_ref, origin, reason)
select
  id,
  gazette_ref,
  'Seed data (migrations 0001/0002), 2026-10-22',
  'Not found on the Gallantry Awards portal or in Gazette of India scans for Aug 1999 to Oct 2000. '
    || 'The portal confirms the award was made on Independence Day 1999, but the number looks out of '
    || 'sequence: police medals notified the same day (15 Aug 1999) are Nos. 95 to 97-Pres/99.'
from public.awards
where gazette_ref is not null;

update public.awards set gazette_ref = null where gazette_ref is not null;

comment on column public.awards.gazette_ref is
  'Verified gazette notification only. Unverified references belong in award_gazette_leads.';
