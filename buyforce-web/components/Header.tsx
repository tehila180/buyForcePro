'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isLoggedIn, isAdmin } from '@/lib/auth';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [logged, setLogged] = useState(false);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    setLogged(isLoggedIn());
    setAdmin(isAdmin());
  }, [pathname]);

  function handleLogout() {
    localStorage.removeItem('token');
    setLogged(false);
    setAdmin(false);
    router.push('/login');
  }

  return (
    <header
      style={{
        padding: '12px 24px',
        borderBottom: '1px solid #eee',
        background: '#fff',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Link href="/" style={{ fontWeight: 700, fontSize: 18 }}>
          BuyForce
        </Link>

        {/* ניווט רגיל */}
        <nav style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {!logged && (
            <>
              <Link href="/dashboard">ראשי</Link>
              <Link href="/categories">קטגוריות</Link>
              <Link href="/login">התחברות</Link>
              <Link href="/register">הרשמה</Link>
            </>
          )}

          {logged && (
            <>
              <Link href="/dashboard">ראשי</Link>
              <Link href="/my">האזור האישי</Link>

              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#b00020',
                  fontWeight: 600,
                }}
              >
                התנתקות
              </button>
            </>
          )}
        </nav>
      </div>

      {/* 🔐 תפריט Admin */}
      {admin && (
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px dashed #ddd',
            display: 'flex',
            gap: 16,
            fontSize: 14,
          }}
        >
          <strong>Admin:</strong>
          <Link href="/admin/products">ניהול מוצרים</Link>
          <Link href="/admin/categories">ניהול קטגוריות</Link>
          <Link href="/admin/groups">ניהול קבוצות</Link>
          <Link href="/admin/users">משתמשים</Link>
        </div>
      )}
    </header>
  );
}
