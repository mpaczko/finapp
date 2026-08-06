import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";
import { YearlySummaryQueryDto } from "./dto/yearly-summary-query.dto";

const INVESTMENT_CATEGORY_NAME = "inwestycje";
const TRAVEL_CATEGORY_KEY = "travels";
const TRAVEL_CATEGORY_FALLBACK = "podróże/wakacje";
const CLOTHES_CATEGORY_KEY = "clothes";
const CLOTHES_CATEGORY_FALLBACK = "ubrania/sprzęt sportowy";

const toDatabaseDate = (value: string) => new Date(`${value}T00:00:00.000Z`);
const toNumber = (value: unknown) => Number(value ?? 0);

@Injectable()
export class SummaryService {
  constructor(private readonly prisma: PrismaService) {}

  async getYearly(userId: string, query: YearlySummaryQueryDto) {
    const fromDate = toDatabaseDate(`${query.year}-01-01`);
    const toDate = toDatabaseDate(`${query.year}-12-31`);
    const travelCategoryName =
      query.travelCategory ??
      (await this.findCategoryName(userId, TRAVEL_CATEGORY_KEY, TRAVEL_CATEGORY_FALLBACK));
    const clothesCategoryName =
      query.clothesCategory ??
      (await this.findCategoryName(userId, CLOTHES_CATEGORY_KEY, CLOTHES_CATEGORY_FALLBACK));

    const [investment, budgets, travel, clothes] = await Promise.all([
      this.prisma.expense.aggregate({
        where: {
          user_id: userId,
          category: INVESTMENT_CATEGORY_NAME,
          date: {
            gte: fromDate,
            lte: toDate,
          },
        },
        _sum: { cost: true },
      }),
      this.prisma.budget.findMany({
        where: {
          user_id: userId,
          month: {
            gte: `${query.year}-01`,
            lte: `${query.year}-12`,
          },
        },
        select: {
          travels: true,
          clothes: true,
          ip_box: true,
        },
      }),
      this.prisma.expense.aggregate({
        where: {
          user_id: userId,
          category: travelCategoryName,
          date: {
            gte: fromDate,
            lte: toDate,
          },
        },
        _sum: { cost: true },
      }),
      this.prisma.expense.aggregate({
        where: {
          user_id: userId,
          category: clothesCategoryName,
          date: {
            gte: fromDate,
            lte: toDate,
          },
        },
        _sum: { cost: true },
      }),
    ]);

    return {
      investmentSum: toNumber(investment._sum.cost),
      ipBoxSum: budgets.reduce((sum, budget) => sum + toNumber(budget.ip_box), 0),
      travelPlanned: budgets.reduce((sum, budget) => sum + toNumber(budget.travels), 0),
      travelActual: toNumber(travel._sum.cost),
      travelCategoryName,
      clothesPlanned: budgets.reduce((sum, budget) => sum + toNumber(budget.clothes), 0),
      clothesActual: toNumber(clothes._sum.cost),
      clothesCategoryName,
    };
  }

  private async findCategoryName(userId: string, key: string, fallback: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        user_id: userId,
        key,
      },
      select: {
        name: true,
      },
    });

    return category?.name ?? fallback;
  }
}
