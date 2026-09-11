import { Type } from "class-transformer";
import { ArrayMaxSize, ArrayMinSize, IsArray, ValidateNested } from "class-validator";

import { CreateExpenseDto } from "./create-expense.dto";

export class CreateExpensesBatchDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => CreateExpenseDto)
  expenses: CreateExpenseDto[];
}
