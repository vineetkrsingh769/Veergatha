-- ===== Enums =====
create type public.app_role as enum ('admin', 'editor');
create type public.verification_status as enum ('draft', 'in-review', 'verified');
create type public.record_status as enum ('fell-in-action', 'survived');
create type public.conflict_type as enum ('war', 'operation', 'counter-insurgency', 'peacekeeping');
create type public.media_license as enum ('GODL-India', 'CC-BY', 'CC-BY-SA', 'CC0', 'public-domain', 'permission-granted', 'unverified');
create type public.correction_status as enum ('new', 'reviewing', 'resolved', 'rejected');

-- ===== Shared helpers =====
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- ===== Profiles & roles =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select, insert, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_editor(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin', 'editor'))
$$;

create policy "Users read own profile, admins read all" on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Users update own profile" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "Users read own roles, admins read all" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Admins grant roles" on public.user_roles for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins revoke roles" on public.user_roles for delete to authenticated
  using (public.has_role(auth.uid(), 'admin') and user_id <> auth.uid());

-- New sign-ups get a profile; the very first account becomes the archive's admin.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===== Conflicts =====
create table public.wars (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  type public.conflict_type not null default 'war',
  start_date date,
  end_date date,
  period_label text,
  theatre text,
  summary text check (summary is null or char_length(summary) <= 400),
  description text,
  key_events jsonb not null default '[]'::jsonb,
  hero_media_id uuid,
  sources jsonb not null default '[]'::jsonb,
  verification public.verification_status not null default 'draft',
  verified_at timestamptz,
  editor_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);

-- ===== Memorials =====
create table public.memorials (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  city text,
  district text,
  state text,
  latitude double precision check (latitude is null or latitude between -90 and 90),
  longitude double precision check (longitude is null or longitude between -180 and 180),
  coords_approximate boolean not null default true,
  inaugurated_year int check (inaugurated_year is null or inaugurated_year between 1800 and 2100),
  managed_by text,
  description text,
  significance text,
  hero_media_id uuid,
  sources jsonb not null default '[]'::jsonb,
  verification public.verification_status not null default 'draft',
  verified_at timestamptz,
  editor_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index memorials_state_idx on public.memorials (state);

-- ===== Recipients =====
create table public.martyrs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  full_name text not null,
  rank text,
  service_number text,
  service_branch text not null default 'Army' check (service_branch in ('Army','Navy','Air Force','BSF','CRPF','Assam Rifles','ITBP','NSG','Other')),
  regiment text,
  unit text,
  date_of_birth date,
  status public.record_status not null,
  date_of_action date,
  birth_village text,
  birth_district text,
  birth_state text,
  war_id uuid references public.wars(id) on delete set null,
  operation text,
  place_of_action text,
  biography text,
  portrait_media_id uuid,
  sources jsonb not null default '[]'::jsonb,
  verification public.verification_status not null default 'draft',
  verified_at timestamptz,
  editor_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index martyrs_war_idx on public.martyrs (war_id, verification);
create index martyrs_state_idx on public.martyrs (birth_state);
create index martyrs_action_idx on public.martyrs (date_of_action desc);
create index martyrs_regiment_idx on public.martyrs (regiment);

create table public.awards (
  id uuid primary key default gen_random_uuid(),
  martyr_id uuid not null references public.martyrs(id) on delete cascade,
  name text not null check (name in ('Param Vir Chakra','Maha Vir Chakra','Vir Chakra','Ashoka Chakra','Kirti Chakra','Shaurya Chakra','Sena Medal','Nao Sena Medal','Vayu Sena Medal','Mention in Despatches','Other')),
  year int check (year is null or year between 1947 and 2100),
  posthumous boolean not null default false,
  citation text,
  citation_verbatim boolean not null default false,
  gazette_ref text,
  created_at timestamptz not null default now()
);
create index awards_martyr_idx on public.awards (martyr_id);
create index awards_name_idx on public.awards (name);

create table public.martyr_memorials (
  martyr_id uuid not null references public.martyrs(id) on delete cascade,
  memorial_id uuid not null references public.memorials(id) on delete cascade,
  primary key (martyr_id, memorial_id)
);
create index martyr_memorials_memorial_idx on public.martyr_memorials (memorial_id);

-- ===== Media =====
create table public.media (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'photo' check (kind in ('photo','document','video')),
  title text not null,
  description text,
  url text not null,
  storage_path text,
  width int,
  height int,
  credit text,
  license public.media_license not null default 'unverified',
  license_detail text,
  source_url text,
  martyr_id uuid references public.martyrs(id) on delete set null,
  memorial_id uuid references public.memorials(id) on delete set null,
  war_id uuid references public.wars(id) on delete set null,
  verification public.verification_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index media_martyr_idx on public.media (martyr_id);
create index media_memorial_idx on public.media (memorial_id);
create index media_war_idx on public.media (war_id);

alter table public.wars add constraint wars_hero_media_fk foreign key (hero_media_id) references public.media(id) on delete set null;
alter table public.memorials add constraint memorials_hero_media_fk foreign key (hero_media_id) references public.media(id) on delete set null;
alter table public.martyrs add constraint martyrs_portrait_media_fk foreign key (portrait_media_id) references public.media(id) on delete set null;

-- ===== Editorial integrity rules =====
create or replace function public.enforce_primary_source()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.verification = 'verified' then
    if not exists (select 1 from jsonb_array_elements(coalesce(new.sources, '[]'::jsonb)) s where s ->> 'tier' = 'primary') then
      raise exception 'A record cannot be verified without at least one primary source';
    end if;
    if new.verified_at is null then new.verified_at = now(); end if;
  else
    new.verified_at = null;
  end if;
  return new;
end; $$;

create or replace function public.enforce_award_status()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.posthumous and exists (select 1 from public.martyrs where id = new.martyr_id and status = 'survived') then
    raise exception 'A posthumous award cannot be attached to a recipient who survived';
  end if;
  return new;
end; $$;

create or replace function public.enforce_martyr_status()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.status = 'survived' and exists (select 1 from public.awards where martyr_id = new.id and posthumous) then
    raise exception 'This recipient has a posthumous award; they cannot be marked as survived';
  end if;
  return new;
end; $$;

create or replace function public.enforce_media_license()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.verification = 'verified' and new.license = 'unverified' then
    raise exception 'Media cannot be verified while its licence is unverified';
  end if;
  if new.license in ('GODL-India','CC-BY','CC-BY-SA') and coalesce(btrim(new.credit), '') = '' then
    raise exception 'This licence requires an attribution credit';
  end if;
  return new;
end; $$;

create trigger wars_primary_source before insert or update on public.wars for each row execute function public.enforce_primary_source();
create trigger memorials_primary_source before insert or update on public.memorials for each row execute function public.enforce_primary_source();
create trigger martyrs_primary_source before insert or update on public.martyrs for each row execute function public.enforce_primary_source();
create trigger martyrs_status_rule before update of status on public.martyrs for each row execute function public.enforce_martyr_status();
create trigger awards_status_rule before insert or update on public.awards for each row execute function public.enforce_award_status();
create trigger media_license_rule before insert or update on public.media for each row execute function public.enforce_media_license();

create trigger wars_touch before update on public.wars for each row execute function public.touch_updated_at();
create trigger memorials_touch before update on public.memorials for each row execute function public.touch_updated_at();
create trigger martyrs_touch before update on public.martyrs for each row execute function public.touch_updated_at();
create trigger media_touch before update on public.media for each row execute function public.touch_updated_at();

-- ===== Grants & RLS: archive content =====
grant select on public.wars, public.memorials, public.martyrs, public.awards, public.martyr_memorials, public.media to anon;
grant select, insert, update, delete on public.wars, public.memorials, public.martyrs, public.awards, public.martyr_memorials, public.media to authenticated;
grant all on public.wars, public.memorials, public.martyrs, public.awards, public.martyr_memorials, public.media to service_role;

alter table public.wars enable row level security;
alter table public.memorials enable row level security;
alter table public.martyrs enable row level security;
alter table public.awards enable row level security;
alter table public.martyr_memorials enable row level security;
alter table public.media enable row level security;

create policy "Published conflicts are public" on public.wars for select to anon, authenticated
  using (verification = 'verified' or public.is_editor(auth.uid()));
create policy "Editors write conflicts" on public.wars for all to authenticated
  using (public.is_editor(auth.uid())) with check (public.is_editor(auth.uid()));

create policy "Published memorials are public" on public.memorials for select to anon, authenticated
  using (verification = 'verified' or public.is_editor(auth.uid()));
create policy "Editors write memorials" on public.memorials for all to authenticated
  using (public.is_editor(auth.uid())) with check (public.is_editor(auth.uid()));

create policy "Published recipients are public" on public.martyrs for select to anon, authenticated
  using (verification = 'verified' or public.is_editor(auth.uid()));
create policy "Editors write recipients" on public.martyrs for all to authenticated
  using (public.is_editor(auth.uid())) with check (public.is_editor(auth.uid()));

create policy "Awards follow their recipient" on public.awards for select to anon, authenticated
  using (exists (select 1 from public.martyrs m where m.id = martyr_id));
create policy "Editors write awards" on public.awards for all to authenticated
  using (public.is_editor(auth.uid())) with check (public.is_editor(auth.uid()));

create policy "Memorial links follow their recipient" on public.martyr_memorials for select to anon, authenticated
  using (exists (select 1 from public.martyrs m where m.id = martyr_id));
create policy "Editors write memorial links" on public.martyr_memorials for all to authenticated
  using (public.is_editor(auth.uid())) with check (public.is_editor(auth.uid()));

create policy "Published media is public" on public.media for select to anon, authenticated
  using (verification = 'verified' or public.is_editor(auth.uid()));
create policy "Editors write media" on public.media for all to authenticated
  using (public.is_editor(auth.uid())) with check (public.is_editor(auth.uid()));

-- ===== Corrections from the public =====
create table public.corrections (
  id uuid primary key default gen_random_uuid(),
  record_type text not null default 'recipient' check (record_type in ('recipient','memorial','conflict','media','other')),
  record_slug text check (record_slug is null or char_length(record_slug) <= 200),
  field text not null default 'other' check (char_length(field) <= 60),
  details text not null check (char_length(details) between 10 and 4000),
  source_url text check (source_url is null or char_length(source_url) <= 500),
  email text check (email is null or char_length(email) <= 255),
  status public.correction_status not null default 'new',
  editor_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant insert on public.corrections to anon;
grant select, insert, update, delete on public.corrections to authenticated;
grant all on public.corrections to service_role;
alter table public.corrections enable row level security;
create policy "Anyone can submit a correction" on public.corrections for insert to anon, authenticated
  with check (status = 'new' and editor_notes is null);
create policy "Editors review corrections" on public.corrections for select to authenticated using (public.is_editor(auth.uid()));
create policy "Editors update corrections" on public.corrections for update to authenticated
  using (public.is_editor(auth.uid())) with check (public.is_editor(auth.uid()));
create policy "Editors delete corrections" on public.corrections for delete to authenticated using (public.is_editor(auth.uid()));
create trigger corrections_touch before update on public.corrections for each row execute function public.touch_updated_at();

-- ===== Engagement metrics (KPIs) =====
create table public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null check (char_length(path) <= 300),
  created_at timestamptz not null default now()
);
create index page_views_created_idx on public.page_views (created_at desc);
grant insert on public.page_views to anon;
grant select, insert on public.page_views to authenticated;
grant all on public.page_views to service_role;
alter table public.page_views enable row level security;
create policy "Anyone records a page view" on public.page_views for insert to anon, authenticated with check (true);
create policy "Editors read page views" on public.page_views for select to authenticated using (public.is_editor(auth.uid()));

create table public.search_logs (
  id uuid primary key default gen_random_uuid(),
  query text not null check (char_length(query) <= 200),
  filters jsonb not null default '{}'::jsonb,
  results int not null default 0,
  created_at timestamptz not null default now()
);
create index search_logs_created_idx on public.search_logs (created_at desc);
grant insert on public.search_logs to anon;
grant select, insert on public.search_logs to authenticated;
grant all on public.search_logs to service_role;
alter table public.search_logs enable row level security;
create policy "Anyone records a search" on public.search_logs for insert to anon, authenticated with check (true);
create policy "Editors read searches" on public.search_logs for select to authenticated using (public.is_editor(auth.uid()));