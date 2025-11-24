// src/lib/auth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import type { UserRole } from '@/types';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role as UserRole)) {
    throw new Error("Forbidden");
  }
  return user;
}

export function hashPassword(password: string): string {
  const bcrypt = require("bcryptjs");
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  const bcrypt = require("bcryptjs");
  return bcrypt.compareSync(password, hashedPassword);
}

export const auth = () => getServerSession(authOptions);
