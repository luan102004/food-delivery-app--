// src/lib/apiHelpers.ts
import mongoose from 'mongoose';
import connectDBInternal from './mongodb'; // giữ file connectDB hiện tại
import type { NextRequest } from 'next/server';

export async function connectDB() {
  return connectDBInternal();
}

export async function parseRequestBody(req: NextRequest) {
  try {
    return await req.json();
  } catch (err) {
    try {
      const form = await req.formData();
      const obj: any = {};
      for (const [k, v] of form.entries()) {
        if (v instanceof File) continue;
        try { obj[k] = JSON.parse(v as string); }
        catch { obj[k] = v; }
      }
      return obj;
    } catch (e) {
      return {};
    }
  }
}

export function castToObjectId(id?: string | null) {
  if (!id) return null;
  if (mongoose.isValidObjectId(id)) return new mongoose.Types.ObjectId(id);
  throw new Error('Invalid ObjectId: ' + id);
}

export function formatError(e: any) {
  if (!e) return { message: 'Unknown error' };
  if (e instanceof Error) return { message: e.message };
  if (typeof e === 'string') return { message: e };
  return { message: 'Unknown error', raw: e };
}
