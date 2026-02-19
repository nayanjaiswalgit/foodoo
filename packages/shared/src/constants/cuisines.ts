export const Cuisine = {
  NORTH_INDIAN: 'North Indian',
  SOUTH_INDIAN: 'South Indian',
  CHINESE: 'Chinese',
  ITALIAN: 'Italian',
  MEXICAN: 'Mexican',
  THAI: 'Thai',
  JAPANESE: 'Japanese',
  AMERICAN: 'American',
  MEDITERRANEAN: 'Mediterranean',
  CONTINENTAL: 'Continental',
  STREET_FOOD: 'Street Food',
  DESSERTS: 'Desserts',
  BEVERAGES: 'Beverages',
  BIRYANI: 'Biryani',
  PIZZA: 'Pizza',
  BURGER: 'Burger',
  HEALTHY: 'Healthy',
  BAKERY: 'Bakery',
} as const;

export type Cuisine = (typeof Cuisine)[keyof typeof Cuisine];

export const CUISINES = Object.values(Cuisine);
