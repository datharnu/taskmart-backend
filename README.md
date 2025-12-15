# TaskMart Backend

Backend API for TaskMart application built with Express.js, Prisma, and PostgreSQL.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root of the backend directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/taskmart?schema=public"
   PORT=3000
   NODE_ENV=development
   ```

3. **Set up PostgreSQL database:**
   - Make sure PostgreSQL is installed and running
   - Create a database named `taskmart` (or update the DATABASE_URL accordingly)

4. **Initialize Prisma:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:push` - Push schema changes to database without migrations

## Project Structure

```
backend/
├── src/
│   └── server.ts          # Main Express server
├── prisma/
│   └── schema.prisma      # Prisma schema definition
├── dist/                  # Compiled JavaScript (generated)
├── .env                   # Environment variables (create this)
├── .gitignore
├── package.json
└── tsconfig.json
```







