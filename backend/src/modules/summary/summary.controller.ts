import { Controller, Get, Query } from "@nestjs/common";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthUser } from "../../common/types/auth-user";
import { YearlySummaryQueryDto } from "./dto/yearly-summary-query.dto";
import { SummaryService } from "./summary.service";

@Controller("summary")
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get("yearly")
  getYearly(@CurrentUser() user: AuthUser, @Query() query: YearlySummaryQueryDto) {
    return this.summaryService.getYearly(user.id, query);
  }
}
