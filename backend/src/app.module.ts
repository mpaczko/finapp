import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";

import { AppController } from "./app.controller";
import { validateEnv } from "./config/env.validation";
import { SupabaseAuthGuard } from "./common/guards/supabase-auth.guard";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthModule } from "./modules/health/health.module";
import { ExpensesModule } from "./modules/expenses/expenses.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { BudgetsModule } from "./modules/budgets/budgets.module";
import { SummaryModule } from "./modules/summary/summary.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    JwtModule.register({}),
    PrismaModule,
    HealthModule,
    ExpensesModule,
    CategoriesModule,
    BudgetsModule,
    SummaryModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: SupabaseAuthGuard,
    },
  ],
})
export class AppModule {}
