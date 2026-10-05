import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";

import { AppController } from "./app.controller";
import { validateEnv } from "./config/env.validation";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthModule } from "./modules/health/health.module";
import { ExpensesModule } from "./modules/expenses/expenses.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { BudgetsModule } from "./modules/budgets/budgets.module";
import { SummaryModule } from "./modules/summary/summary.module";
import { AuthModule } from "./modules/auth/auth.module";
import { MailModule } from "./modules/mail/mail.module";

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
    MailModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
