"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import { site } from "@/lib/site";
import { openSearch } from "./Header";
import { Icon } from "./Icons";

/** Thumb-reach bar on phones: catalogue, search, cart, call. Hidden at checkout, where the form has its own button. */
export function MobileBar() {
  const pathname = usePathname();
  const { count, setOpen, ready } = useCart();
  if (pathname === "/koshyk") return null;
  return (
    <nav className="mbar" aria-label="Швидкі дії">
      <Link href="/katalog" className={pathname.startsWith("/katalog") ? "is-on" : ""}>
        <Icon name="grid" size={21} />
        Каталог
      </Link>
      <button type="button" onClick={() => openSearch()}>
        <Icon name="search" size={21} />
        Пошук
      </button>
      <button type="button" onClick={() => setOpen(true)} data-cart-target className="mbar-cart">
        <span className="mbar-ico">
          <Icon name="bag" size={21} />
          {ready && count > 0 && <span className="cart-count">{count > 99 ? "99+" : count}</span>}
        </span>
        Кошик
      </button>
      <a href={site.phoneHref}>
        <Icon name="phone" size={21} />
        Дзвінок
      </a>
    </nav>
  );
}
