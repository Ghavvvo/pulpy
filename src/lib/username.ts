import { supabase } from "@/lib/supabase";

const RESERVED = new Set([
  "admin", "administrator", "root", "superuser", "owner",
  "login", "signup", "signin", "signout", "logout", "register",
  "dashboard", "settings", "statistics", "stats", "pricing",
  "forgot-password", "reset-password", "verify", "verification",
  "terms", "privacy", "legal", "support", "help", "contact",
  "api", "auth", "app", "www", "mail", "email", "ftp",
  "public", "profile", "profiles", "user", "users", "account",
  "pulpy", "home", "about", "blog", "docs", "static", "assets",
  "null", "undefined", "true", "false",
]);

export const USERNAME_REGEX = /^[a-z0-9](?:[a-z0-9_-]{1,28}[a-z0-9])$/;

export type UsernameValidation =
  | { ok: true; value: string }
  | { ok: false; reason: string };

export function normalizeUsername(input: string): string {
  return input.trim().toLowerCase();
}

export function validateUsernameFormat(input: string): UsernameValidation {
  const value = normalizeUsername(input);
  if (!value) return { ok: false, reason: "El nombre de usuario es obligatorio" };
  if (value.length < 3) return { ok: false, reason: "Mínimo 3 caracteres" };
  if (value.length > 30) return { ok: false, reason: "Máximo 30 caracteres" };
  if (!USERNAME_REGEX.test(value))
    return { ok: false, reason: "Solo letras minúsculas, números, guiones y guion bajo" };
  if (RESERVED.has(value)) return { ok: false, reason: "Este nombre está reservado" };
  return { ok: true, value };
}

export async function isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
  const value = normalizeUsername(username);
  let query = supabase.from("profiles").select("id").eq("username", value).limit(1);
  if (excludeUserId) query = query.neq("id", excludeUserId);
  const { data, error } = await query;
  if (error) {
    console.error("username check error", error);
    return false;
  }
  return (data?.length ?? 0) === 0;
}

export function suggestFromEmail(email: string): string {
  const base = normalizeUsername(email.split("@")[0] || "user").replace(/[^a-z0-9_-]/g, "");
  return base.length >= 3 ? base.slice(0, 30) : `${base}user`.slice(0, 30);
}
