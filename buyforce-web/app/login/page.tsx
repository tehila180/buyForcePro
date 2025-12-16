'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useEffect } from 'react';
import { isLoggedIn } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
useEffect(() => {
  if (isLoggedIn()) {
    router.replace('/dashboard');
  }
}, [router]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // ✅ שמירת טוקן
      localStorage.setItem('token', res.token);

router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'שגיאת התחברות');
    } finally {
      setLoading(false);
    }
    
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: '#fff',
          borderRadius: 12,
          padding: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        }}
      >
        <h1 style={{ marginBottom: '1rem', textAlign: 'center' }}>Login</h1>
        <p style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#666' }}>
          התחברות ל-BuyForce
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span>אימייל</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #ddd' }}
              required
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span>סיסמה</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #ddd' }}
              required
            />
          </label>

          {error && (
            <div style={{ color: '#b00020', fontSize: 14, marginTop: 4 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              borderRadius: 999,
              border: 'none',
              background: loading ? '#999' : '#4f46e5',
              color: '#fff',
              fontWeight: 600,
              cursor: loading ? 'default' : 'pointer',
            }}
          >
            {loading ? 'מתחבר...' : 'התחברות'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', fontSize: 14, textAlign: 'center' }}>
          אין לך משתמש?{' '}
          <a href="/register" style={{ color: '#4f46e5', textDecoration: 'underline' }}>
            הרשמה
          </a>
        </div>
      </div>
    </div>
  );
}
