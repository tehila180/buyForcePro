import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { apiFetch } from '../lib/api';
import { storage } from '../lib/storage';

/* ---------- Screen ---------- */

export default function RegisterScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    setError(null);

    if (password !== passwordConfirm) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    try {
      setLoading(true);

      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email,
          username,
          password,
        }),
      });

      // ✅ שמירת token – Web + Android
      await storage.set('token', res.token);

      Alert.alert('הצלחה', 'נרשמת בהצלחה!');
      navigation.replace('Home');
    } catch (err: any) {
      setError(err.message || 'שגיאה בהרשמה');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Register</Text>
        <Text style={styles.subtitle}>
          יצירת משתמש חדש ל־BuyForce
        </Text>

        <View style={styles.field}>
          <Text>שם משתמש</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.field}>
          <Text>אימייל</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.field}>
          <Text>סיסמה</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />
        </View>

        <View style={styles.field}>
          <Text>אימות סיסמה</Text>
          <TextInput
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            style={styles.input}
            secureTextEntry
          />
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={[styles.button, loading && { backgroundColor: '#999' }]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>הרשמה</Text>
          )}
        </Pressable>

        <Pressable
          style={styles.linkWrap}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.link}>
            כבר רשום? התחברות
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
  },
  field: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  error: {
    color: '#b00020',
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  linkWrap: {
    marginTop: 16,
    alignItems: 'center',
  },
  link: {
    color: '#4f46e5',
    fontWeight: '500',
  },
});
