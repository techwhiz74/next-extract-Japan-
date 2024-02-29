import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

let log: any[] = ["error", "warn"];
if (process.env.NODE_ENV !== "production") {
  log = ["query", "error", "info", "warn"];
}

const client = globalThis.prisma || new PrismaClient({ log });

if (process.env.NODE_ENV !== "production") globalThis.prisma = client;

export default client;
