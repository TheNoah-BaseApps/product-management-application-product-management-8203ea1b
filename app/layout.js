'use client';

import './globals.css';
import { DashboardLayout } from '@/components/layouts';
import { Home, Package, Users, Settings, FileText } from 'lucide-react';

// Example navigation items - customize these based on your app
const navItems = [
  { title: 'Dashboard', href: '/', icon: Home },
  { title: 'Products', href: '/products', icon: Package },
  { title: 'Users', href: '/users', icon: Users },
  { title: 'Documents', href: '/documents', icon: FileText },
  { title: 'Settings', href: '/settings', icon: Settings }
];

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <DashboardLayout appName="Next.js App" navItems={navItems}>
          {children}
        </DashboardLayout>
      </body>
    </html>
  );
}
