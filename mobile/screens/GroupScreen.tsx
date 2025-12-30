import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { apiFetch } from '../lib/api';

/* ---------- Types ---------- */

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
  status: 'open' | 'completed' | 'paid';
  target: number;
  membersCount: number;
  isMember: boolean;
  members: Member[];
};

/* ---------- Screen ---------- */

export default function GroupScreen({ route, navigation }: any) {
  const { id } = route.params;

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  /* ---------- Load Group ---------- */

  async function loadGroup() {
    setLoading(true);
    try {
      const data = await apiFetch(`/groups/${id}`);
      setGroup(data);
    } catch {
      showMessage('שגיאה', 'קבוצה לא נמצאה');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGroup();
  }, [id]);

  /* ---------- Helper: Message ---------- */

  function showMessage(title: string, message: string) {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  }

  /* ---------- Join Group ---------- */

  async function joinGroup() {
    if (!group) return;

    try {
      setJoining(true);
      await apiFetch(`/groups/${group.id}/join`, {
        method: 'POST',
      });
      await loadGroup();
    } catch (error: any) {
      console.log('JOIN GROUP ERROR:', error?.status);

      if (error?.status === 401) {
        showMessage(
          'נדרש חשבון',
          'כדי להצטרף לקבוצה עליך להתחבר או להירשם',
        );
        return;
      }

      showMessage('שגיאה', 'לא ניתן להצטרף לקבוצה');
    } finally {
      setJoining(false);
    }
  }

  /* ---------- Loading ---------- */

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

  /* ---------- Helpers ---------- */

  const isFull = group.membersCount >= group.target;
  const isCompleted = group.status === 'completed';
  const isPaid = group.status === 'paid';

  const me = group.members.find(m => m.isMe);
  const iPaid = me?.hasPaid === true;

  /* ---------- UI ---------- */

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{group.product.name}</Text>
      <Text style={styles.subtitle}>
        👥 {group.membersCount} / {group.target}
      </Text>

      <Text style={styles.section}>משתתפים</Text>

      <View style={styles.membersBox}>
        {group.members.map(m => (
          <View
            key={m.id}
            style={[styles.memberRow, m.isMe && styles.meRow]}
          >
            <Text>
              {m.name}
              {m.isMe && <Text style={styles.meText}> (אני)</Text>}
            </Text>

            <Text
              style={[
                styles.payment,
                m.hasPaid ? styles.paid : styles.pending,
              ]}
            >
              {m.hasPaid ? '✅ שילם' : '⏳ ממתין'}
            </Text>
          </View>
        ))}
      </View>

      {!group.isMember && !isFull && group.status === 'open' && (
        <Pressable
          style={styles.joinBtn}
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
