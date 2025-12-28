import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { apiFetch } from '../lib/api';

type Product = {
  id: number;
  name: string;
  slug: string;
  priceRegular: number;
  priceGroup: number;
};

export default function ProductsScreen({ navigation }: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/products')
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>טוען מוצרים…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>כל המוצרים</Text>

      {products.map(p => (
        <View key={p.id} style={styles.card}>
          <Text style={styles.name}>{p.name}</Text>

          <Text style={styles.regular}>
            מחיר רגיל: ₪{p.priceRegular}
          </Text>

          <Text style={styles.group}>
            מחיר קבוצתי: ₪{p.priceGroup}
          </Text>

          <Pressable
            style={styles.button}
            onPress={() =>
              navigation.navigate('Product', { slug: p.slug })
            }
          >
            <Text style={styles.buttonText}>👀 צפייה במוצר</Text>
          </Pressable>
        </View>
      ))}
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
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  regular: {
    color: '#555',
  },
  group: {
    fontWeight: '700',
    color: '#6c4eff',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#6c4eff',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
