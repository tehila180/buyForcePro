import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { apiFetch } from '../lib/api';

type Member = {
  id: string;
  name: string;
  hasPaid: boolean;
  isMe: boolean;
};

type Group = {
  id: number;
  product: {
    name: string;
  };
  status: string;
  target: number;
  membersCount: number;
  isMember: boolean;
  members: Member[];
};

export default function GroupScreen({ route }: any) {
  const { id } = route.params;

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  async function loadGroup() {
    setLoading(true);
    try {
      const data = await apiFetch(`/groups/${id}`);
      setGroup(data);
    } catch {
      Alert.alert('שגיאה', 'קבוצה לא נמצאה');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGroup();
  }, [id]);

  async function joinGroup() {
    if (!group) return;

    try {
      setJoining(true);
      await apiFetch(`/groups/${group.id}/join`, { method: 'POST' });
      await loadGroup();
    } catch {
      Alert.alert('שגיאה', 'יש להתחבר כדי להצטרף');
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>טוען קבוצה…</Text>
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.center}>
        <Text>קבוצה לא נמצאה</Text>
      </View>
    );
  }

  const isFull = group.membersCount >= group.target;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <Text style={styles.title}>{group.product.name}</Text>
      <Text style={styles.subtitle}>
        👥 {group.membersCount} / {group.target}
      </Text>

      {/* Members */}
      <Text style={styles.section}>משתתפים</Text>

      <View style={styles.membersBox}>
        {group.members.map(m => (
          <View
            key={m.id}
            style={[
              styles.memberRow,
              m.isMe && styles.meRow,
            ]}
          >
            <Text>
              {m.name}
              {m.isMe && (
                <Text style={styles.meText}> (אני)</Text>
              )}
            </Text>

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
      </View>

      {/* Status */}
      {group.isMember && (
        <Text style={styles.success}>
          ✔️ את כבר מצורפת לקבוצה
        </Text>
      )}

      {!group.isMember && isFull && (
        <Text style={styles.muted}>🚫 הקבוצה מלאה</Text>
      )}

      {!group.isMember && !isFull && (
        <Pressable
          style={[
            styles.joinBtn,
            joining && { backgroundColor: '#ccc' },
          ]}
          onPress={joinGroup}
          disabled={joining}
        >
          <Text style={styles.joinText}>
            {joining ? 'מצטרף…' : '➕ הצטרפות לקבוצה'}
          </Text>
        </Pressable>
      )}
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
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  section: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  membersBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 24,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  meRow: {
    backgroundColor: '#f0ecff',
  },
  meText: {
    fontWeight: '700',
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
    marginBottom: 12,
  },
  muted: {
    color: '#777',
    marginBottom: 12,
  },
  joinBtn: {
    backgroundColor: '#6c4eff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
