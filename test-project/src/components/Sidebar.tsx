'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import { NAV_ITEMS } from '@/lib/nav';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <span className="brand-glyph" aria-hidden />
          <h1>AdView</h1>
        </div>
        <p>Interactive playground for @adview/react</p>
      </div>

      <nav aria-label="Feature demos">
        <ul className="nav-list">
          {NAV_ITEMS.map(item => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`nav-link${active ? ' active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        Local packages via <code>file:</code> link.
        <br />
        Dev server: <code>localhost:3002</code>
      </div>
    </aside>
  );
}
