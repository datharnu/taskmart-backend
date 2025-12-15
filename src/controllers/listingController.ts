import { Request, Response } from 'express';
import { ListingModel } from '../models/Listing';
import { ValidationError, NotFoundError } from '../errors/AppError';
import { CreateListingRequest, CreateListingResponse } from '../types/listing';
import { UserModel } from '../models/User';

export class ListingController {
  /**
   * Create a new listing
   * NOTE: userId should come from authenticated user (via JWT middleware in future)
   * For now, it's required in the request body
   */
  static async createListing(req: Request, res: Response): Promise<void> {
    const { userId, ...listingData }: CreateListingRequest & { userId: string } = req.body;

    // Validate userId
    if (!userId || !userId.trim()) {
      throw new ValidationError('User ID is required');
    }

    // Verify user exists
    const user = await UserModel.findById(userId.trim());
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Validate listing data
    const validation = validateListingData(listingData);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors.join(', '));
    }

    // Validate images count (minimum 3, maximum 5)
    if (!listingData.images || !Array.isArray(listingData.images)) {
      throw new ValidationError('Images must be an array');
    }

    if (listingData.images.length < 3) {
      throw new ValidationError('Minimum 3 images or videos are required');
    }

    if (listingData.images.length > 5) {
      throw new ValidationError('Maximum 5 images or videos are allowed');
    }

    // Validate each image/video URL (must be Cloudflare R2 CDN URLs)
    const imageUrlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|mp4|mov|avi|webm)$/i;
    for (const imageUrl of listingData.images) {
      if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) {
        throw new ValidationError('All image/video URLs must be valid strings');
      }
      
      // Must be valid HTTP/HTTPS URL
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        throw new ValidationError('All image/video URLs must be valid HTTP/HTTPS URLs');
      }
      
      // Validate URL format (should be R2 CDN URL or valid media URL)
      // R2 URLs typically: https://pub-xxxx.r2.dev/images/xxx.jpg or https://pub-xxxx.r2.dev/videos/xxx.mp4
      if (!imageUrlPattern.test(imageUrl)) {
        throw new ValidationError(`Invalid media URL format: ${imageUrl}. Must be a valid image or video URL`);
      }
    }

    // Create the listing
    const listing = await ListingModel.create(userId.trim(), listingData);

    const response: CreateListingResponse = {
      message: 'Listing created successfully',
      listing: {
        id: listing.id,
        userId: listing.userId,
        type: listing.type as 'mart' | 'task',
        title: listing.title,
        description: listing.description,
        price: listing.price,
        location: listing.location,
        categoryId: listing.categoryId,
        tags: listing.tags || undefined,
        images: listing.images,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
      },
    };

    res.status(201).json(response);
  }

  /**
   * Get listing by ID
   */
  static async getListingById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id || !id.trim()) {
      throw new ValidationError('Listing ID is required');
    }

    const listing = await ListingModel.findByIdWithUser(id.trim());

    if (!listing) {
      throw new NotFoundError('Listing not found');
    }

    res.status(200).json(listing);
  }

  /**
   * Get listings by user ID
   */
  static async getListingsByUserId(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;

    if (!userId || !userId.trim()) {
      throw new ValidationError('User ID is required');
    }

    // Verify user exists
    const user = await UserModel.findById(userId.trim());
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const listings = await ListingModel.findByUserId(userId.trim());

    res.status(200).json(listings);
  }

  /**
   * Get listings by type (mart or task)
   */
  static async getListingsByType(req: Request, res: Response): Promise<void> {
    const { type } = req.params;

    if (!type || (type !== 'mart' && type !== 'task')) {
      throw new ValidationError('Type must be either "mart" or "task"');
    }

    const listings = await ListingModel.findByType(type as 'mart' | 'task');

    res.status(200).json(listings);
  }

  /**
   * Get all listings (both mart and task)
   */
  static async getAllListings(req: Request, res: Response): Promise<void> {
    const martListings = await ListingModel.findByType('mart');
    const taskListings = await ListingModel.findByType('task');
    
    const allListings = [...martListings, ...taskListings];

    res.status(200).json(allListings);
  }
}

/**
 * Validate listing data
 */
function validateListingData(data: Partial<CreateListingRequest>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate type
  if (!data.type) {
    errors.push('Type is required');
  } else if (data.type !== 'mart' && data.type !== 'task') {
    errors.push('Type must be either "mart" or "task"');
  }

  // Validate title
  if (!data.title || !data.title.trim()) {
    errors.push('Title is required');
  } else if (data.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  } else if (data.title.trim().length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  // Validate description
  if (!data.description || !data.description.trim()) {
    errors.push('Description is required');
  } else if (data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  } else if (data.description.trim().length > 2000) {
    errors.push('Description must be less than 2000 characters');
  }

  // Validate price
  if (data.price === undefined || data.price === null) {
    errors.push('Price is required');
  } else if (typeof data.price !== 'number') {
    errors.push('Price must be a number');
  } else if (data.price < 0) {
    errors.push('Price must be greater than or equal to 0');
  }

  // Validate location
  if (!data.location || !data.location.trim()) {
    errors.push('Location is required');
  } else if (data.location.trim().length < 2) {
    errors.push('Location must be at least 2 characters long');
  } else if (data.location.trim().length > 200) {
    errors.push('Location must be less than 200 characters');
  }

  // Validate categoryId
  if (!data.categoryId || !data.categoryId.trim()) {
    errors.push('Category ID is required');
  }

  // Validate tags (optional)
  if (data.tags !== undefined && data.tags !== null) {
    if (typeof data.tags !== 'string') {
      errors.push('Tags must be a string');
    } else if (data.tags.trim().length > 500) {
      errors.push('Tags must be less than 500 characters');
    }
  }

  // Validate images (will be validated separately for count, but check if it's an array)
  if (data.images !== undefined && !Array.isArray(data.images)) {
    errors.push('Images must be an array');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}


