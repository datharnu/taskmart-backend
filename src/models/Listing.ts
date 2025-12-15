import prisma from '../lib/prisma';
import { CreateListingRequest, GetListingResponse } from '../types/listing';

export class ListingModel {
  /**
   * Create a new listing
   */
  static async create(
    userId: string,
    data: CreateListingRequest
  ): Promise<GetListingResponse> {
    const listing = await prisma.listing.create({
      data: {
        userId,
        type: data.type,
        title: data.title.trim(),
        description: data.description.trim(),
        price: data.price,
        location: data.location.trim(),
        categoryId: data.categoryId,
        tags: data.tags?.trim() || null,
        images: data.images,
      },
      select: {
        id: true,
        userId: true,
        type: true,
        title: true,
        description: true,
        price: true,
        location: true,
        categoryId: true,
        tags: true,
        images: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return {
      ...listing,
      type: listing.type as 'mart' | 'task',
      tags: listing.tags ?? undefined,
    };
  }

  /**
   * Get listing by ID
   */
  static async findById(id: string): Promise<GetListingResponse | null> {
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        type: true,
        title: true,
        description: true,
        price: true,
        location: true,
        categoryId: true,
        tags: true,
        images: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!listing) return null;
    return {
      ...listing,
      type: listing.type as 'mart' | 'task',
      tags: listing.tags ?? undefined,
    };
  }

  /**
   * Get listing by ID with user details
   */
  static async findByIdWithUser(id: string): Promise<GetListingResponse | null> {
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        type: true,
        title: true,
        description: true,
        price: true,
        location: true,
        categoryId: true,
        tags: true,
        images: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!listing) return null;

    return {
      ...listing,
      type: listing.type as 'mart' | 'task',
      tags: listing.tags ?? undefined,
      user: listing.user ? {
        id: listing.user.id,
        name: listing.user.name,
        email: listing.user.email,
        image: listing.user.image,
      } : undefined,
    };
  }

  /**
   * Get listings by user ID
   */
  static async findByUserId(userId: string): Promise<GetListingResponse[]> {
    const listings = await prisma.listing.findMany({
      where: { userId },
      select: {
        id: true,
        userId: true,
        type: true,
        title: true,
        description: true,
        price: true,
        location: true,
        categoryId: true,
        tags: true,
        images: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return listings.map(listing => ({
      ...listing,
      type: listing.type as 'mart' | 'task',
      tags: listing.tags ?? undefined,
    }));
  }

  /**
   * Get listings by type (mart or task)
   */
  static async findByType(type: 'mart' | 'task'): Promise<GetListingResponse[]> {
    const listings = await prisma.listing.findMany({
      where: { type },
      select: {
        id: true,
        userId: true,
        type: true,
        title: true,
        description: true,
        price: true,
        location: true,
        categoryId: true,
        tags: true,
        images: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return listings.map(listing => ({
      ...listing,
      type: listing.type as 'mart' | 'task',
      tags: listing.tags ?? undefined,
    }));
  }
}

