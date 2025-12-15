# Listing API Documentation

## Overview

The listing creation API has been implemented to handle both "mart" (product) listings and "task" listings. The implementation includes validation, database models, and Supabase integration for image/video storage.

## API Endpoints

### 1. Create Listing
**POST** `/api/listings`

Creates a new listing (mart item or task).

**Request Body:**
```json
{
  "userId": "string (required)",
  "type": "mart" | "task",
  "title": "string (required, 3-200 characters)",
  "description": "string (required, 10-2000 characters)",
  "price": "number (required, >= 0)",
  "location": "string (required, 2-200 characters)",
  "categoryId": "string (required)",
  "tags": "string (optional, max 500 characters)",
  "images": ["string"] // Array of 3-5 image/video URLs (R2 CDN URLs) (required)
}
```

**Response (201):**
```json
{
  "message": "Listing created successfully",
  "listing": {
    "id": "string",
    "userId": "string",
    "type": "mart" | "task",
    "title": "string",
    "description": "string",
    "price": "number",
    "location": "string",
    "categoryId": "string",
    "tags": "string | null",
    "images": ["string"],
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
}
```

**Validation Rules:**
- Minimum 3 images/videos required
- Maximum 5 images/videos allowed
- All image URLs must be valid HTTP/HTTPS URLs
- User must exist in the database

### 2. Get Listing by ID
**GET** `/api/listings/:id`

Retrieves a listing with user information.

**Response (200):**
```json
{
  "id": "string",
  "userId": "string",
  "type": "mart" | "task",
  "title": "string",
  "description": "string",
  "price": "number",
  "location": "string",
  "categoryId": "string",
  "tags": "string | null",
  "images": ["string"],
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string",
  "user": {
    "id": "string",
    "name": "string | null",
    "email": "string",
    "image": "string | null"
  }
}
```

### 3. Get Listings by User ID
**GET** `/api/listings/user/:userId`

Retrieves all listings for a specific user.

### 4. Get Listings by Type
**GET** `/api/listings/type/:type`

Retrieves all listings of a specific type (`mart` or `task`).

## Image/Video Upload Strategy

### ⚠️ IMPORTANT: Use Cloudflare R2, NOT Supabase Storage

**All media files (images/videos) must be uploaded to Cloudflare R2 via the backend API.**

Supabase Storage is **NOT** used for media delivery. Supabase is only used for database/metadata storage.

### Upload Flow

1. Frontend sends file to backend: `POST /api/upload/single`
2. Backend streams file to Cloudflare R2
3. Backend returns R2 CDN URL (e.g., `https://pub-xxxx.r2.dev/images/xxx.jpg`)
4. Frontend stores R2 URL in database when creating listing

### Benefits of R2

- **10GB FREE storage** monthly
- **Unlimited FREE egress** (no bandwidth costs)
- Fast global CDN delivery
- Zero surprise bills

See `MEDIA_ARCHITECTURE.md` for complete setup instructions.

---

### ~~Old Recommendation (DEPRECATED)~~

~~It was previously recommended to handle image/video uploads directly from the frontend to Supabase Storage for the following reasons:~~

1. **Better User Experience**: Users can see upload progress immediately
2. **Less Server Load**: Backend doesn't need to process file uploads
3. **Scalability**: Direct uploads to Supabase are more efficient
4. **Parallel Uploads**: Multiple files can be uploaded simultaneously

### Frontend Implementation Steps

1. **Install Supabase Client** (if not already installed):
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Create Supabase Client**:
   ```typescript
   import { createClient } from '@supabase/supabase-js';

   const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
   const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

   export const supabase = createClient(supabaseUrl, supabaseAnonKey);
   ```

3. **Upload Images**:
   ```typescript
   const uploadImage = async (file: File | Blob, fileName: string) => {
     const { data, error } = await supabase.storage
       .from('listings')
       .upload(`listings/${userId}/${fileName}`, file, {
         contentType: file.type,
       });

     if (error) throw error;

     const { data: urlData } = supabase.storage
       .from('listings')
       .getPublicUrl(data.path);

     return urlData.publicUrl;
   };
   ```

4. **Validate and Send to Backend**:
   - Upload 3-5 images/videos
   - Get the public URLs
   - Send the URLs in the `images` array to the backend API

### Backend Upload (Alternative)

If you prefer backend uploads, the Supabase client is already configured in `backend/src/lib/supabase.ts`. You would need to:

1. Accept multipart/form-data in the controller
2. Use a library like `multer` to handle file uploads
3. Upload files to Supabase using the utility functions
4. Return the URLs to the frontend

However, this approach is **not recommended** for production due to the drawbacks mentioned above.

## Database Setup

### Prisma Migration

After updating the schema, run:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

This will:
1. Generate the Prisma client with the new Listing model
2. Create the `listings` table in your database

### Environment Variables

Add to `backend/.env`:

```env
# Required
DATABASE_URL="postgresql://..."

# Optional (only if using backend uploads)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
```

For frontend uploads, add to your frontend `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

## Supabase Storage Setup

1. **Create Storage Bucket**:
   - Go to Supabase Dashboard → Storage
   - Create a new bucket named `listings`
   - Set it to public (or configure RLS policies)

2. **Set Up RLS Policies** (Recommended):
   ```sql
   -- Allow authenticated users to upload
   CREATE POLICY "Users can upload their own listings"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'listings');

   -- Allow public read access
   CREATE POLICY "Public can read listings"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'listings');
   ```

## Authentication Note

Currently, the API requires `userId` in the request body. This should be replaced with proper authentication middleware in the future:

1. Implement JWT authentication
2. Create auth middleware to extract user from token
3. Remove `userId` from request body
4. Use `req.user.id` from the middleware

## Error Handling

The API returns appropriate HTTP status codes:
- `201` - Listing created successfully
- `200` - Success (GET requests)
- `400` - Validation error
- `404` - User or listing not found
- `500` - Server error

Error response format:
```json
{
  "error": "Error message",
  "statusCode": 400
}
```

## Example Frontend Request

```typescript
// After uploading images to Supabase and getting URLs
const createListing = async () => {
  const response = await api.post('/api/listings', {
    userId: user.id, // From auth store
    type: listingType, // 'mart' or 'task'
    title,
    description,
    price: parseFloat(price),
    location,
    categoryId: selectedCategory,
    tags: tags || undefined,
    images: imageUrls, // Array of 3-5 Supabase URLs
  });

  return response.data;
};
```

## File Structure

```
backend/src/
├── controllers/
│   └── listingController.ts    # Business logic
├── models/
│   └── Listing.ts              # Data access layer
├── routes/
│   └── listing.ts              # Route definitions
├── types/
│   └── listing.ts              # TypeScript interfaces
└── lib/
    └── supabase.ts             # Supabase client (optional for backend uploads)
```

