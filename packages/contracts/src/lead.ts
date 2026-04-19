export interface CreateLeadDto {
  contactName: string;
  phone: string;
  serviceType: string;
  expectedTime?: string;
  address?: string;
  remark?: string;
  source: "website" | "manual";
}
