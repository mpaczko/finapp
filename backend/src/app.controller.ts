import { Controller, Get } from "@nestjs/common";

import { Public } from "./common/decorators/public.decorator";

@Public()
@Controller()
export class AppController {
  @Get()
  getApiInfo() {
    return {
      name: "finapp-api",
      health: "/api/health",
      resources: ["/api/expenses", "/api/categories", "/api/budgets", "/api/summary/yearly"],
    };
  }
}
