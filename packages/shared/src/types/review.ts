export interface IReview {
  _id: string;
  user: string;
  restaurant: string;
  order: string;
  rating: number;
  comment: string;
  images: string[];
  reply?: {
    text: string;
    repliedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}
