'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  async function load() {
    const data = await apiFetch('/admin/categories');
    setCategories(data);
  }

  async function createCategory() {
    await apiFetch('/admin/categories', {
      method: 'POST',
      body: JSON.stringify({ name, slug }),
    });
    setName('');
    setSlug('');
    await load();
  }

  async function deleteCategory(id: number) {
    if (!confirm('למחוק קטגוריה?')) return;
    await apiFetch(`/admin/categories/${id}`, { method: 'DELETE' });
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>📂 ניהול קטגוריות</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input placeholder="שם" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="slug" value={slug} onChange={e => setSlug(e.target.value)} />
        <button onClick={createCategory}>צור</button>
      </div>

      {categories.map(c => (
        <div key={c.id}>
          {c.name} ({c.slug}) (ID: {c.id}){' '}
          <button onClick={() => deleteCategory(c.id)}> 🗑️ מחיקה</button>
        </div>
      ))}
    </div>
  );
}
