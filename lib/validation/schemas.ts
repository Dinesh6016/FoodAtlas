import { z } from "zod";

export const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["USER", "OWNER"]).default("USER"),
  phone: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const RestaurantSchema = z.object({
  name: z.string().min(2, "Restaurant name is required"),
  description: z.string().optional(),
  phone: z.string().min(8, "Phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  priceRange: z.coerce.number().min(1).max(4).default(2),
  address: z.string().min(5, "Address is required"),
  landmark: z.string().optional(),
  cityName: z.string().min(2, "City name is required"),
  areaName: z.string().min(2, "Area name is required"),
  state: z.string().default("Telangana"),
  postalCode: z.string().min(4, "Postal code is required"),
  latitude: z.coerce.number().default(17.4168),
  longitude: z.coerce.number().default(78.4382),
  cuisineIds: z.array(z.string()).min(1, "At least one cuisine must be selected"),
  bannerImageUrl: z.string().url().optional().or(z.literal("")),
});

export const MenuCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  displayOrder: z.coerce.number().default(0),
});

export const MenuItemSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  discountedPrice: z.coerce.number().optional().nullable(),
  veg: z.boolean().default(false),
  egg: z.boolean().default(false),
  spicy: z.boolean().default(false),
  available: z.boolean().default(true),
  image: z.string().url().optional().or(z.literal("")),
  displayOrder: z.coerce.number().default(0),
});

export const ReviewSchema = z.object({
  restaurantId: z.string().min(1, "Restaurant is required"),
  rating: z.coerce.number().min(1).max(5),
  title: z.string().optional(),
  body: z.string().min(5, "Review must be at least 5 characters"),
});

export const OwnerClaimSchema = z.object({
  restaurantId: z.string().min(1, "Restaurant is required"),
  ownerName: z.string().min(2, "Owner name is required"),
  businessPhone: z.string().min(8, "Business phone is required"),
  verificationDocsUrl: z.string().optional(),
  notes: z.string().optional(),
});
