import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { apiFetch } from '../../lib/api';

type Stats = {
  users: number;
  products: number;
  groups: {
    open: number;
    completed: number;
    paid: number;
  };
};

export default function AdminStatsScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/admin/stats')
      .then(setStats)
      .catch(() =>
        Alert.alert('שגיאה', 'אין הרשאות Admin או שגיאת שרת')
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>טוען סטטיסטיקות…</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>לא ניתן לטעון נתונים</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📊 סטטיסטיקות מערכת</Text>

      <View style={styles.card}>
        <Text style={styles.label}>👤 משתמשים</Text>
        <Text style={styles.value}>{stats.users}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>📦 מוצרים</Text>
        <Text style={styles.value}>{stats.products}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>👥 קבוצות פתוחות</Text>
        <Text style={styles.value}>{stats.groups.open}</Text>
      </View>

    


      <View style={styles.card}>
        <Text style={styles.label}>💰 קבוצות שהושלמו</Text>
        <Text style={[styles.value, { color: 'green' }]}>
          {stats.groups.paid}
        </Text>
      </View>
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
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
  },
  label: {
    fontSize: 16,
    color: '#555',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 6,
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
});
