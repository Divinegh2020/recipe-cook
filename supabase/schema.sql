create extension if not exists pgcrypto;

create table if not exists public.cookbooks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  price_usd numeric(10,2) not null check (price_usd > 0),
  cover_path text,
  pdf_path text not null,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  cookbook_id uuid not null references public.cookbooks(id) on delete restrict,
  email text not null,
  amount_usd numeric(10,2) not null check (amount_usd > 0),
  status text not null default 'pending' check (status in ('pending','paid','failed','underpaid','expired','refunded')),
  bachs_checkout_id text,
  bachs_reference text unique,
  access_token_hash text not null,
  bachs_event_id text unique,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists orders_email_idx on public.orders(email);
create index if not exists orders_cookbook_idx on public.orders(cookbook_id);
create index if not exists orders_status_idx on public.orders(status);

alter table public.cookbooks enable row level security;
alter table public.orders enable row level security;

create policy "Published cookbooks are public"
on public.cookbooks for select
to anon, authenticated
using (published = true);

do $$
begin
  if not exists (select 1 from storage.buckets where id = 'cookbooks') then
    insert into storage.buckets (id, name, public) values ('cookbooks', 'cookbooks', false);
  end if;
  if not exists (select 1 from storage.buckets where id = 'covers') then
    insert into storage.buckets (id, name, public) values ('covers', 'covers', true);
  end if;
end $$;

create policy "Public can read cookbook covers"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'covers');