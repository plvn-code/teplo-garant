import "server-only";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

/**
 * Delivers an order or a call-back request to the shop.
 * Channels, in order: Telegram bot (TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID), email via Resend (RESEND_API_KEY, LEAD_EMAIL_TO),
 * and as a last resort data/orders.jsonl — which only works on a local disk (on Vercel it fails, so the visitor sees the phone number).
 * Returns true when at least one channel accepted it.
 */
export async function deliver(kind: "order" | "callback", subject: string, text: string, record: object): Promise<boolean> {
  let ok = false;

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (token && chat) {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text: `${subject}\n\n${text}`.slice(0, 4000), disable_web_page_preview: true }),
    }).catch((err) => {
      console.error("[deliver] telegram failed", err);
      return null;
    });
    if (res?.ok) ok = true;
    else console.error("[deliver] telegram rejected", res?.status);
  }

  const key = process.env.RESEND_API_KEY;
  if (key) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.LEAD_EMAIL_FROM || "Teplogarant <onboarding@resend.dev>",
        to: (process.env.LEAD_EMAIL_TO || "").split(",").map((s) => s.trim()).filter(Boolean),
        subject,
        text,
      }),
    }).catch((err) => {
      console.error("[deliver] email failed", err);
      return null;
    });
    if (res?.ok) ok = true;
    else console.error("[deliver] email rejected", res?.status);
  }

  if (ok) return true;
  try {
    const dir = path.join(process.cwd(), "data");
    await mkdir(dir, { recursive: true });
    await appendFile(path.join(dir, "orders.jsonl"), JSON.stringify({ kind, ...record, receivedAt: new Date().toISOString() }) + "\n", "utf8");
    return true;
  } catch (err) {
    console.error("[deliver] could not store", err);
    return false;
  }
}

/** Light abuse guard: at most `max` submissions per address per 10 minutes on one server instance. */
const hits = new Map<string, number[]>();
export function limited(req: Request, max = 6) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 600_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > max;
}

export const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
export const validPhone = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  return d.length >= 9 && d.length <= 15;
};
