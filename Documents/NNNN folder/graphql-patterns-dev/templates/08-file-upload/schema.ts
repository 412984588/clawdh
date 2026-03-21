/**
 * GraphQL File Upload
 * Demonstrates: multipart/form-data, Upload scalar, image processing, storage
 */
import { ApolloServer, gql } from "apollo-server";
import { GraphQLUpload, FileUpload } from "graphql-upload";
import * as path from "path";
import * as fs from "fs";
import * as crypto from "crypto";

// ── Types ─────────────────────────────────────────────────────────────────────

interface UploadResult {
  filename: string;
  mimetype: string;
  encoding: string;
  url: string;
  size: number;
}

interface UserAvatar {
  userId: string;
  url: string;
  uploadedAt: string;
}

// ── Storage helpers ───────────────────────────────────────────────────────────

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

async function saveUpload(file: FileUpload): Promise<UploadResult> {
  const { createReadStream, filename, mimetype, encoding } = await file;
  const ext = path.extname(filename);
  const uniqueName = `${crypto.randomBytes(8).toString("hex")}${ext}`;
  const uploadPath = path.join(UPLOAD_DIR, uniqueName);

  // Ensure upload dir exists
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  const stream = createReadStream();
  let size = 0;

  await new Promise<void>((resolve, reject) => {
    const writeStream = fs.createWriteStream(uploadPath);
    stream.on("data", (chunk: Buffer) => { size += chunk.length; });
    stream.pipe(writeStream);
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
    stream.on("error", reject);
  });

  return {
    filename: uniqueName,
    mimetype,
    encoding,
    url: `/uploads/${uniqueName}`,
    size,
  };
}

function validateImageType(mimetype: string) {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(mimetype)) {
    throw new Error(`Invalid file type: ${mimetype}. Allowed: ${allowed.join(", ")}`);
  }
}

function validateFileSize(size: number, maxMB = 5) {
  const maxBytes = maxMB * 1024 * 1024;
  if (size > maxBytes) {
    throw new Error(`File too large: ${(size / 1024 / 1024).toFixed(1)}MB. Max: ${maxMB}MB`);
  }
}

// ── Type definitions ──────────────────────────────────────────────────────────

export const typeDefs = gql`
  scalar Upload

  type UploadResult {
    filename: String!
    mimetype: String!
    encoding: String!
    url: String!
    size: Int!
  }

  type UserAvatar {
    userId: ID!
    url: String!
    uploadedAt: String!
  }

  type MultiUploadResult {
    successful: [UploadResult!]!
    failed: [String!]!
    totalUploaded: Int!
  }

  type Mutation {
    """Upload a single file"""
    uploadFile(file: Upload!): UploadResult!

    """Upload user avatar (image only, max 5MB)"""
    uploadAvatar(userId: ID!, file: Upload!): UserAvatar!

    """Upload multiple files at once"""
    uploadMultiple(files: [Upload!]!): MultiUploadResult!
  }

  type Query {
    """Get user avatar"""
    avatar(userId: ID!): UserAvatar
  }
`;

// ── Store ─────────────────────────────────────────────────────────────────────

const avatars = new Map<string, UserAvatar>();

// ── Resolvers ─────────────────────────────────────────────────────────────────

export const resolvers = {
  Upload: GraphQLUpload,

  Query: {
    avatar: (_: unknown, { userId }: { userId: string }) => avatars.get(userId) ?? null,
  },

  Mutation: {
    uploadFile: async (_: unknown, { file }: { file: Promise<FileUpload> }) => {
      const result = await saveUpload(await file);
      return result;
    },

    uploadAvatar: async (
      _: unknown,
      { userId, file }: { userId: string; file: Promise<FileUpload> }
    ) => {
      const uploadedFile = await file;
      const { mimetype } = uploadedFile;

      validateImageType(mimetype);
      const result = await saveUpload(uploadedFile);
      validateFileSize(result.size);

      const avatar: UserAvatar = {
        userId,
        url: result.url,
        uploadedAt: new Date().toISOString(),
      };

      avatars.set(userId, avatar);
      return avatar;
    },

    uploadMultiple: async (
      _: unknown,
      { files }: { files: Promise<FileUpload>[] }
    ) => {
      const successful: UploadResult[] = [];
      const failed: string[] = [];

      await Promise.all(
        files.map(async (filePromise) => {
          try {
            const result = await saveUpload(await filePromise);
            successful.push(result);
          } catch (err) {
            failed.push(err instanceof Error ? err.message : String(err));
          }
        })
      );

      return {
        successful,
        failed,
        totalUploaded: successful.length,
      };
    },
  },
};

// ── Server ────────────────────────────────────────────────────────────────────

export async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    // graphql-upload handles multipart requests via middleware
  });

  const { url } = await server.listen({ port: 4000 });
  console.log(`GraphQL file upload server ready at ${url}`);
  return server;
}
