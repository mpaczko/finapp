import { IsDateString, IsOptional, Matches } from "class-validator";

import { MONTH_PATTERN } from "../../../common/dto/month-query.dto";

export class ExpensesQueryDto {
  @IsOptional()
  @Matches(MONTH_PATTERN, { message: "month must use YYYY-MM format" })
  month?: string;

  @IsOptional()
  @IsDateString({}, { message: "from must use YYYY-MM-DD format" })
  from?: string;

  @IsOptional()
  @IsDateString({}, { message: "to must use YYYY-MM-DD format" })
  to?: string;
}
