import { axiosClient } from './axiosClient';
import { Order, PlaceOrderRequest, PlaceOrderResponse } from '../../types/order';

export const orderService = {
  async placeOrder(payload: PlaceOrderRequest): Promise<PlaceOrderResponse> {
    const response = await axiosClient.post<PlaceOrderResponse>('/orders', payload);
    return response.data;
  },

  async getMyOrders(): Promise<Order[]> {
    const response = await axiosClient.get<Order[]>('/orders/me');
    return response.data;
  },

  async getOrderById(id: number): Promise<Order> {
    const response = await axiosClient.get<Order>(`/orders/${id}`);
    return response.data;
  },

  async cancelOrder(id: number): Promise<Order> {
    const response = await axiosClient.post<Order>(`/orders/${id}/cancel`);
    return response.data;
  },
};
