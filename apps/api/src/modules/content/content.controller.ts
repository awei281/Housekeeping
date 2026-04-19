import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UpdateContentPageDto } from "./dto/update-content-page.dto";
import { ContentService } from "./content.service";

@Controller()
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get("public/pages/:pageKey")
  findPage(@Param("pageKey") pageKey: string) {
    return this.contentService.findPageByKey(pageKey);
  }

  @Get("admin/content/pages")
  @UseGuards(JwtAuthGuard)
  findAllForAdmin() {
    return this.contentService.findAllPagesForAdmin();
  }

  @Get("admin/content/pages/:pageKey")
  @UseGuards(JwtAuthGuard)
  findPageForAdmin(@Param("pageKey") pageKey: string) {
    return this.contentService.findPageForAdmin(pageKey);
  }

  @Put("admin/content/pages/:pageKey")
  @UseGuards(JwtAuthGuard)
  updatePage(
    @Param("pageKey") pageKey: string,
    @Body() dto: UpdateContentPageDto,
  ) {
    return this.contentService.updatePage(pageKey, dto);
  }
}
