import { Type } from "class-transformer";
import { IsDateString, IsNumber, IsString, MaxLength, Min, MinLength } from "class-validator";

export class CreateExpenseDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  category: string;

  @IsDateString({}, { message: "date must use YYYY-MM-DD format" })
  date: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cost: number;
}
