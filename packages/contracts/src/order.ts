export interface CreateOrderDto {
  customerId: number;
  serviceItemId: number;
  serviceDate: string;
  amount: number;
  addressId?: number;
  leadId?: number;
  assignedEmployeeId?: number;
}
