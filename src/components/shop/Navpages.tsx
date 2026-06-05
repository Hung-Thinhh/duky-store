// Đây là nav dùng cho các page bên trong các giao diện của từng page
"use client";

import Link from "next/link";
import { BackButton } from "./BackButton";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface NavpagesProps {
  items: BreadcrumbItem[];
}

export const Navpages = ({ items }: NavpagesProps) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <BackButton />
      <ol
        className="flex items-center gap-2 text-sm"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && <span className="text-gray-500">/</span>}
            <span
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {item.href ? (
                <Link
                  href={item.href}
                  itemProp="item"
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
              ) : (
                <span itemProp="name" className="text-black font-semibold">
                  {item.label}
                </span>
              )}
              <meta itemProp="position" content={String(index + 1)} />
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Navpages;
