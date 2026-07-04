z- [ ] Locate all admin auth/redirect logic (completed: search + inspected app/admin/page.tsx, lib/auth/session.ts)
- [x] Add temporary logging to admin auth guard (remove later)
- [x] Replace redirect-to-/account logic with: configuration error if ADMIN_EMAIL missing; else log mismatch details and redirect
- [ ] Ensure customer auth flow remains unchanged
- [ ] Run `npm run lint` and `npm run build`
- [ ] Remove temporary logging after verification
- [ ] Re-run `npm run lint` and `npm run build`


