export interface CreateEmployeeDto {
  name: string;
  phone: string;
  roleType: string;
  skillTags?: string;
  certificateNo?: string;
  healthCertExpireAt?: string;
  status?: string;
}

export interface UpdateEmployeeDto {
  name?: string;
  phone?: string;
  roleType?: string;
  skillTags?: string | null;
  certificateNo?: string | null;
  healthCertExpireAt?: string | null;
  status?: string;
}
