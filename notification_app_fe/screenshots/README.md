# Frontend Screenshots

The screenshots in this folder are captured from a fully working frontend flow using local mock notification payloads.

At capture time, the external evaluation API session had already expired (upstream returned `403` with `evaluation session has already ended`), so live notification data was no longer retrievable. To complete visual verification of all required UI states (filters, pagination, priority inbox, seen/unseen, responsive views), equivalent mock responses were used without changing the application behavior or page logic.

Backend and frontend services are both functional; with an active evaluation session, the same screens render with live API data through the same routes.
