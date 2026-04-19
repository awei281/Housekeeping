import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateServiceStandardDto } from "./dto/create-service-standard.dto";
import { UpdateServiceStandardDto } from "./dto/update-service-standard.dto";
import { StandardsService } from "./standards.service";

@Controller()
export class StandardsController {
  constructor(private readonly standardsService: StandardsService) {}

  @Get("public/service-standards")
  findPublic() {
    return this.standardsService.findPublic();
  }

  @Get("admin/standards")
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.standardsService.findAllForAdmin();
  }

  @Post("admin/standards")
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateServiceStandardDto) {
    return this.standardsService.create(dto);
  }

  @Patch("admin/standards/:id")
  @UseGuards(JwtAuthGuard)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateServiceStandardDto,
  ) {
    return this.standardsService.update(id, dto);
  }
}
