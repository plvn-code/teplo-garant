# Status — started 2026-11-13

Local: http://localhost:3014. GitHub: https://github.com/plvn-code/teplo-garant (main), pushed 2026-11-13. No Vercel yet — ask the user first.

## Done
Full shop in Ukrainian: intro, home (split hero with interior showcase, brand marquee, photo bento of 8 sections, manifest, pinned sale rail, power calculator, colour/finish block, popular models, white «Чому ми» block with numbers, brand wall, showroom band with 3D tour, real-review marquee, blog teaser), catalogue with filters (section, subtype, price, colour, connection, sale, stock, brand, search, sort — all in the URL, mobile sheet), 9 section pages, sale page, 15 brand pages, 284 product pages (gallery + lens, size variants, facts, specs, reviews, YouTube link, related), cart + checkout, ⌘K search, call-back / one-click modal, power calculator page, about, delivery & returns + FAQ, contacts with showrooms, blog (47 articles), 404, sitemap, robots, redirects from all old URLs. Checked at 1440 and 390 px: no horizontal scroll; lint + tsc clean.

## Order delivery: must be decided before launch
`src/lib/orders.ts` sends orders and call-backs to Telegram (`TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`) and/or email via Resend (`RESEND_API_KEY`, `LEAD_EMAIL_TO`, `LEAD_EMAIL_FROM`). With neither set it appends to `data/orders.jsonl` — local only; on Vercel it would fail with 502 (the visitor then sees the phone number).

## Questions for the client
1. **Where should orders go?** Telegram, email (info@teplogarant.in.ua?), or both? Do they keep OpenCart/CRM?
2. **Showroom addresses** in Kyiv and Ivano-Frankivsk are not on the old site — the site says «Адресу уточнюйте в менеджера». Kyiv phone on the old contacts page reads «+38 063 881 33 2011» (looks garbled) — not used yet.
3. **Hours conflict**: header says Пн–Пт 9:00–18:00, the delivery page says pickup Пн–Пт 9:00–17:00. Site uses 9–18 / Сб 9–14.
4. **Stock**: old site marks 152 items InStock, 132 OutOfStock (shown as «Під замовлення»). Is that right, or is everything orderable from the manufacturer with a lead time?
5. **Prices**: some old prices are in EUR converted on the fly (schema says EUR). Our prices are the UAH figures shown on the site on 2026-11-13. Need a price feed or an update routine.
6. **Sale prices** up to −80% (e.g. Zehnder Altima) — still valid?
7. **Founding year**: «З 2000 року» from «Про нас». Correct?
8. **Painting service** («дизайнерська покраска радіаторів») is mentioned on the old home page — is it still offered, price/terms?
9. **Calculator** uses a rule of thumb (41 W/m³ × factors) and is labelled «орієнтовно». OK to show, or prefer their own method?
10. **Photos**: product photos are the old site's (upscaled + cleaned). Studio/interior shots of their showroom or installed projects would make the hero and about page stronger.
11. **Domain** stays teplogarant.in.ua? Redirects from all old paths (incl. /ru/) are ready.
12. Russian version: the old site had /ru/. The new site is Ukrainian only; /ru/ paths redirect to Ukrainian pages. OK?

## Launch checklist
Order delivery configured and tested · `NEXT_PUBLIC_SITE_URL` + `NEXT_PUBLIC_SITE_LIVE=1` · domain · check redirects on the real domain · Google Analytics / Ads / Facebook pixel ids from the old site if they want them (G-N9SBEZW9VQ, AW-10838096987, GTM-MF6VRWH, FB 884557742249563) — CSP must be widened for them.
