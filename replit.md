# BlueYellow.ca - Ukrainian Products Discovery Platform

## Overview

BlueYellow.ca is a community-driven platform designed to help people discover Ukrainian-made products sold across Canada. The application features an interactive map showing store locations, product listings, and a submission system for users to add new stores. Built with a mobile-first approach, the platform connects the Ukrainian diaspora in Canada with local businesses and authentic products from home.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React with TypeScript as the primary UI framework
- Vite as the build tool and development server
- Mobile-first responsive design philosophy

**UI Component System**
- Shadcn/ui component library with Radix UI primitives
- Tailwind CSS v4 for styling with custom design tokens
- Framer Motion for animations and transitions
- Custom theming system with Ukrainian flag colors (blue #1E90FF and yellow #FFD700)

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management
- React Hook Form with Zod validation for form handling
- Wouter for lightweight client-side routing

**Mapping Solution**
- Leaflet for interactive maps
- React-Leaflet for React integration
- OpenStreetMap tile layer as the base map
- Nominatim API for geocoding addresses to coordinates
- Custom Ukrainian flag-themed map markers (blue/yellow circular icons)
- Marker clustering via leaflet.markercluster when zoomed out
- "Find Near Me" geolocation feature with Canada bounds validation

**UX Features**
- Dark/light mode toggle with system preference detection (next-themes)
- Loading skeleton states for map and store cards during data fetch
- Collapsible store submission forms
- AI-generated share text with platform-specific copy (X/Twitter, Facebook, Instagram)
- Social sharing buttons with native share API fallback
- Error pages (404, 500) with Ukrainian-themed styling

**Anti-Bot Protection**
- Honeypot field ("website") in submission forms - must be empty or submission is rejected

### Backend Architecture

**Server Framework**
- Express.js running on Node.js
- HTTP server using native Node.js http module
- TypeScript throughout the backend

**API Design**
- RESTful API endpoints following resource-based patterns
- Endpoints:
  - `GET /api/stores` - Fetch approved stores (public)
  - `GET /api/admin/stores` - Fetch all stores including pending (admin)
  - `POST /api/stores` - Submit new store for review
  - `PUT /api/stores/:id/status` - Update store approval status (admin)

**Database Layer**
- PostgreSQL as the primary database (via Neon serverless)
- Drizzle ORM for type-safe database queries
- Schema-first approach with database migrations managed through Drizzle Kit
- Storage abstraction layer (`IStorage` interface) for potential future database swapping

**Data Models**
- **Stores**: Core entity containing name, description, products array, address, coordinates (lat/lng), category (retail/food/other), optional image URL, optional email, approval status (pending/approved/rejected)
- **Users**: Placeholder for future authentication (currently not implemented)

**Content Moderation Workflow**
- Three-state approval system: pending → approved/rejected
- New submissions default to "pending" status
- Only approved stores appear on the public map
- Admin dashboard for reviewing pending submissions

### Build & Deployment

**Production Build Process**
- Custom build script using esbuild for server bundling
- Vite handles client-side bundling with code splitting
- Server dependencies are selectively bundled (allowlist approach) to reduce cold start times
- Static assets served from `dist/public` directory

**Environment Configuration**
- `DATABASE_URL` required for database connection
- Separate development and production modes
- Replit-specific integrations (dev banner, cartographer) only in development

**Development Workflow**
- Hot module replacement (HMR) via Vite
- Server-side rendering of index.html with dynamic template injection
- Concurrent client and server development using separate processes

### Security & Validation

**Input Validation**
- Zod schemas for runtime type validation
- Drizzle-Zod integration for database-aligned validation
- Server-side validation on all API endpoints
- Coordinate validation (ensures locations are within Canada bounds: lat 40-85, lng -140 to -50)

**Error Handling**
- Custom error messages using zod-validation-error for user-friendly feedback
- Graceful fallbacks for geocoding failures (defaults to Toronto coordinates)
- Request logging middleware for debugging

## External Dependencies

### Third-Party Services

**Mapping & Geocoding**
- OpenStreetMap Nominatim API for address-to-coordinate conversion
- OpenStreetMap tile servers for map rendering
- No API key required (free tier usage)

**Database**
- Neon serverless PostgreSQL (@neondatabase/serverless)
- Connection pooling via WebSocket for serverless environments

**Image Hosting**
- Unsplash for placeholder/example images in seed data
- User-submitted images stored as URLs (external hosting required)

### Key npm Dependencies

**Frontend Core**
- react, react-dom
- @tanstack/react-query
- wouter (routing)
- leaflet, react-leaflet
- framer-motion

**UI Components**
- @radix-ui/* (various primitives)
- tailwindcss
- lucide-react (icons)

**Forms & Validation**
- react-hook-form
- @hookform/resolvers
- zod
- drizzle-zod

**Backend Core**
- express
- drizzle-orm
- ws (WebSocket for Neon)

**Development Tools**
- typescript
- vite
- esbuild
- drizzle-kit
- tsx (TypeScript execution)

### Replit-Specific Integrations

- @replit/vite-plugin-runtime-error-modal
- @replit/vite-plugin-cartographer (dev only)
- @replit/vite-plugin-dev-banner (dev only)
- Custom vite-plugin-meta-images for OpenGraph image URL injection