import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  findAllForAdmin() {
    return this.prisma.customer.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
