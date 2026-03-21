/**
 * Prisma Transactions
 * Demonstrates: $transaction sequential, $transaction interactive, nested writes, rollback
 */
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// ── Sequential transaction ($transaction array) ───────────────────────────────
// All queries run in a single DB transaction; any failure rolls back all

export async function transferBalance(
  fromUserId: number,
  toUserId: number,
  amount: number
) {
  const [debit, credit] = await prisma.$transaction([
    prisma.wallet.update({
      where: { userId: fromUserId },
      data: { balance: { decrement: amount } },
    }),
    prisma.wallet.update({
      where: { userId: toUserId },
      data: { balance: { increment: amount } },
    }),
  ]);
  console.log(`[Transfer] ${fromUserId} → ${toUserId}: $${amount}`);
  return { debit, credit };
}

export async function createPostWithAuditLog(data: {
  title: string;
  body: string;
  authorId: number;
}) {
  const [post, log] = await prisma.$transaction([
    prisma.post.create({
      data: {
        title: data.title,
        body: data.body,
        authorId: data.authorId,
      },
    }),
    prisma.auditLog.create({
      data: {
        action: "POST_CREATED",
        userId: data.authorId,
        metadata: JSON.stringify({ title: data.title }),
      },
    }),
  ]);
  console.log(`[Post+Log] Created post ${post.id} with audit log ${log.id}`);
  return { post, log };
}

// ── Interactive transaction ($transaction callback) ───────────────────────────
// Gives access to the transaction client (tx); supports read-then-write patterns

export async function purchaseItem(userId: number, itemId: number) {
  return prisma.$transaction(async (tx) => {
    // 1. Read current state
    const item = await tx.item.findUnique({ where: { id: itemId } });
    if (!item) throw new Error(`Item ${itemId} not found`);
    if (item.stock <= 0) throw new Error(`Item ${itemId} out of stock`);

    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new Error(`Wallet not found for user ${userId}`);
    if (wallet.balance < item.price) throw new Error("Insufficient balance");

    // 2. Mutate — all within the same transaction
    const [updatedItem, updatedWallet, order] = await Promise.all([
      tx.item.update({
        where: { id: itemId },
        data: { stock: { decrement: 1 } },
      }),
      tx.wallet.update({
        where: { userId },
        data: { balance: { decrement: item.price } },
      }),
      tx.order.create({
        data: { userId, itemId, amount: item.price },
      }),
    ]);

    console.log(`[Purchase] Order ${order.id}: item ${itemId} for $${item.price}`);
    return { order, updatedItem, updatedWallet };
  });
}

// ── Transaction with retry (serialization failures) ───────────────────────────

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isRetryable =
        err instanceof Prisma.PrismaClientKnownRequestError &&
        (err.code === "P2034" || // Transaction conflict
          (err.message.includes("serialize") && attempt < maxRetries - 1));

      if (!isRetryable) throw err;

      const delay = Math.pow(2, attempt) * 50; // exponential backoff
      console.log(`[Retry] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error(`Failed after ${maxRetries} retries`);
}

export async function incrementViewCount(postId: number) {
  return withRetry(() =>
    prisma.$transaction(async (tx) => {
      const post = await tx.post.findUniqueOrThrow({ where: { id: postId } });
      return tx.post.update({
        where: { id: postId },
        data: { viewCount: post.viewCount + 1 },
      });
    })
  );
}

// ── Nested writes (implicit transaction) ─────────────────────────────────────
// Prisma wraps nested creates/connects in a transaction automatically

export async function createOrderWithItems(order: {
  userId: number;
  items: Array<{ productId: number; quantity: number; price: number }>;
}) {
  return prisma.order.create({
    data: {
      userId: order.userId,
      total: order.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      items: {
        create: order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: { items: true },
  });
}

// ── Transaction timeout ────────────────────────────────────────────────────────

export async function longRunningTransaction() {
  return prisma.$transaction(
    async (tx) => {
      // Do complex work...
      const count = await tx.user.count();
      return { processedUsers: count };
    },
    {
      maxWait: 5000,  // max time to wait for a transaction slot (ms)
      timeout: 10000, // max time the transaction can run (ms)
    }
  );
}

// ── Demo ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Transaction patterns — run against a seeded Prisma database.");
  console.log("All functions are exported for use in your application.");
  await prisma.$disconnect();
}

main().catch(console.error);
