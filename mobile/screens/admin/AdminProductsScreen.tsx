import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { apiFetch } from '../../lib/api';

type Product = {
  id: number;
  name: string;
  priceRegular: number;
  priceGroup: number;
  categoryId: number;
};

export default function AdminProductsScreen({ navigation }: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await apiFetch('/admin/products');
      setProducts(data);
    } catch (e: any) {
      Alert.alert('שגיאה', e.message || 'אין הרשאות Admin');
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id: number) {
    Alert.alert(
      'מחיקה',
      'למחוק מוצר זה?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: async () => {
            await apiFetch(`/admin/products/${id}`, {
              method: 'DELETE',
            });
            await load();
          },
        },
      ]
    );
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>טוען מוצרים…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📦 ניהול מוצרים</Text>

      <Pressable
        style={styles.createBtn}
        onPress={() => navigation.navigate('AdminNewProduct')}
      >
        <Text style={styles.createText}>➕ מוצר חדש</Text>
      </Pressable>

      {products.length === 0 && (
        <Text style={styles.muted}>אין מוצרים</Text>
      )}

      {products.map(p => (
        <View key={p.id} style={styles.card}>
          <View>
            <Text style={styles.name}>{p.name}</Text>
            <Text style={styles.price}>
              ₪{p.priceGroup}{' '}
              <Text style={styles.old}>
                (רגיל ₪{p.priceRegular})
              </Text>
            </Text>
            <Text style={styles.meta}>
              קטגוריה #{p.categoryId}
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() =>
                navigation.navigate('AdminEditProduct', {
                  id: p.id,
                })
              }
            >
              <Text style={styles.edit}>✏️</Text>
            </Pressable>

            <Pressable onPress={() => deleteProduct(p.id)}>
              <Text style={styles.delete}>🗑️</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

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
  createBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    marginBottom: 20,
  },
  createText: {
    color: '#fff',
    fontWeight: '600',
  },
  muted: {
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    fontWeight: '600',
    fontSize: 16,
  },
  price: {
    marginTop: 4,
    fontWeight: '700',
  },
  old: {
    color: '#999',
    fontWeight: '400',
  },
  meta: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  edit: {
    fontSize: 20,
  },
  delete: {
    fontSize: 20,
    color: 'red',
  },
});
