/**
 * NestJS Prisma Service
 * Demonstrates: PrismaClient integration, OnModuleInit, transactions, typed queries
 */
import {
  Module,
  Controller,
  Injectable,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  NotFoundException,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

// ── Prisma Client (type stubs for template) ───────────────────────────────────
// In production: import { PrismaClient } from "@prisma/client"

export interface PrismaUser {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  posts: PrismaPost[];
}

export interface PrismaPost {
  id: number;
  title: string;
  content: string;
  published: boolean;
  authorId: number;
  createdAt: Date;
}

// ── Prisma Service ─────────────────────────────────────────────────────────────

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  // In production: extends PrismaClient and calls super()
  private users: PrismaUser[] = [];
  private posts: PrismaPost[] = [];
  private userSeq = 1;
  private postSeq = 1;

  async onModuleInit() {
    // await this.$connect();  ← production line
    this.logger.log("Prisma connected");
    // Seed
    this.users.push({
      id: this.userSeq++,
      email: "alice@example.com",
      name: "Alice",
      createdAt: new Date(),
      posts: [],
    });
  }

  async onModuleDestroy() {
    // await this.$disconnect();
    this.logger.log("Prisma disconnected");
  }

  // ── Prisma-style query methods ──────────────────────────────────────────────

  readonly user = {
    findMany: async () => this.users,
    findUnique: async ({ where }: { where: { id?: number; email?: string } }) =>
      this.users.find((u) =>
        where.id ? u.id === where.id : u.email === where.email
      ) ?? null,
    create: async ({ data }: { data: Omit<PrismaUser, "id" | "createdAt" | "posts"> }) => {
      const user: PrismaUser = {
        ...data,
        id: this.userSeq++,
        createdAt: new Date(),
        posts: [],
      };
      this.users.push(user);
      return user;
    },
    delete: async ({ where }: { where: { id: number } }) => {
      const idx = this.users.findIndex((u) => u.id === where.id);
      if (idx === -1) throw new Error(`User ${where.id} not found`);
      const [deleted] = this.users.splice(idx, 1);
      return deleted;
    },
  };

  readonly post = {
    findMany: async ({ where }: { where?: { authorId?: number; published?: boolean } } = {}) =>
      this.posts.filter((p) => {
        if (where?.authorId !== undefined && p.authorId !== where.authorId) return false;
        if (where?.published !== undefined && p.published !== where.published) return false;
        return true;
      }),
    create: async ({ data }: { data: Omit<PrismaPost, "id" | "createdAt"> }) => {
      const post: PrismaPost = { ...data, id: this.postSeq++, createdAt: new Date() };
      this.posts.push(post);
      return post;
    },
  };

  /** Simulate a Prisma $transaction */
  async $transaction<T>(fn: (tx: this) => Promise<T>): Promise<T> {
    this.logger.log("Transaction start");
    try {
      const result = await fn(this);
      this.logger.log("Transaction committed");
      return result;
    } catch (err) {
      this.logger.error("Transaction rolled back");
      throw err;
    }
  }
}

// ── Users Service ─────────────────────────────────────────────────────────────

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() { return this.prisma.user.findMany(); }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  create(dto: { name: string; email: string }) {
    return this.prisma.user.create({ data: dto });
  }

  async createWithPost(dto: { name: string; email: string; postTitle: string }) {
    // Use transaction to create user + first post atomically
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { name: dto.name, email: dto.email } });
      const post = await tx.post.create({
        data: { title: dto.postTitle, content: "", published: false, authorId: user.id },
      });
      return { user, post };
    });
  }

  delete(id: number) { return this.prisma.user.delete({ where: { id } }); }
}

// ── Controller ────────────────────────────────────────────────────────────────

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() { return this.usersService.findAll(); }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() body: { name: string; email: string }) {
    return this.usersService.create(body);
  }

  @Post("with-post")
  createWithPost(@Body() body: { name: string; email: string; postTitle: string }) {
    return this.usersService.createWithPost(body);
  }

  @Delete(":id")
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.delete(id);
  }
}

// ── Module ────────────────────────────────────────────────────────────────────

@Module({
  controllers: [UsersController],
  providers: [PrismaService, UsersService],
  exports: [PrismaService],
})
export class UsersModule {}

@Module({ imports: [UsersModule] })
export class AppModule {}

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  return app;
}
