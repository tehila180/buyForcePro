import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { apiFetch } from '../../lib/api';

/* ---------- Types ---------- */

type User = {
  id: string;
  username: string | null;
  email: string;
  role: 'admin' | 'user';
};

/* ---------- Screen ---------- */

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/admin/users')
      .then(setUsers)
      .catch(() =>
        Alert.alert('שגיאה', 'אין הרשאות Admin או שגיאת שרת')
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>טוען משתמשים…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>👤 משתמשים</Text>

      {users.length === 0 && (
        <Text style={styles.muted}>אין משתמשים</Text>
      )}

      {users.map(u => (
        <View key={u.id} style={styles.card}>
          <Text style={styles.name}>
            {u.username || 'ללא שם'}
          </Text>

          <Text style={styles.email}>{u.email}</Text>

          <Text
            style={[
              styles.role,
              u.role === 'admin'
                ? styles.admin
                : styles.user,
            ]}
          >
            {u.role === 'admin' ? '🔐 Admin' : '👤 User'}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f6f7fb',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
  },
  muted: {
    color: '#777',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  email: {
    color: '#555',
    marginTop: 4,
  },
  role: {
    marginTop: 8,
    fontWeight: '600',
  },
  admin: {
    color: '#c0392b',
  },
  user: {
    color: '#2c3e50',
  },
});
