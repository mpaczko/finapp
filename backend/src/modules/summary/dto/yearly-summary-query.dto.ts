import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class YearlySummaryQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @IsOptional()
  @IsString()
  travelCategory?: string;

  @IsOptional()
  @IsString()
  clothesCategory?: string;
}
