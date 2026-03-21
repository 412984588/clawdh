/**
 * NestJS TypeORM Entities
 * Demonstrates: @Entity, @Column, @PrimaryGeneratedColumn, @OneToMany, @ManyToOne, Repository pattern
 */
import {
  Module,
  Controller,
  Injectable,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Repository,
  Index,
  DeleteDateColumn,
} from "typeorm";

// ── Entities ──────────────────────────────────────────────────────────────────

@Entity("users")
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  @Index()
  email!: string;

  @Column()
  name!: string;

  @Column({ select: false }) // never returned by default
  passwordHash!: string;

  @Column({ default: "user" })
  role!: string;

  @OneToMany(() => PostEntity, (post) => post.author, { lazy: true })
  posts!: Promise<PostEntity[]>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date; // soft-delete support
}

@Entity("posts")
export class PostEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column("text")
  content!: string;

  @Column({ default: false })
  published!: boolean;

  @ManyToOne(() => UserEntity, (user) => user.posts, { onDelete: "CASCADE" })
  @JoinColumn({ name: "author_id" })
  author!: UserEntity;

  @Column({ name: "author_id" })
  authorId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

// ── Services ──────────────────────────────────────────────────────────────────

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>
  ) {}

  async findAll() {
    return this.usersRepo.find({ order: { createdAt: "DESC" } });
  }

  async findOne(id: number) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async create(dto: { name: string; email: string; passwordHash: string }) {
    const user = this.usersRepo.create(dto);
    return this.usersRepo.save(user);
  }

  async softDelete(id: number) {
    await this.findOne(id);
    await this.usersRepo.softDelete(id);
    this.logger.log(`User ${id} soft-deleted`);
  }
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postsRepo: Repository<PostEntity>
  ) {}

  findByAuthor(authorId: number) {
    return this.postsRepo.find({
      where: { authorId },
      order: { createdAt: "DESC" },
    });
  }

  async create(dto: { title: string; content: string; authorId: number }) {
    const post = this.postsRepo.create(dto);
    return this.postsRepo.save(post);
  }

  async publish(id: number) {
    await this.postsRepo.update(id, { published: true });
    return this.postsRepo.findOne({ where: { id } });
  }
}

// ── Controllers ───────────────────────────────────────────────────────────────

@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService
  ) {}

  @Get()
  findAll() { return this.usersService.findAll(); }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Get(":id/posts")
  getUserPosts(@Param("id", ParseIntPipe) id: number) {
    return this.postsService.findByAuthor(id);
  }

  @Post()
  create(@Body() body: { name: string; email: string }) {
    return this.usersService.create({ ...body, passwordHash: "hashed" });
  }
}

// ── Module ────────────────────────────────────────────────────────────────────

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, PostEntity])],
  controllers: [UsersController],
  providers: [UsersService, PostsService],
  exports: [UsersService],
})
export class UsersModule {}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: ":memory:",
      entities: [UserEntity, PostEntity],
      synchronize: true, // dev only — use migrations in production
    }),
    UsersModule,
  ],
})
export class AppModule {}

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  return app;
}
