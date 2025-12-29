'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export default function BreadcrumbNav({ items = [] }) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600">
      <Link href="/dashboard" className="flex items-center hover:text-gray-900">
        <Home className="h-4 w-4" />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4" />
          {item.href ? (
            <Link href={item.href} className="hover:text-gray-900">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}