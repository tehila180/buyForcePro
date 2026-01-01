import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { apiFetch } from '../../lib/api';

export default function AdminEditProductScreen({ navigation }: any) {
  const route = useRoute<any>();
  const { id } = route.params ?? {};

  const [name, setName] = useState('');
  const [priceRegular, setPriceRegular] = useState('');
  const [priceGroup, setPriceGroup] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    apiFetch(`/admin/products/${id}`)
      .then(data => {
        setName(data.name);
        setPriceRegular(String(data.priceRegular));
        setPriceGroup(String(data.priceGroup));
        setCategoryId(String(data.categoryId));
      })
      .catch(() => Alert.alert('שגיאה', 'טעינת מוצר נכשלה'))
      .finally(() => setLoading(false));
  }, [id]);

  async function save() {
    try {
      await apiFetch(`/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name,
          priceRegular: Number(priceRegular),
          priceGroup: Number(priceGroup),
          categoryId: Number(categoryId),
        }),
      });

      Alert.alert('✔ הצלחה', 'המוצר עודכן');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('שגיאה', e.message || 'עדכון נכשל');
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>טוען מוצר…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✏️ עריכת מוצר</Text>

      {/* שם מוצר */}
      <Text style={styles.label}>שם המוצר</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="לדוגמה: טוסטר"
      />

      {/* מחיר רגיל */}
      <Text style={styles.label}>מחיר רגיל (₪)</Text>
      <TextInput
        style={styles.input}
        value={priceRegular}
        onChangeText={setPriceRegular}
        keyboardType="numeric"
        placeholder="לדוגמה: 250"
      />

      {/* מחיר קבוצתי */}
      <Text style={styles.label}>מחיר קבוצתי (₪)</Text>
      <TextInput
        style={styles.input}
        value={priceGroup}
        onChangeText={setPriceGroup}
        keyboardType="numeric"
        placeholder="לדוגמה: 200"
      />

      {/* קטגוריה */}
      <Text style={styles.label}>קטגוריה (ID)</Text>
      <TextInput
        style={styles.input}
        value={categoryId}
        onChangeText={setCategoryId}
        keyboardType="numeric"
        placeholder="לדוגמה: 3"
      />

      <Pressable style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveText}>💾 שמירת שינויים</Text>
      </Pressable>
    </View>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f6f7fb',
    flex: 1,
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  saveBtn: {
    marginTop: 10,
    backgroundColor: '#4f46e5',
    padding: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
