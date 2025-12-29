import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

export default function PayScreen({ route, navigation }: any) {
  const { groupId } = route.params;

  const [approvalUrl, setApprovalUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 1️⃣ יצירת תשלום וקבלת approvalUrl
  useEffect(() => {
    apiFetch('/payments/paypal/create', {
      method: 'POST',
      body: JSON.stringify({ groupId }),
    })
      .then((res) => {
        if (!res.approvalUrl) {
          throw new Error('No approval URL');
        }
        setApprovalUrl(res.approvalUrl);
      })
      .catch(() => {
        Alert.alert('שגיאה', 'לא ניתן להתחיל תשלום');
        navigation.replace('Profile');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !approvalUrl) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 2️⃣ WebView לפייפל
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: approvalUrl }}
        onNavigationStateChange={(navState) => {
          const url = navState.url;

          // ✅ הצלחה
          if (url.includes('/payment/success')) {
            Alert.alert('🎉 הצלחה', 'התשלום בוצע בהצלחה');
            navigation.replace('Profile');
          }

          // ❌ כישלון / ביטול
          if (
            url.includes('/payment/success/fail') ||
            url.includes('/payment/cancel')
          ) {
            Alert.alert('❌ שגיאה', 'התשלום נכשל או בוטל');
            navigation.replace('Profile');
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
