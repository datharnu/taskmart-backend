# Fix Prisma Connection Error: "Error { kind: Closed, cause: None }"

## The Problem

You're getting:
```
prisma:error Error in PostgreSQL connection: Error { kind: Closed, cause: None }
```

This means Prisma can't maintain a connection to PostgreSQL. The connection is being closed, often due to:
- PostgreSQL service not running
- Connection timeout (idle connections being closed)
- Incorrect DATABASE_URL
- Database server unreachable

## Quick Fixes

### 1. Check PostgreSQL is Running

**Mac:**
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL if not running
brew services start postgresql@14
# or
brew services start postgresql
```

**Linux:**
```bash
# Check status
sudo systemctl status postgresql

# Start if stopped
sudo systemctl start postgresql
```

**Windows:**
- Open Services (Win + R → `services.msc`)
- Find "PostgreSQL" service
- Right-click → Start if stopped

### 2. Verify DATABASE_URL in backend/.env

Check your `backend/.env` file has the correct DATABASE_URL:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/taskmart?schema=public"
```

**Common issues:**
- Wrong username/password
- Wrong database name
- Wrong port (default is 5432)
- Database doesn't exist

### 3. Add Connection Pool Parameters

Add connection pool settings to your DATABASE_URL to prevent timeouts:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/taskmart?schema=public&connection_limit=10&pool_timeout=20"
```

**Parameters explained:**
- `connection_limit=10` - Maximum number of connections in the pool
- `pool_timeout=20` - Timeout in seconds for getting a connection from the pool

### 4. Create Database if It Doesn't Exist

```bash
# Connect to PostgreSQL
psql -U postgres

# List databases
\l

# Create database if it doesn't exist
CREATE DATABASE taskmart;

# Exit
\q
```

### 5. Test Database Connection

```bash
cd backend

# Test connection with Prisma Studio
npm run prisma:studio
```

If Prisma Studio opens, your connection is working!

### 6. Check Connection String Format

**Local PostgreSQL:**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/taskmart?schema=public&connection_limit=10&pool_timeout=20"
```

**Supabase:**
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?schema=public&connection_limit=10&pool_timeout=20"
```

**Render/Railway/Other Cloud:**
Use the connection string provided by your hosting service, and add the pool parameters:
```
?connection_limit=10&pool_timeout=20
```

### 7. Restart Backend Server

After fixing DATABASE_URL:
```bash
# Stop backend (Ctrl+C)
# Then restart
cd backend
npm run dev
```

You should see:
```
✅ Database connection established
```

Instead of connection errors.

## Why This Error Happens

The error occurs **after file uploads** because:
1. File uploads take time (several seconds)
2. During this time, the database connection might become idle
3. PostgreSQL closes idle connections after a timeout
4. When Prisma tries to use the connection, it's already closed

**Solution:** Add connection pool parameters to maintain active connections.

## Verify Fix

After updating your `.env` file:
1. Restart your backend server
2. Try uploading files again
3. Check that listings are created successfully
4. No more Prisma connection errors should appear

