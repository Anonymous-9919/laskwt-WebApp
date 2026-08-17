-- Step 1: Drop ALL existing policies on profiles
do $$
declare
  pol record;
begin
  for pol in
    select policyname from pg_policies where tablename = 'profiles' and schemaname = 'public'
  loop
    execute format('drop policy if exists "%s" on public.profiles', pol.policyname);
  end loop;
end $$;

-- Step 2: Create the safe helper function
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

-- Step 3: Recreate safe policies
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles_admin_read" on public.profiles
  for select using (public.is_admin(auth.uid()));

create policy "profiles_admin_update" on public.profiles
  for update using (public.is_admin(auth.uid()));
