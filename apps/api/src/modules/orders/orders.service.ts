import { Injectable, NotFoundException } from "@nestjs/common";
import { LeadStatus, OrderStatus } from "../../../../../packages/contracts/src/enums";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";

function parseServiceDate(serviceDate: string) {
  return new Date(serviceDate);
}

function buildOrderNo() {
  return `HK${Date.now()}`;
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForAdmin() {
    const orders = await this.prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const customerIds = [...new Set(orders.map((order) => order.customerId))];
    const customers =
      customerIds.length > 0
        ? await this.prisma.customer.findMany({
            where: {
              id: {
                in: customerIds,
              },
            },
          })
        : [];

    const customerMap = new Map(customers.map((customer) => [customer.id, customer]));
    const employeeIds = [
      ...new Set(
        orders
          .map((order) => order.assignedEmployeeId)
          .filter((employeeId): employeeId is number => employeeId !== null),
      ),
    ];
    const employees =
      employeeIds.length > 0
        ? await this.prisma.employee.findMany({
            where: {
              id: {
                in: employeeIds,
              },
            },
          })
        : [];
    const employeeMap = new Map(employees.map((employee) => [employee.id, employee]));

    return orders.map((order) => ({
      ...order,
      customerName: customerMap.get(order.customerId)?.name ?? "",
      assignedEmployeeName: order.assignedEmployeeId
        ? employeeMap.get(order.assignedEmployeeId)?.name ?? ""
        : "",
    }));
  }

  async findOneForAdmin(id: number) {
    const order = await this.prisma.order.findUnique({
      where: {
        id,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    const customer = await this.prisma.customer.findUnique({
      where: {
        id: order.customerId,
      },
    });
    const assignedEmployee = order.assignedEmployeeId
      ? await this.prisma.employee.findUnique({
          where: {
            id: order.assignedEmployeeId,
          },
        })
      : null;

    return {
      ...order,
      customerName: customer?.name ?? "",
      customerPhone: customer?.phone ?? "",
      assignedEmployeeName: assignedEmployee?.name ?? "",
      assignedEmployeePhone: assignedEmployee?.phone ?? "",
    };
  }

  async create(dto: CreateOrderDto) {
    const order = await this.prisma.order.create({
      data: {
        orderNo: buildOrderNo(),
        customerId: dto.customerId,
        leadId: dto.leadId ?? null,
        serviceItemName: dto.serviceItemName,
        serviceType: dto.serviceType,
        serviceDate: parseServiceDate(dto.serviceDate),
        amount: dto.amount,
        assignedEmployeeId: dto.assignedEmployeeId ?? null,
      },
    });

    if (dto.leadId) {
      await this.prisma.lead.update({
        where: {
          id: dto.leadId,
        },
        data: {
          status: LeadStatus.CONVERTED,
        },
      });
    }

    return order;
  }

  assignEmployee(id: number, employeeId: number) {
    return this.prisma.order.update({
      where: {
        id,
      },
      data: {
        assignedEmployeeId: employeeId,
        status: OrderStatus.ASSIGNED,
      },
    });
  }
}
