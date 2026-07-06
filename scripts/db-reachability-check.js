const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();

  try {
    // DATABASE_URL is read by Prisma automatically via schema.prisma.
    // We print only the host for debugging.
    const url = process.env.DATABASE_URL || '';
    const host = (() => {
      try {
        const u = new URL(url);
        return u.host;
      } catch {
        return '(invalid DATABASE_URL)';
      }
    })();

    console.log('[DB Reachability Check] DATABASE_URL host:', host);

    // 1) Can we connect?
    // $queryRaw(1) is a cheap query to ensure the connection works.
    await prisma.$queryRaw`SELECT 1`;

    // 2) Confirm Product table exists and can be queried.
    // If the table does not exist, this will throw P2021.
    const count = await prisma.product.count();

    // 3) Print first five titles (also proves read correctness).
    const first5 = await prisma.product.findMany({
      orderBy: { id: 'asc' },
      take: 5,
      select: { id: true, title: true },
    });

    console.log('[DB Reachability Check] Product.count():', count);
    console.log(
      '[DB Reachability Check] First 5 product titles:',
      first5.map((p) => p.title)
    );

    return { ok: true, count, first5Titles: first5.map((p) => p.title) };
  } catch (e) {
    console.error('[DB Reachability Check] FAILED');
    console.error(e);
    process.exitCode = 1;
    return { ok: false, error: String(e) };
  } finally {
    await prisma.$disconnect();
  }
})();

