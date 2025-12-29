import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from 'react-native';
import { apiFetch } from '../lib/api';

type Category = {
  id: number;
  name: string;
  slug: string;
};

export default function CategoriesScreen({ navigation }: any) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/categories')
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>טוען…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {categories.map(c => (
        <Pressable
          key={c.id}
          style={styles.card}
          onPress={() =>
            navigation.navigate('CategoryProducts', {
              slug: c.slug,
              name: c.name,
            })
          }
        >
          <Text style={styles.text}>{c.name}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  text: { fontSize: 18, fontWeight: '600' },
});
