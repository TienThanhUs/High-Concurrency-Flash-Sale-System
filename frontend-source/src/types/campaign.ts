export type CampaignStatus = 'UPCOMING' | 'ACTIVE' | 'ENDED';

export interface CampaignItem {
  id: string; // UUID
  campaignId: string;
  productId: string;
  flashSalePrice: number;
  totalQuantity: number;
  availableQuantity: number;
}

export interface Campaign {
  id: string; // UUID
  name: string;
  startTime: string;
  endTime: string;
  status: CampaignStatus;
  createdAt: string;
  items: CampaignItem[];
}

export interface CreateCampaignRequest {
  name: string;
  startTime: string;
  endTime: string;
}

export interface AddCampaignItemRequest {
  productId: string;
  flashSalePrice: number;
  totalQuantity: number;
}

export interface UpdateCampaignStatusRequest {
  status: CampaignStatus;
}
