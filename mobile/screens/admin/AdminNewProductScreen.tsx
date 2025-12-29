import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { apiFetch } from '../../lib/api';

type Category = {
  id: number;
  name: string;
};

export default function AdminNewProductScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [priceRegular, setPriceRegular] = useState('');
  const [priceGroup, setPriceGroup] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch('/admin/categories').then(setCategories);
  }, []);

  async function createProduct() {
    if (!name || !priceRegular || !priceGroup || !categoryId) {
      Alert.alert('שגיאה', 'נא למלא את כל השדות');
      return;
    }

    try {
      setLoading(true);
      await apiFetch('/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          name,
          priceRegular: Number(priceRegular),
          priceGroup: Number(priceGroup),
          categoryId: Number(categoryId),
        }),
      });

      Alert.alert('✔ הצלחה', 'המוצר נוצר בהצלחה');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('שגיאה', e.message || 'שגיאה ביצירת מוצר');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>➕ יצירת מוצר חדש</Text>

      <TextInput
        style={styles.input}
        placeholder="שם מוצר"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="מחיר רגיל"
        keyboardType="numeric"
        value={priceRegular}
        onChangeText={setPriceRegular}
      />

      <TextInput
        style={styles.input}
        placeholder="מחיר קבוצתי"
        keyboardType="numeric"
        value={priceGroup}
        onChangeText={setPriceGroup}
      />

      <Text style={styles.label}>קטגוריה (ID)</Text>
      {categories.map(c => (
        <Pressable
          key={c.id}
          style={[
            styles.categoryBtn,
            categoryId === String(c.id) && styles.categorySelected,
          ]}
          onPress={() => setCategoryId(String(c.id))}
        >
          <Text>{c.name} (#{c.id})</Text>
        </Pressable>
      ))}

      <Pressable style={styles.saveBtn} onPress={createProduct}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>💾 שמור מוצר</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f6f7fb',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    marginVertical: 10,
  },
  categoryBtn: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  categorySelected: {
    borderWidth: 2,
    borderColor: '#4f46e5',
  },
  saveBtn: {
    marginTop: 20,
    backgroundColor: '#4f46e5',
    padding: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
  },
});
