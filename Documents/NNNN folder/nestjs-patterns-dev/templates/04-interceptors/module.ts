/**
 * NestJS Interceptors
 * Demonstrates: NestInterceptor, @UseInterceptors, transform response, logging, caching, timeout
 */
import {
  Module,
  Controller,
  Injectable,
  Get,
  Post,
  Body,
  UseInterceptors,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Observable, map, tap, timeout, catchError, throwError } from "rxjs";

// ── 1. Transform Response Interceptor ─────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path?: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    ctx: ExecutionContext,
    next: CallHandler
  ): Observable<ApiResponse<T>> {
    const request = ctx.switchToHttp().getRequest();
    return next.handle().pipe(
      map((data) => ({
        data,
        statusCode: ctx.switchToHttp().getResponse().statusCode,
        timestamp: new Date().toISOString(),
        path: request.url,
      }))
    );
  }
}

// ── 2. Logging Interceptor ────────────────────────────────────────────────────

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = ctx.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () =>
          this.logger.log(`${method} ${url} — ${Date.now() - now}ms`),
        error: (err: unknown) =>
          this.logger.error(
            `${method} ${url} — ${Date.now() - now}ms — ${String(err)}`
          ),
      })
    );
  }
}

// ── 3. Timeout Interceptor ────────────────────────────────────────────────────

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly ms: number = 5000) {}

  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      timeout(this.ms),
      catchError((err) => {
        if (err?.name === "TimeoutError") {
          return throwError(
            () => new HttpException("Request timed out", HttpStatus.GATEWAY_TIMEOUT)
          );
        }
        return throwError(() => err);
      })
    );
  }
}

// ── 4. Cache Interceptor (in-memory) ─────────────────────────────────────────

@Injectable()
export class InMemoryCacheInterceptor implements NestInterceptor {
  private cache = new Map<string, { data: unknown; expiresAt: number }>();

  constructor(private readonly ttlMs: number = 30_000) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = ctx.switchToHttp().getRequest();
    // Only cache GET requests
    if (request.method !== "GET") return next.handle();

    const cacheKey = request.url as string;
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return new Observable((observer) => {
        observer.next(cached.data);
        observer.complete();
      });
    }

    return next.handle().pipe(
      tap((data) => {
        this.cache.set(cacheKey, {
          data,
          expiresAt: Date.now() + this.ttlMs,
        });
      })
    );
  }
}

// ── 5. Service & Controller ───────────────────────────────────────────────────

@Injectable()
export class DataService {
  findAll() {
    return [{ id: 1, name: "Item A" }, { id: 2, name: "Item B" }];
  }

  create(dto: { name: string }) {
    return { id: 3, ...dto };
  }
}

@Controller("data")
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Get()
  @UseInterceptors(new InMemoryCacheInterceptor(10_000))
  findAll() {
    return this.dataService.findAll();
  }

  @Post()
  create(@Body() body: { name: string }) {
    return this.dataService.create(body);
  }

  @Get("slow")
  @UseInterceptors(new TimeoutInterceptor(500))
  async slowEndpoint() {
    await new Promise((res) => setTimeout(res, 200));
    return { message: "Returned before timeout" };
  }
}

// ── Module ────────────────────────────────────────────────────────────────────

@Module({
  controllers: [DataController],
  providers: [DataService, LoggingInterceptor, TransformInterceptor],
})
export class DataModule {}

@Module({ imports: [DataModule] })
export class AppModule {}

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Apply transform + logging globally
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());
  await app.listen(3000);
  return app;
}
