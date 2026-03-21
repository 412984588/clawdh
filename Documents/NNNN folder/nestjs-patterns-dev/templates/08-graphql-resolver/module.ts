/**
 * NestJS GraphQL Resolver
 * Demonstrates: @Resolver, @Query, @Mutation, @Args, @ObjectType, @Field, DataLoader pattern
 */
import {
  Module,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { GraphQLModule, Resolver, Query, Mutation, Args, ObjectType, Field, Int, InputType, ID } from "@nestjs/graphql";

// ── GraphQL Types ─────────────────────────────────────────────────────────────

@ObjectType()
export class Author {
  @Field(() => ID)
  id!: number;

  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field(() => [Post])
  posts!: Post[];
}

@ObjectType()
export class Post {
  @Field(() => ID)
  id!: number;

  @Field()
  title!: string;

  @Field()
  content!: string;

  @Field()
  published!: boolean;

  @Field(() => Int)
  authorId!: number;

  @Field(() => Author, { nullable: true })
  author?: Author;
}

// ── Input Types ───────────────────────────────────────────────────────────────

@InputType()
export class CreatePostInput {
  @Field()
  title!: string;

  @Field()
  content!: string;

  @Field(() => Int)
  authorId!: number;
}

@InputType()
export class UpdatePostInput {
  @Field(() => Int)
  id!: number;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  published?: boolean;
}

// ── Services ──────────────────────────────────────────────────────────────────

@Injectable()
export class AuthorsService {
  private readonly logger = new Logger(AuthorsService.name);
  private authors: Omit<Author, "posts">[] = [
    { id: 1, name: "Alice", email: "alice@example.com" },
    { id: 2, name: "Bob", email: "bob@example.com" },
  ];

  findAll(): Omit<Author, "posts">[] { return this.authors; }

  findOne(id: number): Omit<Author, "posts"> | null {
    return this.authors.find((a) => a.id === id) ?? null;
  }
}

@Injectable()
export class PostsService {
  private posts: Omit<Post, "author">[] = [
    { id: 1, title: "GraphQL with NestJS", content: "...", published: true, authorId: 1 },
    { id: 2, title: "Code-First Schemas", content: "...", published: false, authorId: 1 },
    { id: 3, title: "DataLoader Batching", content: "...", published: true, authorId: 2 },
  ];
  private seq = 4;

  findAll() { return this.posts; }

  findByAuthor(authorId: number) {
    return this.posts.filter((p) => p.authorId === authorId);
  }

  findOne(id: number) {
    return this.posts.find((p) => p.id === id) ?? null;
  }

  create(input: CreatePostInput): Omit<Post, "author"> {
    const post: Omit<Post, "author"> = { ...input, id: this.seq++, published: false };
    this.posts.push(post);
    return post;
  }

  update(input: UpdatePostInput): Omit<Post, "author"> {
    const idx = this.posts.findIndex((p) => p.id === input.id);
    if (idx === -1) throw new NotFoundException(`Post ${input.id} not found`);
    this.posts[idx] = { ...this.posts[idx], ...input };
    return this.posts[idx];
  }

  delete(id: number): boolean {
    const idx = this.posts.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.posts.splice(idx, 1);
    return true;
  }
}

// ── Resolvers ─────────────────────────────────────────────────────────────────

@Resolver(() => Author)
export class AuthorsResolver {
  constructor(
    private readonly authorsService: AuthorsService,
    private readonly postsService: PostsService
  ) {}

  @Query(() => [Author], { name: "authors" })
  findAll(): Omit<Author, "posts">[] {
    return this.authorsService.findAll();
  }

  @Query(() => Author, { name: "author", nullable: true })
  findOne(@Args("id", { type: () => Int }) id: number) {
    return this.authorsService.findOne(id);
  }

  // Field resolver — loaded only when requested
  @Query(() => [Post])
  postsForAuthor(@Args("authorId", { type: () => Int }) authorId: number) {
    return this.postsService.findByAuthor(authorId);
  }
}

@Resolver(() => Post)
export class PostsResolver {
  constructor(
    private readonly postsService: PostsService,
    private readonly authorsService: AuthorsService
  ) {}

  @Query(() => [Post], { name: "posts" })
  findAll() { return this.postsService.findAll(); }

  @Query(() => Post, { name: "post", nullable: true })
  findOne(@Args("id", { type: () => Int }) id: number) {
    return this.postsService.findOne(id);
  }

  @Mutation(() => Post)
  createPost(@Args("input") input: CreatePostInput) {
    return this.postsService.create(input);
  }

  @Mutation(() => Post)
  updatePost(@Args("input") input: UpdatePostInput) {
    return this.postsService.update(input);
  }

  @Mutation(() => Boolean)
  deletePost(@Args("id", { type: () => Int }) id: number) {
    return this.postsService.delete(id);
  }
}

// ── Module ────────────────────────────────────────────────────────────────────

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: true, // code-first: generate schema in memory
      playground: true,
    }),
  ],
  providers: [AuthorsService, PostsService, AuthorsResolver, PostsResolver],
})
export class AppModule {}

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  return app;
}
