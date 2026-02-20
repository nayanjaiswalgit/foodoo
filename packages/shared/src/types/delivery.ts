export interface IDeliveryEarning {
  _id: string;
  partner: string;
  order: string;
  baseFee: number;
  distanceBonus: number;
  tipAmount: number;
  totalEarning: number;
  createdAt: string;
  updatedAt: string;
}

export interface IDeliveryPartner {
  _id: string;
  user: string;
  vehicleType: 'bicycle' | 'motorcycle' | 'car';
  vehicleNumber?: string;
  isOnline: boolean;
  isAvailable: boolean;
  currentLocation: {
    type: 'Point';
    coordinates: [number, number];
  };
  currentOrder?: string;
  stats: {
    totalDeliveries: number;
    totalEarnings: number;
    rating: {
      average: number;
      count: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}
