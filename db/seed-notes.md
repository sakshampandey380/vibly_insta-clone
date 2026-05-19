# Demo Seed Notes

Phase 1 ships with frontend demo content and a backend in-memory runtime store that hashes the demo password with `bcrypt` at server startup.

Demo backend credentials:

- Username: `ariana.glow`
- Password: `demo12345`

The SQL schema is production-ready for MySQL, while the seed experience for this phase is handled inside [server/src/data/store.ts](/c:/Users/pande/OneDrive/Desktop/Vibley%20-%20Insta_Clone/server/src/data/store.ts:1) so the app stays runnable before database wiring is completed.
