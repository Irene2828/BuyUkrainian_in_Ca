# BuyUkrainian.ca

BuyUkrainian.ca is a community directory for finding and sharing Ukrainian products sold in Canadian stores.

The site provides:

- An interactive store map and list view.
- Search by store, city, province, and product, including common Ukrainian and English spellings.
- Store submissions and community-oriented listing workflows.
- English, Ukrainian, and French interface translations.
- Store filtering by province and category.

## Technology

- React and TypeScript
- Vite
- Express
- Wouter
- Google Maps
- Supabase/PostgreSQL
- Tailwind CSS
- React Query

## Requirements

- Node.js
- npm
- A database connection
- A Google Maps browser API key

## Local development

Install dependencies:

```bash
npm install
```

Create `.env.local` using `.env.example` as a template. Set the database and Google Maps values, for example:

```env
DATABASE_URL="your_database_connection_string"
DIRECT_URL="your_direct_database_connection_string"
VITE_GOOGLE_MAPS_API_KEY="your_google_maps_browser_key"
PORT=3000
```

Start the full local application:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

```bash
npm run dev           # Start the development server
npm run dev:client   # Start the Vite client server on port 5173
npm run check        # Run the TypeScript check
npm run build        # Build the application
npm run vercel-build # Build the Vercel client output
npm run start        # Start the production server
npm run db:push      # Push the database schema
```

Do not commit `.env.local` or other files containing credentials.

## Deployment

The project is configured for Vercel with:

- Build command: `npm run vercel-build`
- Output directory: `dist/public`

Set the required environment variables in the Vercel project settings before deploying. A push to the connected production branch triggers a deployment.

## Project structure

```text
api/        Server routes and database access
client/     React application
script/     Build scripts
vercel.json Vercel configuration
```

## Repository notes

The main application source is under `client/src`. Shared search and localization helpers are under `client/src/lib`.
