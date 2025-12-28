import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { storage } from '../lib/storage';

type Props = {
  navigation: any;
};

/* ---------- Helpers ---------- */

async function checkAuth(
  setLogged: (v: boolean) => void,
  setAdmin: (v: boolean) => void
) {
  try {
    const token = await storage.get('token');

    if (!token) {
      setLogged(false);
      setAdmin(false);
      return;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    setLogged(true);
    setAdmin(payload.role === 'admin');
  } catch {
    setLogged(false);
    setAdmin(false);
  }
}

/* ---------- Component ---------- */

export default function AppHeader({ navigation }: Props) {
  const [logged, setLogged] = useState(false);
  const [admin, setAdmin] = useState(false);

  // 🔄 מתעדכן כל פעם שהמסך בפוקוס
  useFocusEffect(
    useCallback(() => {
      checkAuth(setLogged, setAdmin);
    }, [])
  );

  async function handleLogout() {
    await storage.remove('token');
    setLogged(false);
    setAdmin(false);
    navigation.replace('Login');
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        {/* Top Row */}
        <View style={styles.row}>
          <Pressable onPress={() => navigation.navigate('Home')}>
            <Text style={styles.logo}>BuyForce</Text>
          </Pressable>

          <View style={styles.nav}>
            {/* ❌ לא מחובר */}
            {!logged && (
              <>
                <Pressable onPress={() => navigation.navigate('Home')}>
                  <Text style={styles.link}>ראשי</Text>
                </Pressable>
                <Pressable onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.link}>התחברות</Text>
                </Pressable>
                <Pressable onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.link}>הרשמה</Text>
                </Pressable>
              </>
            )}

            {/* ✅ מחובר */}
            {logged && (
              <>
                <Pressable onPress={() => navigation.navigate('Home')}>
                  <Text style={styles.link}>ראשי</Text>
                </Pressable>
                <Pressable onPress={() => navigation.navigate('Profile')}>
                  <Text style={styles.link}>האזור האישי</Text>
                </Pressable>
                <Pressable onPress={handleLogout}>
                  <Text style={styles.logout}>התנתקות</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        {/* 🔐 Admin Menu */}
        {admin && (
          <View style={styles.adminRow}>
            <Text style={styles.adminLabel}>Admin:</Text>

            <Pressable onPress={() => navigation.navigate('AdminProducts')}>
              <Text style={styles.adminLink}>מוצרים</Text>
            </Pressable>

            <Pressable onPress={() => navigation.navigate('AdminCategories')}>
              <Text style={styles.adminLink}>קטגוריות</Text>
            </Pressable>

            <Pressable onPress={() => navigation.navigate('AdminGroups')}>
              <Text style={styles.adminLink}>קבוצות</Text>
            </Pressable>

            <Pressable onPress={() => navigation.navigate('AdminUsers')}>
              <Text style={styles.adminLink}>משתמשים</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  safe: {
    backgroundColor: '#fff',
  },
  header: {
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 18,
    fontWeight: '700',
  },
  nav: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  link: {
    fontSize: 14,
  },
  logout: {
    fontSize: 14,
    color: '#b00020',
    fontWeight: '600',
  },
  adminRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  adminLabel: {
    fontWeight: '700',
    fontSize: 13,
  },
  adminLink: {
    fontSize: 13,
    color: '#4f46e5',
  },
});
