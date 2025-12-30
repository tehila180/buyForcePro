import { View, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

export default function PayScreen({ route }: any) {
  const { groupId } = route.params;
  const [approvalUrl, setApprovalUrl] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/payments/paypal/create', {
      method: 'POST',
      body: JSON.stringify({ groupId }),
    }).then(res => {
      if (Platform.OS === 'web') {
        window.location.href = res.approvalUrl;
      } else {
        setApprovalUrl(res.approvalUrl);
      }
    });
  }, []);

  if (Platform.OS !== 'web' && !approvalUrl) {
    return <ActivityIndicator size="large" />;
  }

  if (Platform.OS !== 'web') {
    return <WebView source={{ uri: approvalUrl! }} />;
  }

  return <View />;
}
