import { axiosClient } from './axiosClient';
import {
  AddCampaignItemRequest,
  Campaign,
  CampaignItem,
  CreateCampaignRequest,
  UpdateCampaignStatusRequest,
} from '../../types/campaign';

export const campaignService = {
  async getActiveCampaigns(): Promise<Campaign[]> {
    const response = await axiosClient.get<Campaign[]>('/campaigns/active');
    return response.data;
  },

  async createCampaign(payload: CreateCampaignRequest): Promise<Campaign> {
    const response = await axiosClient.post<Campaign>('/campaigns', payload);
    return response.data;
  },

  async addCampaignItem(
    campaignId: string,
    payload: AddCampaignItemRequest
  ): Promise<CampaignItem> {
    const response = await axiosClient.post<CampaignItem>(
      `/campaigns/${campaignId}/items`,
      payload
    );
    return response.data;
  },

  async updateCampaignStatus(
    campaignId: string,
    payload: UpdateCampaignStatusRequest
  ): Promise<Campaign> {
    const response = await axiosClient.patch<Campaign>(`/campaigns/${campaignId}/status`, payload);
    return response.data;
  },

  async reconcileInventory(): Promise<{ reconciledItems: number }> {
    const response = await axiosClient.post<{ reconciledItems: number }>('/campaigns/reconcile');
    return response.data;
  },
};
