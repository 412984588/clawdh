/**
 * Fastify Authentication
 * Demonstrates: JWT plugin, API key auth, role-based access, refresh tokens
 */
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fastifyJwt from "@fastify/jwt";
import fp from "fastify-plugin";

// ── Types ─────────────────────────────────────────────────────────────────────

interface JwtPayload {
  sub: string;
  email: string;
  role: "USER" | "ADMIN" | "MODERATOR";
  iat?: number;
  exp?: number;
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

declare module "fastify" {
  interface FastifyRequest {
    user: JwtPayload;
  }
}

// ── JWT authentication plugin ─────────────────────────────────────────────────

export async function buildApp(): Promise<FastifyInstance> {
  const fastify = Fastify({ logger: false });

  // Register @fastify/jwt
  await fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET ?? "super-secret-key-change-in-production",
    sign: { expiresIn: "15m" },
  });

  // ── Auth hook (reusable) ──────────────────────────────────────────────────────

  const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({ error: "Invalid or expired token" });
    }
  };

  const requireRole = (role: JwtPayload["role"]) =>
    async (request: FastifyRequest, reply: FastifyReply) => {
      await authenticate(request, reply);
      if (reply.sent) return;
      if (request.user.role !== role && request.user.role !== "ADMIN") {
        return reply.code(403).send({ error: "Insufficient permissions" });
      }
    };

  // ── Auth routes ───────────────────────────────────────────────────────────────

  fastify.post<{ Body: { email: string; password: string } }>(
    "/auth/login",
    async (request, reply) => {
      const { email, password } = request.body;

      // Validate credentials (replace with real DB lookup + bcrypt)
      if (password !== "correct-password") {
        return reply.code(401).send({ error: "Invalid credentials" });
      }

      const payload: JwtPayload = {
        sub: "user-id-123",
        email,
        role: "USER",
      };

      const accessToken = fastify.jwt.sign(payload, { expiresIn: "15m" });
      const refreshToken = fastify.jwt.sign(
        { sub: payload.sub },
        { expiresIn: "7d" }
      );

      return reply.send({ accessToken, refreshToken });
    }
  );

  fastify.post<{ Body: { refreshToken: string } }>(
    "/auth/refresh",
    async (request, reply) => {
      try {
        const decoded = fastify.jwt.verify<{ sub: string }>(request.body.refreshToken);
        // Look up user by decoded.sub and issue new access token
        const newToken = fastify.jwt.sign({
          sub: decoded.sub,
          email: "user@example.com",
          role: "USER" as const,
        });
        return reply.send({ accessToken: newToken });
      } catch {
        return reply.code(401).send({ error: "Invalid refresh token" });
      }
    }
  );

  fastify.post(
    "/auth/logout",
    { preHandler: authenticate },
    async (request, reply) => {
      // In production: add token to denylist (Redis)
      return reply.send({ message: "Logged out" });
    }
  );

  // ── Protected routes ──────────────────────────────────────────────────────────

  fastify.get(
    "/profile",
    { preHandler: authenticate },
    async (request, reply) => {
      return reply.send({ user: request.user });
    }
  );

  fastify.get(
    "/admin/users",
    { preHandler: requireRole("ADMIN") },
    async (_request, reply) => {
      return reply.send({ users: [] });
    }
  );

  // ── API key authentication ────────────────────────────────────────────────────

  fastify.register(async (app) => {
    app.addHook("preHandler", async (request: FastifyRequest, reply: FastifyReply) => {
      const apiKey = request.headers["x-api-key"];
      if (!apiKey || apiKey !== process.env.API_KEY) {
        return reply.code(401).send({ error: "Invalid API key" });
      }
    });

    app.get("/webhook-data", async (_req, reply) => {
      return reply.send({ data: [] });
    });
  }, { prefix: "/api/v1" });

  return fastify;
}

// ── Demo ──────────────────────────────────────────────────────────────────────

async function main() {
  const app = await buildApp();
  await app.listen({ port: 3000 });
  console.log("Fastify auth demo on http://localhost:3000");
}

if (require.main === module) {
  main().catch(console.error);
}

export default buildApp;
