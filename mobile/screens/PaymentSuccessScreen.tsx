import { View, Text } from 'react-native';

export default function PaymentSuccessScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>🎉 התשלום בוצע בהצלחה</Text>
    </View>
  );
}
