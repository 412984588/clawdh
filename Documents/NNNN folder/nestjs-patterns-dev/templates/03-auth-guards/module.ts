/**
 * NestJS Auth Guards
 * Demonstrates: @UseGuards, CanActivate, JwtAuthGuard, RolesGuard, @SetMetadata, custom decorators
 */
import {
  Module,
  Controller,
  Injectable,
  Get,
  Post,
  UseGuards,
  CanActivate,
  ExecutionContext,
  SetMetadata,
  createParamDecorator,
  UnauthorizedException,
  ForbiddenException,
  Logger,
  Inject,
} from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";

// ── Metadata keys ─────────────────────────────────────────────────────────────

export const IS_PUBLIC_KEY = "isPublic";
export const ROLES_KEY = "roles";

// ── Custom decorators ─────────────────────────────────────────────────────────

/** Mark a route as publicly accessible (skip JWT guard) */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Require one or more roles */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/** Extract current user from request */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  }
);

// ── JWT Guard ─────────────────────────────────────────────────────────────────

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    // Check @Public() decorator on handler or class
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const request = ctx.switchToHttp().getRequest();
    const authHeader = request.headers["authorization"] as string | undefined;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing or invalid Bearer token");
    }

    const token = authHeader.slice(7);
    // Production: verify with JwtService.verify(token)
    const payload = this.verifyToken(token);
    if (!payload) throw new UnauthorizedException("Token invalid or expired");

    request.user = payload;
    return true;
  }

  private verifyToken(token: string) {
    // Simplified — in production use @nestjs/jwt
    try {
      const decoded = Buffer.from(token, "base64url").toString("utf8");
      return JSON.parse(decoded) as { sub: number; email: string; role: string };
    } catch {
      return null;
    }
  }
}

// ── Roles Guard ───────────────────────────────────────────────────────────────

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!requiredRoles?.length) return true;

    const { user } = ctx.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException("No user context");

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) throw new ForbiddenException("Insufficient permissions");
    return true;
  }
}

// ── Auth Service ──────────────────────────────────────────────────────────────

@Injectable()
export class AuthService {
  /** Issue a simple base64url token (replace with real JWT in production) */
  login(user: { id: number; email: string; role: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = Buffer.from(JSON.stringify(payload)).toString("base64url");
    return { access_token: token, token_type: "Bearer" };
  }
}

// ── Controllers ───────────────────────────────────────────────────────────────

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post("login")
  login() {
    // In production: validate credentials first
    return this.authService.login({ id: 1, email: "user@example.com", role: "user" });
  }
}

@Controller("profile")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProfileController {
  @Get()
  getProfile(@CurrentUser() user: { sub: number; email: string; role: string }) {
    return { userId: user.sub, email: user.email };
  }

  @Get("admin-only")
  @Roles("admin")
  adminPanel(@CurrentUser("email") email: string) {
    return { message: "Welcome admin", email };
  }
}

// ── Module ────────────────────────────────────────────────────────────────────

@Module({
  controllers: [AuthController, ProfileController],
  providers: [
    AuthService,
    { provide: "Reflector", useClass: Reflector },
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class AuthModule {}

@Module({ imports: [AuthModule] })
export class AppModule {}

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  return app;
}
