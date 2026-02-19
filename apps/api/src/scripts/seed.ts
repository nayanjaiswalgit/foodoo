import mongoose from 'mongoose';
import { UserRole, OrderStatus, DEFAULT_FEATURE_FLAGS } from '@food-delivery/shared';
import { User } from '../models/user.model';
import { Category } from '../models/category.model';
import { Restaurant } from '../models/restaurant.model';
import { MenuItem } from '../models/menu-item.model';
import { Coupon } from '../models/coupon.model';
import { FeatureFlagModel } from '../models/feature-flag.model';
import { env } from '../config/env';

const seed = async () => {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB, seeding...');

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Restaurant.deleteMany({}),
    MenuItem.deleteMany({}),
    Coupon.deleteMany({}),
    FeatureFlagModel.deleteMany({}),
  ]);

  // Users
  const [admin, owner1, owner2, customer, partner] = await User.create([
    { name: 'Super Admin', email: 'admin@food.dev', phone: '9000000001', passwordHash: 'Admin@123', role: UserRole.SUPER_ADMIN, isVerified: true },
    { name: 'Pizza Palace Owner', email: 'pizza@food.dev', phone: '9000000002', passwordHash: 'Owner@123', role: UserRole.RESTAURANT_OWNER, isVerified: true },
    { name: 'Biryani House Owner', email: 'biryani@food.dev', phone: '9000000003', passwordHash: 'Owner@123', role: UserRole.RESTAURANT_OWNER, isVerified: true },
    { name: 'John Customer', email: 'john@food.dev', phone: '9000000004', passwordHash: 'User@1234', role: UserRole.CUSTOMER, isVerified: true },
    { name: 'Rider Raj', email: 'raj@food.dev', phone: '9000000005', passwordHash: 'Rider@123', role: UserRole.DELIVERY_PARTNER, isVerified: true },
  ]);

  // Categories
  const [startersCat, mainCat, dessertsCat, beveragesCat] = await Category.create([
    { name: 'Starters', sortOrder: 1 },
    { name: 'Main Course', sortOrder: 2 },
    { name: 'Desserts', sortOrder: 3 },
    { name: 'Beverages', sortOrder: 4 },
  ]);

  // Restaurants
  const restaurant1 = await Restaurant.create({
    owner: owner1!._id,
    name: 'Pizza Palace',
    description: 'Authentic Italian pizzas made with fresh ingredients and wood-fired oven',
    cuisines: ['Pizza', 'Italian'],
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    address: {
      addressLine1: '123 MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      location: { type: 'Point', coordinates: [77.5946, 12.9716] },
    },
    operatingHours: [
      { day: 0, open: '10:00', close: '23:00' },
      { day: 1, open: '10:00', close: '23:00' },
      { day: 2, open: '10:00', close: '23:00' },
      { day: 3, open: '10:00', close: '23:00' },
      { day: 4, open: '10:00', close: '23:00' },
      { day: 5, open: '10:00', close: '23:30' },
      { day: 6, open: '10:00', close: '23:30' },
    ],
    rating: { average: 4.3, count: 245 },
    priceRange: 2,
    deliveryFee: 30,
    minOrderAmount: 150,
    avgDeliveryTime: 30,
    isFeatured: true,
  });

  const restaurant2 = await Restaurant.create({
    owner: owner2!._id,
    name: 'Biryani House',
    description: 'Famous Hyderabadi biryani and authentic Mughlai cuisine',
    cuisines: ['Biryani', 'North Indian'],
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
    address: {
      addressLine1: '456 Brigade Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560025',
      location: { type: 'Point', coordinates: [77.6070, 12.9719] },
    },
    operatingHours: [
      { day: 0, open: '11:00', close: '23:00' },
      { day: 1, open: '11:00', close: '23:00' },
      { day: 2, open: '11:00', close: '23:00' },
      { day: 3, open: '11:00', close: '23:00' },
      { day: 4, open: '11:00', close: '23:00' },
      { day: 5, open: '11:00', close: '23:30' },
      { day: 6, open: '11:00', close: '23:30' },
    ],
    rating: { average: 4.5, count: 389 },
    priceRange: 2,
    deliveryFee: 25,
    minOrderAmount: 200,
    avgDeliveryTime: 35,
    isFeatured: true,
  });

  // Menu Items
  await MenuItem.create([
    { restaurant: restaurant1._id, name: 'Garlic Bread', description: 'Crispy bread with garlic butter', price: 149, category: startersCat!._id, isVeg: true, sortOrder: 1 },
    { restaurant: restaurant1._id, name: 'Margherita Pizza', description: 'Classic tomato, mozzarella, basil', price: 299, category: mainCat!._id, isVeg: true, variants: [{ name: 'Medium', price: 299 }, { name: 'Large', price: 449 }], addons: [{ name: 'Extra Cheese', price: 50 }, { name: 'Jalapenos', price: 30 }], sortOrder: 1 },
    { restaurant: restaurant1._id, name: 'Pepperoni Pizza', description: 'Loaded with pepperoni and cheese', price: 399, category: mainCat!._id, isVeg: false, variants: [{ name: 'Medium', price: 399 }, { name: 'Large', price: 549 }], sortOrder: 2 },
    { restaurant: restaurant1._id, name: 'Farmhouse Pizza', description: 'Capsicum, onion, tomato, mushroom', price: 349, category: mainCat!._id, isVeg: true, variants: [{ name: 'Medium', price: 349 }, { name: 'Large', price: 499 }], sortOrder: 3 },
    { restaurant: restaurant1._id, name: 'Tiramisu', description: 'Classic Italian coffee dessert', price: 199, category: dessertsCat!._id, isVeg: true, sortOrder: 1 },
    { restaurant: restaurant1._id, name: 'Cold Coffee', description: 'Blended iced coffee', price: 129, category: beveragesCat!._id, isVeg: true, sortOrder: 1 },

    { restaurant: restaurant2._id, name: 'Chicken 65', description: 'Spicy deep-fried chicken', price: 249, category: startersCat!._id, isVeg: false, sortOrder: 1 },
    { restaurant: restaurant2._id, name: 'Paneer Tikka', description: 'Grilled cottage cheese with spices', price: 219, category: startersCat!._id, isVeg: true, sortOrder: 2 },
    { restaurant: restaurant2._id, name: 'Chicken Biryani', description: 'Hyderabadi dum biryani with raita', price: 299, category: mainCat!._id, isVeg: false, addons: [{ name: 'Extra Raita', price: 30 }, { name: 'Salan', price: 40 }], sortOrder: 1 },
    { restaurant: restaurant2._id, name: 'Veg Biryani', description: 'Mixed vegetable dum biryani', price: 249, category: mainCat!._id, isVeg: true, sortOrder: 2 },
    { restaurant: restaurant2._id, name: 'Mutton Biryani', description: 'Slow-cooked mutton dum biryani', price: 399, category: mainCat!._id, isVeg: false, sortOrder: 3 },
    { restaurant: restaurant2._id, name: 'Gulab Jamun', description: 'Deep-fried milk balls in sugar syrup', price: 99, category: dessertsCat!._id, isVeg: true, sortOrder: 1 },
    { restaurant: restaurant2._id, name: 'Mango Lassi', description: 'Sweet yogurt mango drink', price: 89, category: beveragesCat!._id, isVeg: true, sortOrder: 1 },
  ]);

  // Coupons
  await Coupon.create([
    { code: 'WELCOME50', description: '50% off on first order', discountType: 'percentage', discountValue: 50, minOrderAmount: 200, maxDiscount: 150, validFrom: new Date(), validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), usageLimit: 1000 },
    { code: 'FLAT100', description: 'Flat ₹100 off on orders above ₹500', discountType: 'flat', discountValue: 100, minOrderAmount: 500, maxDiscount: 100, validFrom: new Date(), validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), usageLimit: 500 },
  ]);

  // Feature flags
  const flagEntries = Object.entries(DEFAULT_FEATURE_FLAGS).map(([key, enabled]) => ({
    key,
    enabled,
    description: `Feature: ${key.replace(/_/g, ' ')}`,
  }));
  await FeatureFlagModel.create(flagEntries);

  console.log('Seed complete!');
  console.log('Test accounts:');
  console.log('  Admin:    admin@food.dev / Admin@123');
  console.log('  Owner1:   pizza@food.dev / Owner@123');
  console.log('  Owner2:   biryani@food.dev / Owner@123');
  console.log('  Customer: john@food.dev / User@1234');
  console.log('  Rider:    raj@food.dev / Rider@123');

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
