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

type Member = {
  id: string;
  name: string;
  hasPaid: boolean;
};

type Group = {
  id: number;
  product: {
    name: string;
  };
  target: number;
  membersCount: number;
  members: Member[];
  isCompleted: boolean;
  hasPaid: boolean;
  allPaid: boolean;
};

export default function MyGroupsScreen({ navigation }: any) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/groups/my')
      .then(setGroups)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>טוען…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>האזור האישי שלי</Text>

      {groups.length === 0 && (
        <Text style={styles.muted}>אין קבוצות פעילות.</Text>
      )}

      {groups.map(group => (
        <View key={group.id} style={styles.card}>
          <Text style={styles.productName}>
            {group.product.name}
          </Text>

          <Text style={styles.count}>
            👥 {group.membersCount} / {group.target}
          </Text>

          <Text style={styles.section}>משתתפים</Text>

          {group.members.map(m => (
            <View key={m.id} style={styles.memberRow}>
              <Text>{m.name}</Text>
              <Text
                style={[
                  styles.payment,
                  m.hasPaid
                    ? styles.paid
                    : styles.pending,
                ]}
              >
                {m.hasPaid ? '✅ שילם' : '⏳ ממתין'}
              </Text>
            </View>
          ))}

          {/* 🎉 כולם שילמו */}
          {group.allPaid && (
            <Text style={styles.success}>
              🎉 הקבוצה הושלמה – כולם שילמו!
            </Text>
          )}

          {/* ⏳ הקבוצה עדיין לא מלאה */}
          {!group.isCompleted && (
            <Text style={styles.muted}>
              ⏳ ממתינים להשלמת הקבוצה
            </Text>
          )}

          {/* 💳 הקבוצה מלאה אבל המשתמש עוד לא שילם */}
          {group.isCompleted &&
            !group.hasPaid &&
            !group.allPaid && (
              <Pressable
                style={styles.payBtn}
                onPress={() =>
                  navigation.navigate('Pay', { id: group.id })
                }
              >
                <Text style={styles.payText}>
                  💳 המשך לתשלום
                </Text>
              </Pressable>
            )}

          {/* ✅ המשתמש שילם אבל עוד לא כולם */}
          {group.hasPaid && !group.allPaid && (
            <Text style={styles.success}>
              ✅ שילמת – ממתינים לשאר המשתתפים
            </Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

/* ---------- Styles ---------- */

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
  muted: {
    color: '#666',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  count: {
    marginBottom: 12,
  },
  section: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  payment: {
    fontWeight: '500',
  },
  paid: {
    color: '#00b894',
  },
  pending: {
    color: '#e17055',
  },
  success: {
    color: '#00b894',
    fontWeight: '700',
    marginTop: 12,
  },
  payBtn: {
    marginTop: 14,
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  payText: {
    color: '#fff',
    fontWeight: '600',
  },
});
