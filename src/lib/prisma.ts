import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// 개발/프로덕션 모두 global에 캐시 → 같은 함수 인스턴스 재사용 시 커넥션 재활용
export const prisma =
  global.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

global.prisma = prisma;
