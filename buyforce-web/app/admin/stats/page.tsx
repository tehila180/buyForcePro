// app/admin/stats/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function AdminStatsPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    apiFetch('/admin/stats')
      .then(setStats)
      .catch(() => alert('אין הרשאות Admin'));
  }, []);

  if (!stats) return <p>טוען סטטיסטיקות...</p>;

  return (
    <div>
      <h2>📊 סטטיסטיקות מערכת</h2>
      <p>משתמשים: {stats.users}</p>
      <p>מוצרים: {stats.products}</p>
      <p>קבוצות פתוחות: {stats.groups.open}</p>
      <p>קבוצות שהושלמו: {stats.groups.completed}</p>
      <p>קבוצות ששולמו: {stats.groups.paid}</p>
    </div>
  );
}
