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

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="שם מוצר"
      />

      <TextInput
        style={styles.input}
        value={priceRegular}
        onChangeText={setPriceRegular}
        keyboardType="numeric"
        placeholder="מחיר רגיל"
      />

      <TextInput
        style={styles.input}
        value={priceGroup}
        onChangeText={setPriceGroup}
        keyboardType="numeric"
        placeholder="מחיר קבוצתי"
      />

      <TextInput
        style={styles.input}
        value={categoryId}
        onChangeText={setCategoryId}
        keyboardType="numeric"
        placeholder="קטגוריה ID"
      />

      <Pressable style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveText}>💾 שמירת שינויים</Text>
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
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
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
