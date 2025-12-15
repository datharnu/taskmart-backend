export interface CreateListingRequest {
  type: 'mart' | 'task';
  title: string;
  description: string;
  price: number; // For mart items, this is the price. For tasks, this is the budget
  location: string;
  categoryId: string;
  tags?: string; // Optional comma-separated tags (mainly for tasks)
  images: string[]; // Array of image/video URLs (stored on Cloudflare R2)
}

export interface CreateListingResponse {
  message: string;
  listing: {
    id: string;
    userId: string;
    type: 'mart' | 'task';
    title: string;
    description: string;
    price: number;
    location: string;
    categoryId: string;
    tags?: string;
    images: string[];
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface GetListingResponse {
  id: string;
  userId: string;
  type: 'mart' | 'task';
  title: string;
  description: string;
  price: number;
  location: string;
  categoryId: string;
  tags?: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}


