import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AssignOrderEmployeeDto } from "./dto/assign-order-employee.dto";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrdersService } from "./orders.service";

@Controller("admin/orders")
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll() {
    return this.ordersService.findAllForAdmin();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.ordersService.findOneForAdmin(id);
  }

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Post(":id/assign")
  assignEmployee(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: AssignOrderEmployeeDto,
  ) {
    return this.ordersService.assignEmployee(id, dto.employeeId);
  }
}
