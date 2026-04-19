import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { LeadsService } from "./leads.service";

@Controller()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get("admin/leads")
  @UseGuards(JwtAuthGuard)
  findAdminLeads() {
    return this.leadsService.findAllForAdmin();
  }

  @Post("admin/leads/:id/convert-customer")
  @UseGuards(JwtAuthGuard)
  convertToCustomer(@Param("id", ParseIntPipe) id: number) {
    return this.leadsService.convertToCustomer(id);
  }

  @Post("public/leads")
  createPublicLead(@Body() dto: CreateLeadDto) {
    return this.leadsService.createFromWebsite(dto);
  }
}
