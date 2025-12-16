// app/admin/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAdmin } from '@/lib/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin()) {
      alert('אין לך הרשאות מנהל');
      router.replace('/');
    }
  }, [router]);

  return (
    <div style={{ padding: 24 }}>
      <h1>🛠️ Admin Panel</h1>

      <nav style={{ margin: '16px 0', display: 'flex', gap: 16 }}>
        <a href="/admin/stats">סטטיסטיקות</a>
        <a href="/admin/products">מוצרים</a>
        <a href="/admin/categories">קטגוריות</a>
        <a href="/admin/groups">קבוצות</a>
        <a href="/admin/users">משתמשים</a>
      </nav>

      <hr style={{ marginBottom: 24 }} />

      {children}
    </div>
  );
}
