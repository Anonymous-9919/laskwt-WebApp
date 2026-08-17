-- ============================================================
-- FIX: Infinite recursion in profiles RLS policies
-- Creates a SECURITY DEFINER helper to break the cycle.
-- Run in Supabase SQL Editor.
-- ============================================================

-- 1. Create helper function that bypasses RLS
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = uid and role = 'admin'
  );
$$;

-- 2. Drop the self-referencing policies on profiles
drop policy if exists "profiles_admin_read" on public.profiles;
drop policy if exists "profiles_admin_update" on public.profiles;

-- 3. Re-create using the safe helper function
create policy "profiles_admin_read" on public.profiles
  for select using (public.is_admin(auth.uid()));

create policy "profiles_admin_update" on public.profiles
  for update using (public.is_admin(auth.uid()));

-- 4. Optionally update other tables' admin policies for consistency
-- (these don't recurse since they're on different tables, but using
-- the helper is cleaner and avoids future issues)

-- style_options
drop policy if exists "style_options_admin" on public.style_options;
create policy "style_options_admin" on public.style_options
  for all using (public.is_admin(auth.uid()));

-- audit_log
drop policy if exists "audit_admin_read" on public.audit_log;
create policy "audit_admin_read" on public.audit_log
  for select using (public.is_admin(auth.uid()));

-- business_profile
drop policy if exists "business_profile_admin" on public.business_profile;
create policy "business_profile_admin" on public.business_profile
  for all using (public.is_admin(auth.uid()));
