/**
 * NestJS DTO Validation
 * Demonstrates: class-validator, class-transformer, ValidationPipe, DTOs with decorators
 */
import {
  Module,
  Controller,
  Injectable,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Get,
  Param,
  ParseIntPipe,
} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  IsString,
  IsNumber,
  IsEmail,
  IsOptional,
  IsEnum,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsArray,
  ValidateNested,
  IsPositive,
  IsNotEmpty,
  IsUrl,
} from "class-validator";
import { Type, plainToInstance, Exclude, Expose } from "class-transformer";

// ── Enums ─────────────────────────────────────────────────────────────────────

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  GUEST = "guest",
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  street!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsOptional()
  zip?: string;
}

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name!: string;

  @IsEmail()
  email!: string;

  @IsNumber()
  @Min(0)
  @Max(120)
  age!: number;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.USER;

  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class UpdateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  age?: number;
}

// ── Response DTO (serialisation) ──────────────────────────────────────────────

export class UserResponseDto {
  @Expose()
  id!: number;

  @Expose()
  name!: string;

  @Expose()
  email!: string;

  @Expose()
  role!: UserRole;

  @Exclude()
  passwordHash?: string; // never sent to client
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class UsersService {
  private users: Array<CreateUserDto & { id: number; passwordHash: string }> =
    [];
  private nextId = 1;

  create(dto: CreateUserDto) {
    const user = { ...dto, id: this.nextId++, passwordHash: "hashed!" };
    this.users.push(user);
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  findOne(id: number) {
    const user = this.users.find((u) => u.id === id);
    if (!user) return null;
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}

// ── Controller ────────────────────────────────────────────────────────────────

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Global ValidationPipe applied in bootstrap; this adds transform
  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }
}

// ── Module ────────────────────────────────────────────────────────────────────

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

@Module({ imports: [UsersModule] })
export class AppModule {}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Global validation pipe with automatic transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true, // strip unknown properties
      forbidNonWhitelisted: true, // throw on unknown properties
    })
  );
  await app.listen(3000);
  return app;
}
