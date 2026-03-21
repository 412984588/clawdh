/**
 * NestJS Microservices
 * Demonstrates: @nestjs/microservices, TCP transport, @MessagePattern, @EventPattern, ClientProxy
 */
import {
  Module,
  Controller,
  Injectable,
  Get,
  Post,
  Body,
  Inject,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  Client,
  ClientProxy,
  ClientsModule,
  MessagePattern,
  EventPattern,
  Payload,
  Ctx,
  Transport,
  TcpContext,
  MicroserviceOptions,
  NestMicroservice,
} from "@nestjs/microservices";
import { Observable } from "rxjs";

// ── Message Patterns (shared constants) ───────────────────────────────────────

export const USERS_SERVICE = "USERS_SERVICE";
export const ORDER_PATTERNS = {
  CREATE: "orders.create",
  FIND_ALL: "orders.findAll",
  FIND_ONE: "orders.findOne",
  STATUS_CHANGED: "orders.statusChanged",
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Order {
  id: number;
  userId: number;
  items: { productId: number; qty: number; price: number }[];
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  createdAt: string;
}

// ── Orders Microservice ───────────────────────────────────────────────────────

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private orders: Order[] = [];
  private seq = 1;

  create(dto: { userId: number; items: Order["items"] }): Order {
    const total = dto.items.reduce((s, i) => s + i.qty * i.price, 0);
    const order: Order = {
      id: this.seq++,
      userId: dto.userId,
      items: dto.items,
      total,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    this.orders.push(order);
    this.logger.log(`Order ${order.id} created for user ${order.userId}`);
    return order;
  }

  findAll() { return this.orders; }

  findOne(id: number) { return this.orders.find((o) => o.id === id) ?? null; }

  updateStatus(id: number, status: Order["status"]) {
    const order = this.findOne(id);
    if (order) order.status = status;
    return order;
  }
}

@Controller()
export class OrdersMicroserviceController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern(ORDER_PATTERNS.CREATE)
  create(@Payload() dto: { userId: number; items: Order["items"] }, @Ctx() ctx: TcpContext): Order {
    console.log(`[TCP] pattern=${ctx.getPattern()}`);
    return this.ordersService.create(dto);
  }

  @MessagePattern(ORDER_PATTERNS.FIND_ALL)
  findAll(): Order[] {
    return this.ordersService.findAll();
  }

  @MessagePattern(ORDER_PATTERNS.FIND_ONE)
  findOne(@Payload() data: { id: number }): Order | null {
    return this.ordersService.findOne(data.id);
  }

  // Event-based (fire-and-forget, no response)
  @EventPattern(ORDER_PATTERNS.STATUS_CHANGED)
  handleStatusChanged(@Payload() data: { orderId: number; status: Order["status"] }) {
    this.ordersService.updateStatus(data.orderId, data.status);
  }
}

// ── API Gateway (HTTP → Microservice) ─────────────────────────────────────────

@Injectable()
export class OrdersGatewayService implements OnModuleInit {
  constructor(
    @Inject(USERS_SERVICE) private readonly client: ClientProxy
  ) {}

  async onModuleInit() {
    // await this.client.connect();
  }

  createOrder(dto: { userId: number; items: Order["items"] }): Observable<Order> {
    return this.client.send<Order>(ORDER_PATTERNS.CREATE, dto);
  }

  findAllOrders(): Observable<Order[]> {
    return this.client.send<Order[]>(ORDER_PATTERNS.FIND_ALL, {});
  }

  findOneOrder(id: number): Observable<Order | null> {
    return this.client.send<Order | null>(ORDER_PATTERNS.FIND_ONE, { id });
  }

  emitStatusChanged(orderId: number, status: Order["status"]): Observable<void> {
    return this.client.emit(ORDER_PATTERNS.STATUS_CHANGED, { orderId, status });
  }
}

@Controller("orders")
export class OrdersController {
  constructor(private readonly gatewayService: OrdersGatewayService) {}

  @Get()
  findAll() { return this.gatewayService.findAllOrders(); }

  @Post()
  create(@Body() body: { userId: number; items: Order["items"] }) {
    return this.gatewayService.createOrder(body);
  }
}

// ── Modules ───────────────────────────────────────────────────────────────────

/** Microservice module — runs as a separate process on port 3001 */
@Module({
  controllers: [OrdersMicroserviceController],
  providers: [OrdersService],
})
export class OrdersMicroserviceModule {}

/** API Gateway module — runs as HTTP server, proxies to microservice */
@Module({
  imports: [
    ClientsModule.register([
      {
        name: USERS_SERVICE,
        transport: Transport.TCP,
        options: { host: "localhost", port: 3001 },
      },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersGatewayService],
})
export class AppModule {}

// ── Bootstrap helpers ─────────────────────────────────────────────────────────

/** Start the orders microservice on TCP port 3001 */
export async function bootstrapMicroservice(): Promise<NestMicroservice> {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    OrdersMicroserviceModule,
    { transport: Transport.TCP, options: { host: "localhost", port: 3001 } }
  );
  await app.listen();
  return app;
}

/** Start the HTTP API gateway on port 3000 */
export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  return app;
}
