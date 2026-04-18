import { Controller, Get, Param } from "@nestjs/common";
import { ContentService } from "./content.service";

@Controller("public")
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get("pages/:pageKey")
  findPage(@Param("pageKey") pageKey: string) {
    return this.contentService.findPageByKey(pageKey);
  }
}
