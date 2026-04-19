import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateLeadDto } from "./dto/create-lead.dto";

function parseExpectedTime(expectedTime?: string) {
  if (!expectedTime?.trim()) {
    return null;
  }

  const parsed = new Date(expectedTime);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllForAdmin() {
    return this.prisma.lead.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  createFromWebsite(dto: CreateLeadDto) {
    return this.prisma.lead.create({
      data: {
        source: "website",
        contactName: dto.contactName,
        phone: dto.phone,
        serviceType: dto.serviceType,
        expectedTime: parseExpectedTime(dto.expectedTime),
        address: dto.address ?? "",
        remark: dto.remark ?? "",
      },
    });
  }

  async convertToCustomer(id: number) {
    const lead = await this.prisma.lead.findUnique({
      where: {
        id,
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead ${id} not found`);
    }

    return this.prisma.customer.create({
      data: {
        name: lead.contactName,
        phone: lead.phone,
        source: lead.source,
        remark: lead.remark ?? "",
      },
    });
  }
}
