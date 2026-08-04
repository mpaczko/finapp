import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { ExpensesQueryDto } from "./dto/expenses-query.dto";
import { UpdateExpenseDto } from "./dto/update-expense.dto";

const toDatabaseDate = (value: string) => new Date(`${value}T00:00:00.000Z`);
const toDateOnly = (value: Date | string) =>
  value instanceof Date ? value.toISOString().slice(0, 10) : value;
const toNumber = (value: unknown) => Number(value ?? 0);

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: ExpensesQueryDto) {
    const { from, to } = this.resolveDateRange(query);

    const expenses = await this.prisma.expense.findMany({
      where: {
        user_id: userId,
        date: {
          gte: from,
          lte: to,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return expenses.map(this.mapExpense);
  }

  async create(userId: string, dto: CreateExpenseDto) {
    const expense = await this.prisma.expense.create({
      data: {
        name: dto.name,
        category: dto.category,
        date: toDatabaseDate(dto.date),
        cost: dto.cost,
        user_id: userId,
      },
    });

    return this.mapExpense(expense);
  }

  async update(userId: string, id: string, dto: UpdateExpenseDto) {
    const existing = await this.prisma.expense.findFirst({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!existing) {
      throw new NotFoundException("Expense not found");
    }

    const data: Prisma.ExpenseUpdateInput = {
      name: dto.name,
      category: dto.category,
      date: dto.date ? toDatabaseDate(dto.date) : undefined,
      cost: dto.cost,
    };

    const expense = await this.prisma.expense.update({
      where: { id },
      data,
    });

    return this.mapExpense(expense);
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.expense.findFirst({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!existing) {
      throw new NotFoundException("Expense not found");
    }

    await this.prisma.expense.delete({
      where: { id },
    });

    return { id };
  }

  private resolveDateRange(query: ExpensesQueryDto) {
    if (query.month) {
      const [year, month] = query.month.split("-").map(Number);
      const from = new Date(Date.UTC(year, month - 1, 1));
      const to = new Date(Date.UTC(year, month, 0));

      return { from, to };
    }

    if (query.from && query.to) {
      return {
        from: toDatabaseDate(query.from),
        to: toDatabaseDate(query.to),
      };
    }

    throw new BadRequestException("Provide month or from/to date range");
  }

  private mapExpense(expense: {
    id: string;
    created_at: Date;
    name: string;
    category: string;
    date: Date;
    cost: unknown;
  }) {
    return {
      id: expense.id,
      created_at: expense.created_at.toISOString(),
      name: expense.name,
      category: expense.category,
      date: toDateOnly(expense.date),
      cost: toNumber(expense.cost),
    };
  }
}
