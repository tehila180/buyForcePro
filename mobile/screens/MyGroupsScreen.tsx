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
  product: { name: string };
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
          <Text style={styles.productName}>{group.product.name}</Text>
          <Text style={styles.membersCount}>
            👥 {group.membersCount} / {group.target}
          </Text>

          {/* כפתור תשלום */}
          {group.isCompleted && !group.hasPaid && (
            <Pressable
              style={styles.payBtn}
              onPress={() =>
                navigation.navigate('Pay', { groupId: group.id })
              }
            >
              <Text style={styles.payText}>💳 המשך לתשלום</Text>
            </Pressable>
          )}

          {/* סטטוס אישי */}
          {group.hasPaid && (
            <Text style={styles.success}>✅ את/ה שילמת</Text>
          )}

          {/* סטטוס קבוצה */}
          {group.allPaid && (
            <Text style={styles.success}>
              🎉 הקבוצה הושלמה – כולם שילמו
            </Text>
          )}

          {/* 🔽 מי שילם / לא שילם */}
          <View style={styles.membersBox}>
            <Text style={styles.membersTitle}>סטטוס תשלומים:</Text>

            {group.members.map(member => (
              <View key={member.id} style={styles.memberRow}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text
                  style={[
                    styles.memberStatus,
                    member.hasPaid ? styles.paid : styles.notPaid,
                  ]}
                >
                  {member.hasPaid ? '✅ שילם' : '⏳ ממתין'}
                </Text>
              </View>
            ))}
          </View>
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
  muted: {
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
  },
  membersCount: {
    marginTop: 4,
    marginBottom: 8,
    color: '#444',
  },
  payBtn: {
    marginTop: 12,
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  payText: {
    color: '#fff',
    fontWeight: '600',
  },
  success: {
    color: '#00b894',
    fontWeight: '700',
    marginTop: 8,
  },
  membersBox: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  membersTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  memberName: {
    color: '#333',
  },
  memberStatus: {
    fontWeight: '600',
  },
  paid: {
    color: '#00b894',
  },
  notPaid: {
    color: '#e17055',
  },
});
