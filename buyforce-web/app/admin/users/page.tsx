'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/admin/users').then(setUsers);
  }, []);

  return (
    <div>
      <h1>👤 משתמשים</h1>

      {users.map(u => (
        <div key={u.id} style={{ borderBottom: '1px solid #ddd', padding: 8 }}>
          <strong>{u.username}</strong> ({u.email}) – {u.role}
        </div>
      ))}
    </div>
  );
}
