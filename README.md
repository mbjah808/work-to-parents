# Class Photo Wall

Mobile-first PWA for classroom iPads: take a photo then it appears on a shared class photo wall.

**No student roster. No tapping names. No Gmail send for the core flow.**

Parents open one gallery link and enter the class PIN.

Live site: https://mbjah808.github.io/work-to-parents/

## Classroom flow

1. **Teacher (iPad Safari):** open the site, Share, Add to Home Screen.
2. First launch: create a **class PIN** (4+ characters). Share that PIN with families.
3. Tap **Take photo** (rear camera) or **Choose from Photos**.
4. Optional short caption, then **Upload** (or **Upload without caption** for a fast path).
5. Photos show on a masonry **photo wall**, newest first. Tap a photo for full-screen view.

Parents use the same link and PIN to view (v1 uses one shared class PIN for view and upload).

## Privacy (classroom-trust)

The PIN is a soft gate stored as a SHA-256 hash in the browser (localStorage). It is **not** bank-grade auth.

- Share the gallery link and PIN only with your class families.
- For cloud mode, anyone with the Supabase anon key in the built JS can call the API; treat this as a trusted-classroom MVP.

## Storage

- **Local demo** (default): IndexedDB on that device only when Supabase env vars are unset.
- **Cloud**: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY at build time. Photos go to Supabase Storage bucket `class-photos` plus a `photos` table.

## Run locally
Use package scripts: install, then the dev script, then the build script. Node 20+.
Vite base is /work-to-parents/ for GitHub Pages.

## Cloud gallery

Optional shared gallery: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, create public bucket class-photos, apply docs/supabase-setup.sql. Without env vars the app uses IndexedDB demo mode on this device.

## Stack

Vite, vanilla TypeScript, Vite PWA. Roster, CSV, and Gmail send were removed from the core product.
