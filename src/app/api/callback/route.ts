import { NextResponse } from "next/server";
import { deliver, limited, str, validPhone } from "@/lib/orders";

/** «Передзвоніть мені» and «Купити в один клік»: name + phone, optionally the product. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Некоректний запит." }, { status: 400 });
  if (str(body.website, 200)) return NextResponse.json({ ok: true });
  if (limited(req)) return NextResponse.json({ error: "Забагато спроб. Спробуйте за кілька хвилин." }, { status: 429 });
  const phone = str(body.phone, 24);
  if (!validPhone(phone)) return NextResponse.json({ error: "Перевірте номер телефону." }, { status: 422 });
  const name = str(body.name, 80);
  const product = str(body.product, 200);
  const topic = str(body.topic, 200);
  const text = [`Ім’я: ${name || "не вказано"}`, `Телефон: ${phone}`, product && `Товар: ${product}`, topic && `Питання: ${topic}`].filter(Boolean).join("\n");
  const ok = await deliver("callback", product ? `⚡ Купити в один клік — ${product}` : "📞 Передзвоніть мені", text, { name, phone, product, topic });
  if (!ok) return NextResponse.json({ error: "Не вдалося надіслати заявку." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
