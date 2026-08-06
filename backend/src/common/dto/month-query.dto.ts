import { Matches } from "class-validator";

export const MONTH_PATTERN = /^\d{4}-\d{2}$/;

export class MonthQueryDto {
  @Matches(MONTH_PATTERN, { message: "month must use YYYY-MM format" })
  month: string;
}
