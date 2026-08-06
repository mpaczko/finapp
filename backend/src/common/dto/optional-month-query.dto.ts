import { IsOptional, Matches } from "class-validator";

import { MONTH_PATTERN } from "./month-query.dto";

export class OptionalMonthQueryDto {
  @IsOptional()
  @Matches(MONTH_PATTERN, { message: "month must use YYYY-MM format" })
  month?: string;
}
