import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { apiFetch } from '../../lib/api';

type Group = {
  id: number;
  status: 'open' | 'completed' | 'paid';
  target: number;
  product: {
    name: string;
  };
  members: {
    user: {
      email: string;
      username: string;
    };
  }[];
};

type Product = {
  id: number;
  name: string;
};

export default function AdminGroupsScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [productId, setProductId] = useState<number | null>(null);
  const [target, setTarget] = useState<number>(5);
  const [creating, setCreating] = useState(false);

  async function load() {
    try {
      const [groupsData, productsData] = await Promise.all([
        apiFetch('/admin/groups'),
        apiFetch('/admin/products'),
      ]);
      setGroups(groupsData);
      setProducts(productsData);
    } catch (e: any) {
      Alert.alert('שגיאה', e.message || 'שגיאה בטעינה');
    } finally {
      setLoading(false);
    }
  }

  async function createGroup() {
    if (!productId) {
      Alert.alert('שגיאה', 'יש לבחור מוצר');
      return;
    }

    if (target < 2) {
      Alert.alert('שגיאה', 'יעד משתתפים חייב להיות לפחות 2');
      return;
    }

    try {
      setCreating(true);
      await apiFetch('/admin/groups', {
        method: 'POST',
        body: JSON.stringify({ productId, target }),
      });
      setProductId(null);
      setTarget(5);
      await load();
    } catch (e: any) {
      Alert.alert('שגיאה', e.message || 'שגיאה ביצירת קבוצה');
    } finally {
      setCreating(false);
    }
  }

  function deleteGroup(id: number) {
    Alert.alert('מחיקת קבוצה', 'האם למחוק קבוצה זו?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'מחיקה',
        style: 'destructive',
        onPress: async () => {
          await apiFetch(`/admin/groups/${id}`, { method: 'DELETE' });
          await load();
        },
      },
    ]);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>טוען קבוצות…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>👥 ניהול קבוצות</Text>

      {/* יצירת קבוצה */}
      <View style={styles.createBox}>
        <Text style={styles.subtitle}>➕ יצירת קבוצה חדשה</Text>

        {products.map(p => (
          <Pressable
            key={p.id}
            style={[
              styles.productBtn,
              productId === p.id && styles.selected,
            ]}
            onPress={() => setProductId(p.id)}
          >
            <Text>{p.name}</Text>
          </Pressable>
        ))}

        <Text style={{ marginTop: 12 }}>יעד משתתפים:</Text>

        <TextInput
          value={String(target)}
          onChangeText={(text) => {
            const num = Number(text);
            if (!isNaN(num)) setTarget(num);
          }}
          keyboardType="number-pad"
          placeholder="לדוגמה: 12"
          style={styles.targetInput}
        />

        <Pressable
          style={styles.createBtn}
          onPress={createGroup}
          disabled={creating}
        >
          <Text style={styles.createText}>
            {creating ? 'יוצר…' : 'צור קבוצה'}
          </Text>
        </Pressable>
      </View>

      {/* קבוצות */}
      {groups.length === 0 && (
        <Text style={styles.muted}>אין קבוצות</Text>
      )}

      {groups.map(g => (
        <View key={g.id} style={styles.card}>
          <Text style={styles.cardTitle}>{g.product.name}</Text>

          <Text>
            👥 {g.members.length}/{g.target}
          </Text>

          <Text>
            סטטוס:{' '}
            <Text style={styles[g.status]}>
              {g.status}
            </Text>
          </Text>

          <Pressable onPress={() => deleteGroup(g.id)}>
            <Text style={styles.delete}>🗑 מחיקה</Text>
          </Pressable>

          <View style={styles.members}>
            <Text style={styles.subtitle}>משתתפים:</Text>
            {g.members.map((m, i) => (
              <Text key={i}>
                • {m.user.username || m.user.email}
              </Text>
            ))}
          </View>
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
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  muted: {
    color: '#777',
    marginTop: 20,
  },
  createBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 24,
  },
  productBtn: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  selected: {
    backgroundColor: '#e0ddff',
    borderColor: '#6c4eff',
  },
  targetInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
    fontSize: 16,
  },
  createBtn: {
    backgroundColor: '#6c4eff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  createText: {
    color: '#fff',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  delete: {
    color: '#c0392b',
    fontWeight: '600',
    marginTop: 6,
  },
  members: {
    marginTop: 10,
  },
  open: { color: '#555' },
  completed: { color: 'orange' },
  paid: { color: 'green' },
});
