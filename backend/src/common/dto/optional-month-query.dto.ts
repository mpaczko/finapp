import { Type } from "class-transformer";
import { IsInt, IsOptional, Matches, Max, Min } from "class-validator";

import { MONTH_PATTERN } from "./month-query.dto";

export class OptionalMonthQueryDto {
  @IsOptional()
  @Matches(MONTH_PATTERN, { message: "month must use YYYY-MM format" })
  month?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;
}
