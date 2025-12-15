import { Router } from 'express';
import { ListingController } from '../controllers/listingController';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

// Create a new listing
router.post('/', asyncHandler(ListingController.createListing));

// Get all listings (both mart and task)
router.get('/', asyncHandler(ListingController.getAllListings));

// Get listings by type (mart or task) - MUST come before /:id
router.get('/type/:type', asyncHandler(ListingController.getListingsByType));

// Get listings by user ID
router.get('/user/:userId', asyncHandler(ListingController.getListingsByUserId));

// Get listing by ID - MUST come last to avoid route conflicts
router.get('/:id', asyncHandler(ListingController.getListingById));

export default router;


