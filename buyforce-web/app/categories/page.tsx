'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
type Category = {
  id: number;
  name: string;
  slug: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch('/categories');
        setCategories(data);
      } catch (err: any) {
        setError(err.message || 'שגיאה בטעינת קטגוריות');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <p style={{ padding: 24 }}>טוען קטגוריות...</p>;
  if (error) return <p style={{ padding: 24, color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1>קטגוריות</h1>

      <ul style={{ marginTop: 16 }}>
        {categories.map((c) => (
          <li key={c.id}>
  <Link href={`/categories/${c.slug}`}>{c.name}</Link>
</li>
        ))}
      </ul>
    </div>
  );
}
