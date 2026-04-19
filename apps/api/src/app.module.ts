import { Module } from "@nestjs/common";
import { PrismaModule } from "./common/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ContentModule } from "./modules/content/content.module";
import { CustomersModule } from "./modules/customers/customers.module";
import { EmployeesModule } from "./modules/employees/employees.module";
import { LeadsModule } from "./modules/leads/leads.module";
import { OrdersModule } from "./modules/orders/orders.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ContentModule,
    LeadsModule,
    CustomersModule,
    EmployeesModule,
    OrdersModule,
  ],
})
export class AppModule {}
