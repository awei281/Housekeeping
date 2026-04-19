import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";

function normalizeOptionalText(value: string | null | undefined) {
  if (value === undefined) {
    return undefined;
  }

  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeOptionalDate(value: string | null | undefined) {
  if (value === undefined) {
    return undefined;
  }

  return value ? new Date(value) : null;
}

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  findAllForAdmin() {
    return this.prisma.employee.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  create(dto: CreateEmployeeDto) {
    return this.prisma.employee.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        roleType: dto.roleType,
        skillTags: normalizeOptionalText(dto.skillTags),
        certificateNo: normalizeOptionalText(dto.certificateNo),
        healthCertExpireAt: normalizeOptionalDate(dto.healthCertExpireAt),
        ...(dto.status ? { status: dto.status } : {}),
      },
    });
  }

  update(id: number, dto: UpdateEmployeeDto) {
    return this.prisma.employee.update({
      where: {
        id,
      },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.roleType !== undefined ? { roleType: dto.roleType } : {}),
        ...(dto.skillTags !== undefined
          ? { skillTags: normalizeOptionalText(dto.skillTags) }
          : {}),
        ...(dto.certificateNo !== undefined
          ? { certificateNo: normalizeOptionalText(dto.certificateNo) }
          : {}),
        ...(dto.healthCertExpireAt !== undefined
          ? { healthCertExpireAt: normalizeOptionalDate(dto.healthCertExpireAt) }
          : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
    });
  }
}
