import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";
import { CreateBudgetDto } from "./dto/create-budget.dto";
import { UpdateBudgetDto } from "./dto/update-budget.dto";

const toNumber = (value: unknown) => Number(value ?? 0);

const budgetNumericFields = [
  "previous_month_savings",
  "income",
  "rent",
  "media",
  "home_stuff",
  "food",
  "hangouts",
  "parties",
  "suplements",
  "entertainment",
  "health_and_beauty",
  "travels",
  "transport",
  "clothes",
  "investments",
  "company_cost",
  "others",
  "ip_box",
] as const;

type BudgetNumericField = (typeof budgetNumericFields)[number];
type BudgetNumberData = Partial<Record<BudgetNumericField, number>>;
type BudgetPayload = BudgetNumberData & {
  month?: string;
};

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, month?: string) {
    const budgets = await this.prisma.budget.findMany({
      where: {
        user_id: userId,
        ...(month ? { month } : {}),
      },
      orderBy: { month: "desc" },
    });

    return budgets.map(this.mapBudget);
  }

  async upsert(userId: string, dto: CreateBudgetDto) {
    const data = this.toBudgetNumberData(dto);
    const existing = await this.prisma.budget.findFirst({
      where: { user_id: userId, month: dto.month },
      orderBy: { id: "asc" },
    });
    const budget = existing
      ? await this.prisma.budget.update({ where: { id: existing.id }, data })
      : await this.prisma.budget.create({
          data: { month: dto.month, user_id: userId, ...data },
        });

    return this.mapBudget(budget);
  }

  async update(userId: string, id: number, dto: UpdateBudgetDto) {
    const existing = await this.prisma.budget.findFirst({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!existing) {
      throw new NotFoundException("Budget not found");
    }

    const budget = await this.prisma.budget.update({
      where: { id },
      data: this.toBudgetData(dto),
    });

    return this.mapBudget(budget);
  }

  async confirmIncome(userId: string, id: number) {
    await this.findOwnedBudget(userId, id);

    // `income_received_at` is intentionally set by the server, so the client
    // cannot decide when a payment was received.
    const budget = await (this.prisma.budget.update as any)({
      where: { id },
      data: { income_received_at: new Date() },
    });

    return this.mapBudget(budget);
  }

  async unconfirmIncome(userId: string, id: number) {
    await this.findOwnedBudget(userId, id);

    const budget = await (this.prisma.budget.update as any)({
      where: { id },
      data: { income_received_at: null },
    });

    return this.mapBudget(budget);
  }

  private async findOwnedBudget(userId: string, id: number) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, user_id: userId },
    });

    if (!budget) {
      throw new NotFoundException("Budget not found");
    }

    return budget;
  }

  private toBudgetData(payload: BudgetPayload): BudgetPayload {
    const data: BudgetPayload = { ...this.toBudgetNumberData(payload) };

    if (payload.month) {
      data.month = payload.month;
    }

    return data;
  }

  private toBudgetNumberData(payload: BudgetPayload): BudgetNumberData {
    const data: BudgetNumberData = {};

    for (const field of budgetNumericFields) {
      if (payload[field] !== undefined) {
        data[field] = payload[field];
      }
    }

    return data;
  }

  private mapBudget(budget: {
    id: number | bigint;
    created_at: Date;
    month: string | null;
    income_received_at?: Date | null;
    previous_month_savings: unknown;
    income: unknown;
    rent: unknown;
    media: unknown;
    home_stuff: unknown;
    food: unknown;
    hangouts: unknown;
    parties: unknown;
    suplements: unknown;
    entertainment: unknown;
    health_and_beauty: unknown;
    travels: unknown;
    transport: unknown;
    clothes: unknown;
    investments: unknown;
    company_cost: unknown;
    others: unknown;
    ip_box: unknown;
  }) {
    return {
      id: Number(budget.id),
      created_at: budget.created_at.toISOString(),
      month: budget.month ?? "",
      income_received_at: budget.income_received_at?.toISOString() ?? null,
      previous_month_savings: toNumber(budget.previous_month_savings),
      income: toNumber(budget.income),
      rent: toNumber(budget.rent),
      media: toNumber(budget.media),
      home_stuff: toNumber(budget.home_stuff),
      food: toNumber(budget.food),
      hangouts: toNumber(budget.hangouts),
      parties: toNumber(budget.parties),
      suplements: toNumber(budget.suplements),
      entertainment: toNumber(budget.entertainment),
      health_and_beauty: toNumber(budget.health_and_beauty),
      travels: toNumber(budget.travels),
      transport: toNumber(budget.transport),
      clothes: toNumber(budget.clothes),
      investments: toNumber(budget.investments),
      company_cost: toNumber(budget.company_cost),
      others: toNumber(budget.others),
      ip_box: toNumber(budget.ip_box),
    };
  }
}
