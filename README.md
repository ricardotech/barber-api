# Barber Backend API

Backend API for the Barber application built with Node.js, Express, TypeORM, and PostgreSQL.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   - Copy `.env.example` to `.env`
   - Update database credentials and other settings

3. **Database Setup:**
   ```bash
   # Create PostgreSQL database
   createdb barber_db
   
   # Run migrations (after creating entities)
   npm run typeorm migration:run
   ```

4. **Development:**
   ```bash
   npm run dev
   ```

5. **Production:**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

- `GET /health` - Health check
- `GET /api` - API status

## Project Structure

```
src/
├── controllers/     # Route handlers
├── entities/       # TypeORM entities
├── middleware/     # Auth, validation, error handling
├── routes/         # API route definitions
├── services/       # Business logic layer
├── utils/          # Helper functions
├── config/         # Database and app configuration
└── app.ts          # Express application entry point
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run typeorm` - TypeORM CLI commands