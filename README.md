# Work to Parents

iPad PWA for photographing student work and emailing it to parents.

No face recognition. Photos stay in memory then are discarded.

The roster (name, parent email, notes) stays on this iPad in browser storage.

## Classroom flow

1. Safari: Add to Home Screen.
2. Take photo of the paper.
3. Tap the student. Confirm.
4. Send with Gmail if signed in. Otherwise use Share from iPad or Download.
A mail link cannot attach files on iOS; this app does not pretend it can.

CSV import/export columns: name, parent_email, notes.
Empty roster explains import. Sample names must include EXAMPLE.
See public/sample-roster.csv.

## Run

Use package.json scripts: install, then the dev script, then the build script. Node 20+. No backend for v1.
Copy .env.example to .env and set VITE_GOOGLE_CLIENT_ID, then rebuild.

## Google Cloud setup (preferred Gmail send)

Set VITE_GOOGLE_CLIENT_ID to a Web application OAuth client id, then rebuild.
In Google Cloud: enable Gmail API; consent screen (Internal for Workspace schools);
scopes gmail.send and userinfo.email; authorized JavaScript origins with no path:
http://localhost:5173 , http://localhost:4173 , and the https production origin.
Redirect URIs are not required for the GIS token-client flow.
The token is session-only. Photos are not stored; they attach only at send time.

## Stack

Vite, vanilla TypeScript, Vite PWA plugin (manifest + service worker). No App Store.

## Live site (iPad)



https://mbjah808.github.io/work-to-parents/



On the iPad: Safari, open that link, then Share, Add to Home Screen.
