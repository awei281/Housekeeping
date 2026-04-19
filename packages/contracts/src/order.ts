export interface CreateOrderDto {
  customerId: number;
  serviceType: string;
  serviceItemName: string;
  serviceDate: string;
  amount: number;
  leadId?: number;
  assignedEmployeeId?: number;
}

export interface AssignOrderEmployeeDto {
  employeeId: number;
}
