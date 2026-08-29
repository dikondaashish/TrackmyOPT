-- Keep tracker ownership immutable through the authenticated Data API.
drop policy if exists "Users can update their own job applications" on public.job_applications;

create policy "Users can update their own job applications"
    on public.job_applications
    for update
    to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);
