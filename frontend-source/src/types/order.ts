export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface Order {
  id: number;
  userId: number;
  campaignItemId: string;
  status: OrderStatus;
  createdAt: string;
}

export interface PlaceOrderRequest {
  campaignItemId: string;
}

export interface PlaceOrderResponse {
  eventId: string;
  userId: number;
  campaignItemId: string;
  status: OrderStatus;
  requestedAt: string;
}
