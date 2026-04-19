import { Injectable } from "@nestjs/common";
import type { DashboardSummaryDto } from "../../../../../packages/contracts/src/dashboard";
import { LeadStatus, OrderStatus } from "../../../../../packages/contracts/src/enums";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(): Promise<DashboardSummaryDto> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [todayLeads, pendingLeads, activeOrders, completedOrders] =
      await Promise.all([
        this.prisma.lead.count({
          where: {
            createdAt: {
              gte: startOfToday,
            },
          },
        }),
        this.prisma.lead.count({
          where: {
            status: {
              in: [LeadStatus.NEW, LeadStatus.FOLLOWING, LeadStatus.QUOTED],
            },
          },
        }),
        this.prisma.order.count({
          where: {
            status: {
              in: [
                OrderStatus.PENDING_CONFIRM,
                OrderStatus.PENDING_ASSIGN,
                OrderStatus.ASSIGNED,
                OrderStatus.SERVING,
                OrderStatus.AFTER_SALE,
              ],
            },
          },
        }),
        this.prisma.order.count({
          where: {
            status: OrderStatus.COMPLETED,
          },
        }),
      ]);

    return {
      todayLeads,
      pendingLeads,
      activeOrders,
      completedOrders,
    };
  }
}
