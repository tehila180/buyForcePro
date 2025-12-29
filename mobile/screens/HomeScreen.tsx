import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';

import { apiFetch } from '../lib/api';
import { storage } from '../lib/storage';

/* ---------- Types ---------- */

type Category = {
  id: number;
  name: string;
  slug: string;
};

type Product = {
  id: number;
  name: string;
  slug: string;
  priceRegular: number;
  priceGroup: number;
};

type ActiveGroup = {
  id: number;
  target: number;
  members: { userId: number }[];
  product: {
    name: string;
    slug: string;
    priceGroup: number;
  };
};

/* ---------- Helpers ---------- */

async function getUserId(): Promise<number | null> {
  try {
    const token = await storage.get('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub;
  } catch {
    return null;
  }
}

async function isUserInGroup(group: ActiveGroup): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;
  return group.members.some(m => m.userId === userId);
}

/* ---------- Screen ---------- */

export default function HomeScreen({ navigation }: any) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [groups, setGroups] = useState<ActiveGroup[]>([]);
  const [joinedMap, setJoinedMap] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch('/groups/featured'),
      apiFetch('/categories'),
      apiFetch('/products'),
    ])
      .then(([groupsData, categoriesData, productsData]) => {
        setGroups(groupsData);
        setCategories(categoriesData);
        setFeatured(productsData);
      })
      .catch(err => Alert.alert('שגיאה', err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    async function loadJoined() {
      const map: Record<number, boolean> = {};
      for (const g of groups) {
        map[g.id] = await isUserInGroup(g);
      }
      setJoinedMap(map);
    }
    if (groups.length) loadJoined();
  }, [groups]);

  async function handleJoin(productSlug: string) {
    const token = await storage.get('token');
    if (!token) {
      Alert.alert('שגיאה', 'יש להתחבר כדי להצטרף');
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('Product', { slug: productSlug });
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>טוען נתונים…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Hero */}
      <Text style={styles.title}>BuyForce</Text>
      <Text style={styles.subtitle}>
        קנייה קבוצתית חכמה – מצטרפים יחד, משלמים פחות 💥
      </Text>

      <Pressable
        style={styles.primaryBtn}
        onPress={() => navigation.navigate('Products')}
      >
        <Text style={styles.primaryText}>התחלת קנייה</Text>
      </Pressable>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Text>✅ מצטרפים לקבוצה עם דמי השתתפות של ₪1</Text>
        <Text>✅ אם הקבוצה לא מגיעה ליעד – הכסף מוחזר</Text>
        <Text>✅ אם הקבוצה נסגרת – משלמים מחיר קבוצתי מוזל</Text>
      </View>

      {/* ---------- Active Groups (כמו שהיה) ---------- */}
      <Text style={styles.section}>👥 קבוצות פעילות</Text>

      {groups.length === 0 ? (
        <Text style={styles.muted}>אין קבוצות פעילות</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator>
          {groups.map(group => {
            const joined = joinedMap[group.id];
            const isFull = group.members.length >= group.target;
            const percent = Math.min(
              100,
              Math.round(
                (group.members.length / group.target) * 100
              )
            );

            return (
              <View key={group.id} style={styles.card}>
                <Text style={styles.cardTitle}>
                  {group.product.name}
                </Text>

                <Text>
                  👥 {group.members.length}/{group.target}
                </Text>

                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${percent}%` },
                    ]}
                  />
                </View>

                <Text style={styles.price}>
                  ₪{group.product.priceGroup}
                </Text>

                {joined && (
                  <Text style={styles.joined}>
                    ✅ כבר מצורפת
                  </Text>
                )}

                {!joined && isFull && (
                  <Text style={styles.full}>
                    🚫 הקבוצה מלאה
                  </Text>
                )}

                {!joined && !isFull && (
                  <Pressable
                    style={styles.joinBtn}
                    onPress={() =>
                      handleJoin(group.product.slug)
                    }
                  >
                    <Text style={styles.joinText}>
                      הצטרפות
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  style={styles.outlineBtn}
                  onPress={() =>
                    navigation.navigate('Group', {
                      id: group.id,
                    })
                  }
                >
                  <Text style={styles.outlineText}>
                    פרטי הקבוצה →
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Categories */}
      <Text style={styles.section}>קטגוריות</Text>
      <View style={styles.rowWrap}>
        {categories.map(c => (
          <Pressable
            key={c.id}
            style={styles.chip}
            onPress={() =>
              navigation.navigate('CategoryProducts', {
                slug: c.slug,
                name: c.name,
              })
            }
          >
            <Text>{c.name}</Text>
          </Pressable>
        ))}
      </View>

      {/* ---------- Featured Products (Grid מותאם מסך) ---------- */}
      <Text style={styles.section}>🔥 מוצרים מובילים</Text>

      <View style={styles.featuredGrid}>
        {featured.map(p => (
          <View key={p.id} style={styles.featuredCard}>
            <Text style={styles.cardTitle}>{p.name}</Text>

            <Text style={styles.oldPrice}>
              ₪{p.priceRegular}
            </Text>

            <Text style={styles.price}>
              ₪{p.priceGroup}
            </Text>

            <Pressable
              onPress={() =>
                navigation.navigate('Product', { slug: p.slug })
              }
            >
              <Text style={styles.link}>
                לצפייה במוצר →
              </Text>
            </Pressable>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: { fontSize: 32, fontWeight: 'bold' },
  subtitle: { marginVertical: 12 },

  primaryBtn: {
    backgroundColor: '#4f46e5',
    padding: 14,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  primaryText: { color: '#fff', fontWeight: '600' },

  infoBox: {
    marginTop: 24,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    gap: 6,
  },

  section: {
    marginTop: 40,
    fontSize: 20,
    fontWeight: '600',
  },
  muted: { color: '#666', marginTop: 8 },

  card: {
    width: 260,
    marginRight: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },

  cardTitle: { fontSize: 16, fontWeight: '600' },

  progressBg: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 999,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4f46e5',
  },

  price: { fontWeight: 'bold', marginVertical: 6 },
  oldPrice: {
    textDecorationLine: 'line-through',
    color: '#999',
  },

  joined: {
    color: 'green',
    fontWeight: '600',
    marginTop: 8,
  },
  full: {
    color: '#c0392b',
    fontWeight: '600',
    marginTop: 8,
  },

  joinBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 8,
  },
  joinText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },

  outlineBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#4f46e5',
    paddingVertical: 6,
    borderRadius: 999,
  },
  outlineText: {
    color: '#4f46e5',
    textAlign: 'center',
  },

  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },

  /* 🔥 Featured Grid */
  featuredGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  featuredCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },

  link: {
    color: '#4f46e5',
    fontWeight: '600',
    marginTop: 6,
  },
});
