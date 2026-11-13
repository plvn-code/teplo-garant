/** Contacts and facts from the old site teplogarant.in.ua (header, footer, «Про нас», «Доставка та оплата», «Контакти»). */
export const site = {
  name: "Teplogarant",
  brand: "Тепло Гарант",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://teplogarant.vercel.app",
  description:
    "Тепло Гарант — дизайнерські та сталеві радіатори, рушникосушки, крани й ТЕНи від IRSAP, Zehnder, Vasco, Stelrad, Quinn і Purmo. Офіційний дистриб’ютор Stelrad, з 2000 року. Склад під Львовом, шоуруми в Києві та Івано-Франківську, доставка по Україні.",
  phone: "+38 098 935 15 71",
  phoneHref: "tel:+380989351571",
  email: "info@teplogarant.in.ua",
  city: "Львів",
  address: "смт Наварія, автошлях Т1416 (Львів — Пустомити)",
  addressShort: "Наварія, 10 км від Львова",
  hours: "Пн–Пт 09:00–18:00, Сб 09:00–14:00",
  hoursShort: "Пн–Пт 9–18 · Сб 9–14",
  since: 2000,
  mapHref: "https://www.google.com/maps/search/?api=1&query=%D0%A2%D0%B5%D0%BF%D0%BB%D0%BE%D0%B3%D0%B0%D1%80%D0%B0%D0%BD%D1%82+%D0%9D%D0%B0%D0%B2%D0%B0%D1%80%D1%96%D1%8F",
  tourHref: "https://my.matterport.com/show/?m=r2EZ4e81eKL&sr=-2.99,-.92&ss=120",
  socials: [
    { name: "Instagram", short: "IG", href: "https://www.instagram.com/teplogarantlv/", handle: "@teplogarantlv" },
    { name: "Facebook", short: "FB", href: "https://www.facebook.com/teplogarantlv/", handle: "teplogarantlv" },
    { name: "Telegram", short: "TG", href: "https://t.me/Teplogarantlv", handle: "@Teplogarantlv" },
    { name: "Viber", short: "VB", href: "viber://chat?number=%2B380989351571", handle: "+380 98 935 15 71" },
  ],
};

/** Head office + showrooms (old «Про нас»: склад під Львовом, шоуруми в Києві та Івано-Франківську). */
export const showrooms = [
  { id: "lviv", city: "Львів", title: "Головний офіс і склад", address: site.address, hours: site.hours, note: "Самовивіз і вся експозиція. 3D-тур — онлайн." },
  { id: "kyiv", city: "Київ", title: "Шоурум", address: "Адресу уточнюйте в менеджера", hours: "За попереднім записом", note: "Наживо: дизайнерські радіатори й рушникосушки." },
  { id: "if", city: "Івано-Франківськ", title: "Шоурум", address: "Адресу уточнюйте в менеджера", hours: "За попереднім записом", note: "Експозиція моделей IRSAP, Zehnder, Vasco." },
] as const;

export const nav = [
  { href: "/katalog", label: "Каталог" },
  { href: "/akcii", label: "Акції" },
  { href: "/brendy", label: "Бренди" },
  { href: "/pidbir", label: "Підбір потужності" },
  { href: "/pro-nas", label: "Про нас" },
  { href: "/dostavka", label: "Доставка" },
  { href: "/kontakty", label: "Контакти" },
];

/** Shown on product pages, in the cart and at checkout (old «Доставка та оплата»). */
export const delivery = [
  { id: "np", title: "Нова пошта, SAT, Delivery", note: "У відділення або кур’єром, 1–3 дні. Відправляємо після авансу 10% або повної оплати." },
  { id: "courier", title: "Доставка по Львову", note: "Нашим авто до під’їзду за 1–2 дні, у середньому 600 ₴." },
  { id: "pickup", title: "Самовивіз зі складу", note: "Наварія, 10 км від Львова. Пн–Пт 09:00–18:00, Сб 09:00–14:00." },
] as const;

export const payment = [
  { id: "cod", title: "Готівкою при отриманні", note: "На складі, кур’єру або післяплатою на пошті." },
  { id: "invoice", title: "За реквізитами", note: "Безготівковий рахунок — для приватних клієнтів і компаній." },
] as const;
