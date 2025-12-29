import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { apiFetch } from '../../lib/api';

type Category = {
  id: number;
  name: string;
  slug: string;
};

export default function AdminCategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function load() {
    try {
      const data = await apiFetch('/admin/categories');
      setCategories(data);
    } catch (e: any) {
      Alert.alert('שגיאה', e.message || 'אין הרשאות Admin');
    } finally {
      setLoading(false);
    }
  }

  async function createCategory() {
    if (!name || !slug) {
      Alert.alert('שגיאה', 'נא למלא שם ו־slug');
      return;
    }

    try {
      setCreating(true);
      await apiFetch('/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ name, slug }),
      });

      setName('');
      setSlug('');
      await load();
    } catch (e: any) {
      Alert.alert('שגיאה', e.message || 'יצירת קטגוריה נכשלה');
    } finally {
      setCreating(false);
    }
  }

  async function deleteCategory(id: number) {
    Alert.alert(
      'מחיקה',
      'למחוק קטגוריה?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: async () => {
            await apiFetch(`/admin/categories/${id}`, {
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
        <Text>טוען קטגוריות…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📂 ניהול קטגוריות</Text>

      {/* יצירה */}
      <View style={styles.box}>
        <TextInput
          placeholder="שם קטגוריה"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="slug"
          value={slug}
          onChangeText={setSlug}
          style={styles.input}
        />

        <Pressable
          style={styles.createBtn}
          onPress={createCategory}
          disabled={creating}
        >
          <Text style={styles.createText}>
            {creating ? 'יוצר…' : '➕ צור קטגוריה'}
          </Text>
        </Pressable>
      </View>

      {/* רשימה */}
      {categories.map(c => (
        <View key={c.id} style={styles.row}>
          <View>
            <Text style={styles.catName}>{c.name}</Text>
            <Text style={styles.slug}>{c.slug}</Text>
          </View>

          <Pressable onPress={() => deleteCategory(c.id)}>
            <Text style={styles.delete}>🗑️</Text>
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
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
  },
  box: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  createBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  createText: {
    color: '#fff',
    fontWeight: '600',
  },
  row: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catName: {
    fontWeight: '600',
    fontSize: 16,
  },
  slug: {
    color: '#666',
    fontSize: 12,
  },
  delete: {
    fontSize: 20,
  },
});
