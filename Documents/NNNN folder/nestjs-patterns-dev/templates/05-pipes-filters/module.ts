/**
 * NestJS Pipes & Exception Filters
 * Demonstrates: PipeTransform, ExceptionFilter, @Catch, custom pipes, built-in pipes
 */
import {
  Module,
  Controller,
  Injectable,
  Get,
  Post,
  Body,
  Param,
  UsePipes,
  UseFilters,
  PipeTransform,
  ArgumentMetadata,
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  Logger,
  ParseIntPipe,
  ParseUUIDPipe,
  ValidationPipe,
} from "@nestjs/common";
import { NestFactory, HttpAdapterHost } from "@nestjs/core";

// ── 1. Custom Transform Pipe ──────────────────────────────────────────────────

@Injectable()
export class TrimStringPipe implements PipeTransform<string, string> {
  transform(value: string, _meta: ArgumentMetadata): string {
    if (typeof value !== "string") return value;
    return value.trim();
  }
}

// ── 2. Validation Pipe (manual) ───────────────────────────────────────────────

@Injectable()
export class PositiveNumberPipe implements PipeTransform<string, number> {
  transform(value: string, _meta: ArgumentMetadata): number {
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      throw new BadRequestException(`Value must be a positive number, got: ${value}`);
    }
    return num;
  }
}

// ── 3. Sanitise HTML Pipe ─────────────────────────────────────────────────────

@Injectable()
export class SanitiseHtmlPipe implements PipeTransform<string, string> {
  private readonly htmlTags = /<[^>]*>/g;

  transform(value: unknown): string {
    if (typeof value !== "string") return String(value);
    return value.replace(this.htmlTags, "");
  }
}

// ── 4. HTTP Exception Filter ──────────────────────────────────────────────────

export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<{ status: (n: number) => { json: (o: unknown) => void } }>();
    const request = ctx.getRequest<{ url: string }>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as
      | string
      | { message: string | string[]; error?: string };

    const errorBody: ErrorResponse = {
      statusCode: status,
      message:
        typeof exceptionResponse === "string"
          ? exceptionResponse
          : exceptionResponse.message,
      error:
        typeof exceptionResponse === "object"
          ? (exceptionResponse.error ?? HttpStatus[status])
          : HttpStatus[status],
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.warn(`${status} — ${request.url} — ${JSON.stringify(errorBody.message)}`);
    response.status(status).json(errorBody);
  }
}

// ── 5. Global Exception Filter (catch-all) ────────────────────────────────────

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : "Internal server error";

    this.logger.error(`Unhandled exception: ${String(exception)}`);
    httpAdapter.reply(
      ctx.getResponse(),
      { statusCode: status, message, timestamp: new Date().toISOString() },
      status
    );
  }
}

// ── 6. Service & Controller ───────────────────────────────────────────────────

@Injectable()
export class ItemsService {
  private items: Array<{ id: number; name: string; quantity: number }> = [
    { id: 1, name: "Apple", quantity: 10 },
    { id: 2, name: "Banana", quantity: 5 },
  ];

  findOne(id: number) {
    const item = this.items.find((i) => i.id === id);
    if (!item) throw new HttpException(`Item ${id} not found`, HttpStatus.NOT_FOUND);
    return item;
  }

  create(dto: { name: string; quantity: number }) {
    const item = { id: this.items.length + 1, ...dto };
    this.items.push(item);
    return item;
  }
}

@Controller("items")
@UseFilters(HttpExceptionFilter)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get(":id")
  findOne(@Param("id", PositiveNumberPipe) id: number) {
    return this.itemsService.findOne(id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(
    @Body("name", TrimStringPipe, SanitiseHtmlPipe) name: string,
    @Body("quantity", ParseIntPipe) quantity: number
  ) {
    return this.itemsService.create({ name, quantity });
  }
}

// ── Module ────────────────────────────────────────────────────────────────────

@Module({
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}

@Module({ imports: [ItemsModule] })
export class AppModule {}

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  await app.listen(3000);
  return app;
}
