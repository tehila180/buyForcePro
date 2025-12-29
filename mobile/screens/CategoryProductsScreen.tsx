import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { apiFetch } from '../lib/api';

type Product = {
  id: number;
  name: string;
  slug: string;
  priceRegular: number;
  priceGroup: number;
};

export default function CategoryProductsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const { slug, name } = route.params ?? {};

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    apiFetch(`/products/by-category/${slug}`)
      .then(setProducts)
      .catch((err) =>
        setError(err.message || 'שגיאה בטעינת מוצרים')
      )
      .finally(() => setLoading(false));
  }, [slug]);

  if (!slug) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>טוען קטגוריה…</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>טוען מוצרים…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{name}</Text>

      {products.length === 0 && (
        <Text style={styles.muted}>
          אין מוצרים בקטגוריה הזו
        </Text>
      )}

      {products.map((p) => (
        <View key={p.id} style={styles.card}>
          <Text style={styles.productName}>{p.name}</Text>

          <Text style={styles.oldPrice}>
            מחיר רגיל: ₪{p.priceRegular}
          </Text>

          <Text style={styles.groupPrice}>
            מחיר קבוצתי: ₪{p.priceGroup}
          </Text>

          {/* 🔥 כפתור לצפייה במוצר */}
          <Pressable
            style={styles.linkBtn}
            onPress={() =>
              navigation.navigate('Product', {
                slug: p.slug,
              })
            }
          >
            <Text style={styles.linkText}>
              לצפייה במוצר →
            </Text>
          </Pressable>
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
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  muted: {
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
  },
  oldPrice: {
    marginTop: 4,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  groupPrice: {
    marginTop: 6,
    fontWeight: '700',
  },
  linkBtn: {
    marginTop: 10,
  },
  linkText: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  error: {
    color: 'red',
  },
});
