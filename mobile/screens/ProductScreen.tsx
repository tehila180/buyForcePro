import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { apiFetch } from '../lib/api';

type Product = {
  id: number;
  name: string;
  priceRegular: number;
  priceGroup: number;
};

type Group = {
  id: number;
  target: number;
  members: any[];
};

export default function ProductScreen({ route, navigation }: any) {
  const { slug } = route.params;

  const [product, setProduct] = useState<Product | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    apiFetch(`/products/${slug}`)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!product) return;

    apiFetch(`/groups/product/${product.id}`)
      .then(setGroups)
      .catch(() => setGroups([]));
  }, [product]);

  async function openGroup() {
    if (!product) return;

    setCreating(true);
    try {
      const group = await apiFetch(`/groups/create/${product.id}`, {
        method: 'POST',
      });

      navigation.navigate('Group', { id: group.id });
    } catch {
      Alert.alert('שגיאה', 'לא ניתן לפתוח קבוצה');
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>טוען מוצר…</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>מוצר לא נמצא</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{product.name}</Text>

        <Text style={styles.regular}>
          💰 מחיר רגיל: ₪{product.priceRegular}
        </Text>

        <Text style={styles.group}>
          💸 מחיר קבוצתי: ₪{product.priceGroup}
        </Text>

        <Text style={styles.section}>קבוצות פעילות</Text>

        {groups.length === 0 && (
          <Text style={styles.muted}>אין קבוצות פעילות</Text>
        )}

        {groups.map(g => (
          <View key={g.id} style={styles.groupRow}>
            <Text>
              👥 {g.members.length} / {g.target}
            </Text>

            <Pressable
              style={styles.smallBtn}
              onPress={() =>
                navigation.navigate('Group', { id: g.id })
              }
            >
              <Text style={styles.smallBtnText}>כניסה</Text>
            </Pressable>
          </View>
        ))}

      
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f6f7fb',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  regular: {
    marginBottom: 4,
  },
  group: {
    fontWeight: '700',
    color: '#6c4eff',
    marginBottom: 20,
  },
  section: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  muted: {
    color: '#777',
    marginBottom: 12,
  },
  groupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  smallBtn: {
    backgroundColor: '#6c4eff',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  smallBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  createBtn: {
    marginTop: 24,
    backgroundColor: '#00b894',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  createText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
