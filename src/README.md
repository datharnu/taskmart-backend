# Backend Architecture

This backend follows a clean architecture pattern with separation of concerns.

## Project Structure

```
src/
├── controllers/       # Business logic handlers
│   └── authController.ts
├── routes/            # Route definitions (thin layer)
│   └── auth.ts
├── middlewares/       # Express middlewares
│   ├── errorHandler.ts
│   └── asyncHandler.ts
├── models/           # Data access layer (Prisma models)
│   └── User.ts
├── types/            # TypeScript type definitions
│   ├── auth.ts
│   └── errors.ts
├── utils/            # Utility functions
│   ├── validation.ts
│   └── password.ts
├── errors/           # Custom error classes
│   └── AppError.ts
├── lib/              # Library configurations
│   └── prisma.ts
└── server.ts         # Express app entry point
```

## Architecture Layers

### Controllers (`controllers/`)
- Contains business logic
- Handles request/response
- Uses models for data access
- Uses utils for helper functions
- Throws custom errors

### Routes (`routes/`)
- Thin layer that defines endpoints
- Maps HTTP methods to controller methods
- Uses asyncHandler middleware for error handling

### Middlewares (`middlewares/`)
- `errorHandler.ts`: Global error handling middleware
- `asyncHandler.ts`: Wraps async route handlers to catch errors

### Models (`models/`)
- Data access layer
- Abstracts Prisma queries
- Returns typed data

### Types (`types/`)
- TypeScript interfaces and types
- Request/Response types
- Shared type definitions

### Utils (`utils/`)
- Reusable utility functions
- Validation helpers
- Password hashing/comparison
- Other helper functions

### Errors (`errors/`)
- Custom error classes
- Extends base AppError
- Includes: ValidationError, ConflictError, NotFoundError, etc.

## Usage Example

### Adding a New Route

1. **Define Types** (`types/`)
```typescript
// types/user.ts
export interface GetUserRequest {
  id: string;
}
```

2. **Create Model Methods** (`models/`)
```typescript
// models/User.ts
static async findById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}
```

3. **Create Controller** (`controllers/`)
```typescript
// controllers/userController.ts
static async getUser(req: Request, res: Response) {
  const { id } = req.params;
  const user = await UserModel.findById(id);
  if (!user) throw new NotFoundError('User not found');
  res.json(user);
}
```

4. **Define Route** (`routes/`)
```typescript
// routes/user.ts
router.get('/:id', asyncHandler(UserController.getUser));
```

5. **Register Route** (`server.ts`)
```typescript
app.use('/api/users', userRoutes);
```

## Error Handling

Errors are handled through the errorHandler middleware:
- Custom errors (AppError subclasses) return appropriate status codes
- Unexpected errors return 500 with generic message
- All errors are logged

## Database Migrations

Migrations are handled by Prisma:
```bash
npm run prisma:migrate    # Create and run migration
npm run prisma:generate   # Generate Prisma client
npm run prisma:studio     # Open Prisma Studio
```






