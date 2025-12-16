'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [priceRegular, setPriceRegular] = useState('');
  const [priceGroup, setPriceGroup] = useState('');
  const [categoryId, setCategoryId] = useState('');

  async function handleCreate() {
    await apiFetch('/admin/products', {
      method: 'POST',
      body: JSON.stringify({
        name,
        priceRegular: Number(priceRegular),
        priceGroup: Number(priceGroup),
        categoryId: Number(categoryId),
      }),
    });

    alert('המוצר נוצר בהצלחה');
    router.push('/admin/products');
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>➕ מוצר חדש</h1>

      <input placeholder="שם" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="מחיר רגיל" value={priceRegular} onChange={e => setPriceRegular(e.target.value)} />
      <input placeholder="מחיר קבוצתי" value={priceGroup} onChange={e => setPriceGroup(e.target.value)} />
      <input placeholder="קטגוריה ID" value={categoryId} onChange={e => setCategoryId(e.target.value)} />

      <button onClick={handleCreate}>שמור</button>
    </div>
  );
}
