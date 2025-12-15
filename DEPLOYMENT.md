# Render Deployment Guide

## Quick Fix for Current Error

The error occurs because Render is not compiling TypeScript. Follow these steps:

### Option 1: Manual Configuration (Recommended for immediate fix)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your `taskmart-backend` service
3. Go to **Settings** tab
4. Scroll to **Build & Deploy** section
5. Set **Build Command** to:
   ```
   npm install && npm run prisma:generate && npm run build
   ```
6. Set **Start Command** to:
   ```
   npm start
   ```
7. Click **Save Changes**
8. Go to **Manual Deploy** → **Deploy latest commit**

### Option 2: Using render.yaml (After pushing to GitHub)

1. Ensure `render.yaml` is at the root of your `taskmart-backend` repository
2. Commit and push the file:
   ```bash
   git add render.yaml
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```
3. Render should automatically detect and use the configuration

## What the Build Command Does

1. `npm install` - Installs all dependencies
2. `npm run prisma:generate` - Generates Prisma Client
3. `npm run build` - Compiles TypeScript to JavaScript in `dist/` folder

## Verification

After deployment, check the build logs. You should see:
- ✅ `prisma generate` output
- ✅ TypeScript compilation messages
- ✅ `dist/` folder created with compiled files

## Troubleshooting

### Error: Cannot find module '/opt/render/project/src/dist/server.js'

**This error means Render is NOT running the build command!**

The error path `/opt/render/project/src/dist/server.js` is misleading - the real issue is that `dist/server.js` doesn't exist because TypeScript wasn't compiled.

**Solution:**
1. Go to Render Dashboard → Your Service → **Settings**
2. Scroll to **Build & Deploy** section
3. **CRITICAL:** Change **Build Command** from `npm install` to:
   ```
   npm install && npm run prisma:generate && npm run build
   ```
4. **Start Command** should be:
   ```
   npm start
   ```
5. Click **Save Changes**
6. Go to **Manual Deploy** → **Deploy latest commit**

**Verify the build worked:**
After deploying, check the build logs. You should see:
- ✅ `prisma generate` output
- ✅ TypeScript compilation (tsc output)
- ✅ Files in `dist/` folder

If you only see `npm install` output, the build command wasn't updated correctly.

### Error: Prisma Client not generated

Ensure `npm run prisma:generate` is in the build command before `npm run build`.

