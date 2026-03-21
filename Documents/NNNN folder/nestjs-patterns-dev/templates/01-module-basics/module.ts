/**
 * NestJS Module Basics
 * Demonstrates: @Module, @Controller, @Injectable, @Get, @Post, @Body, @Param, @Query
 */
import {
  Module,
  Controller,
  Injectable,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

// ── 1. Service layer ──────────────────────────────────────────────────────────

@Injectable()
export class ProductsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ProductsService.name);
  private products: Array<{ id: number; name: string; price: number }> = [];
  private nextId = 1;

  onModuleInit() {
    this.logger.log("ProductsService initialised");
    // Seed data
    this.products = [
      { id: this.nextId++, name: "Widget A", price: 9.99 },
      { id: this.nextId++, name: "Widget B", price: 19.99 },
    ];
  }

  onModuleDestroy() {
    this.logger.log("ProductsService destroyed");
  }

  findAll(search?: string) {
    if (!search) return this.products;
    const lower = search.toLowerCase();
    return this.products.filter((p) => p.name.toLowerCase().includes(lower));
  }

  findOne(id: number) {
    return this.products.find((p) => p.id === id) ?? null;
  }

  create(dto: { name: string; price: number }) {
    const product = { id: this.nextId++, ...dto };
    this.products.push(product);
    return product;
  }
}

// ── 2. Controller layer ───────────────────────────────────────────────────────

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query("search") search?: string) {
    return this.productsService.findAll(search);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.productsService.findOne(Number(id));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: { name: string; price: number }) {
    return this.productsService.create(body);
  }
}

// ── 3. Feature module ─────────────────────────────────────────────────────────

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // allow other modules to import
})
export class ProductsModule {}

// ── 4. Root app module ────────────────────────────────────────────────────────

@Module({
  imports: [ProductsModule],
})
export class AppModule {}

// ── 5. Bootstrap (standalone example) ────────────────────────────────────────

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  await app.listen(3000);
  return app;
}
