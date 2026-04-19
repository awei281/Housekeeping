export interface ServiceStandardDto {
  id: number;
  category: string;
  title: string;
  content: string;
  sortOrder: number;
  status: string;
}

export interface CreateServiceStandardDto {
  category: string;
  title: string;
  content: string;
  sortOrder?: number;
  status?: string;
}

export interface UpdateServiceStandardDto {
  category?: string;
  title?: string;
  content?: string;
  sortOrder?: number;
  status?: string;
}
