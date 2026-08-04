import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const categories = await this.prisma.category.findMany({
      where: { user_id: userId },
      orderBy: { id: "asc" },
    });

    return categories.map((category) => ({
      ...category,
      created_at: category.created_at.toISOString(),
    }));
  }

  async create(userId: string, dto: CreateCategoryDto) {
    const category = await this.prisma.category.create({
      data: {
        ...dto,
        user_id: userId,
      },
    });

    return {
      ...category,
      created_at: category.created_at.toISOString(),
    };
  }

  async update(userId: string, id: number, dto: UpdateCategoryDto) {
    const existing = await this.prisma.category.findFirst({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!existing) {
      throw new NotFoundException("Category not found");
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: dto,
    });

    return {
      ...category,
      created_at: category.created_at.toISOString(),
    };
  }

  async remove(userId: string, id: number) {
    const existing = await this.prisma.category.findFirst({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!existing) {
      throw new NotFoundException("Category not found");
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { id };
  }
}
