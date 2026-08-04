import { IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @Matches(/^[a-z0-9_]+$/, { message: "key can contain lowercase letters, numbers and underscores" })
  key?: string;
}
