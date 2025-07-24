import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// lib/utils.ts
import { NextRequest } from 'next/server'

export function getTokenFromCookie(req: NextRequest): string | null {
  const cookie = req.cookies.get('token')
  return cookie?.value || null
}
