import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateServiceStandardDto } from "./dto/create-service-standard.dto";
import { UpdateServiceStandardDto } from "./dto/update-service-standard.dto";

const DEFAULT_SERVICE_STANDARDS = [
  {
    category: "personnel",
    title: "人员标准",
    content: "实名认证、培训合格、健康证明齐全，服务纪律清晰可查。",
    sortOrder: 1,
    status: "published",
  },
  {
    category: "service",
    title: "服务标准",
    content: "按服务清单执行，不漏项，不乱收费，关键节点有记录。",
    sortOrder: 2,
    status: "published",
  },
  {
    category: "tools",
    title: "工具标准",
    content: "工具分类使用，重点区域分色分区，避免交叉污染。",
    sortOrder: 3,
    status: "published",
  },
  {
    category: "safety",
    title: "安全标准",
    content: "入户安全、物品保护、隐私保护都要在服务前后确认。",
    sortOrder: 4,
    status: "published",
  },
  {
    category: "after_sale",
    title: "售后标准",
    content: "投诉和问题处理有时限，服务结束后保留回访机制。",
    sortOrder: 5,
    status: "published",
  },
];

@Injectable()
export class StandardsService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublic() {
    const standards = await this.prisma.serviceStandard.findMany({
      where: {
        status: "published",
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    if (standards.length > 0) {
      return standards;
    }

    return DEFAULT_SERVICE_STANDARDS.map((standard, index) => ({
      id: index + 1,
      ...standard,
    }));
  }

  async findAllForAdmin() {
    const standards = await this.prisma.serviceStandard.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    if (standards.length > 0) {
      return standards;
    }

    return DEFAULT_SERVICE_STANDARDS.map((standard, index) => ({
      id: -(index + 1),
      ...standard,
    }));
  }

  create(dto: CreateServiceStandardDto) {
    return this.prisma.serviceStandard.create({
      data: {
        category: dto.category,
        title: dto.title,
        content: dto.content,
        sortOrder: dto.sortOrder ?? 0,
        status: dto.status ?? "published",
      },
    });
  }

  update(id: number, dto: UpdateServiceStandardDto) {
    return this.prisma.serviceStandard.update({
      where: {
        id,
      },
      data: {
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.content !== undefined ? { content: dto.content } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
    });
  }
}
