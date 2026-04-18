import { Module } from "@nestjs/common";
import { PrismaModule } from "./common/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ContentModule } from "./modules/content/content.module";

@Module({
  imports: [PrismaModule, AuthModule, ContentModule],
})
export class AppModule {}
