'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SubTabs({ items }: { items: { title: string; href: string }[] }) {
  const pathname = usePathname();
  return (
    <div className="subtabs" role="tablist">
      {items.map(it => (
        <Link
          key={it.href}
          href={it.href}
          className={`subtab ${pathname === it.href ? 'active' : ''}`}
        >
          {it.title}
        </Link>
      ))}
    </div>
  );
}
