# CIRS – Civic Issue Reporting System

A college-level full-stack civic complaint management system with Citizen, Officer and Admin roles.

## Stack
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js + Express
- Database: PostgreSQL / Supabase PostgreSQL
- Authentication: JWT + bcrypt
- Image storage: Cloudinary
- Maps: Google Maps + Browser Geolocation
- Testing: Postman
- Deployment: Render

## Local setup

### 1. Database
Create a PostgreSQL/Supabase database and run:
`database/schema.sql`
then:
`database/seed.sql`

### 2. Backend
```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and fill in your values.

Start:
```bash
npm start
```

Backend runs on `http://localhost:5000`.

### 3. Frontend
The frontend is static. Open `frontend/index.html` with VS Code Live Server (recommended) or any static server.

If using Live Server, the default URL is commonly `http://127.0.0.1:5500/frontend/`.

### Demo credentials
- Citizen: citizen@cirs.com / Citizen@123
- Officer: officer@cirs.com / Officer@123
- Admin: admin@cirs.com / Admin@123

These are seeded bcrypt hashes; change them for production.

## Cloudinary
Create a Cloudinary account and put the cloud name, API key and API secret in `.env`.

## Google Maps
Create a Google Maps JavaScript API key and set `GOOGLE_MAPS_API_KEY`. Restrict the key by HTTP referrer in production.

## Render
Deploy the `backend` directory as a Node web service. Set the environment variables from `.env.example`. Render provides `PORT`; the server uses it automatically.

## Security
Do not commit `.env`, real API keys, JWT secrets or database credentials.

## API
See `postman/CIRS_API.postman_collection.json`.

## Architecture
Browser → Express REST API → JWT/RBAC → PostgreSQL
                         ↘ Cloudinary
                         ↘ Google Maps
