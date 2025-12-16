'use client';

import { FormEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { isLoggedIn } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn()) {
      router.replace('/dashboard');
    }
  }, [router]);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== passwordConfirm) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    try {
      setLoading(true);

      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, username, password }),
      });

      // ⬅ שמירת הטוקן כמו בלוגין
      localStorage.setItem('token', res.token);

      setSuccess('נרשמת בהצלחה!');

      setTimeout(() => {
        router.push('/dashboard');
      }, 500);

    } catch (err: any) {
      setError(err.message || 'שגיאה בהרשמה');
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
        <h1 style={{ marginBottom: '1rem', textAlign: 'center' }}>Register</h1>
        <p style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#666' }}>
          יצירת משתמש חדש ל-BuyForce
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span>שם משתמש</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #ddd' }}
              required
            />
          </label>

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

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span>אימות סיסמה</span>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #ddd' }}
              required
            />
          </label>

          {error && <div style={{ color: '#b00020', fontSize: 14 }}>{error}</div>}
          {success && <div style={{ color: 'green', fontSize: 14 }}>{success}</div>}

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
            {loading ? 'נרשם...' : 'הרשמה'}
          </button>

        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: 14 }}>
          כבר רשום? <a href="/login" style={{ color: '#4f46e5' }}>התחברות</a>
        </div>
      </div>
    </div>
  );
}
