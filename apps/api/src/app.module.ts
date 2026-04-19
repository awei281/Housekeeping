import { Module } from "@nestjs/common";
import { PrismaModule } from "./common/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ContentModule } from "./modules/content/content.module";
import { CustomersModule } from "./modules/customers/customers.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { EmployeesModule } from "./modules/employees/employees.module";
import { LeadsModule } from "./modules/leads/leads.module";
import { LogsModule } from "./modules/logs/logs.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { StandardsModule } from "./modules/standards/standards.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    DashboardModule,
    ContentModule,
    LeadsModule,
    CustomersModule,
    EmployeesModule,
    LogsModule,
    OrdersModule,
    StandardsModule,
  ],
})
export class AppModule {}
