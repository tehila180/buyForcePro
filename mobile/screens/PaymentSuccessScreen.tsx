import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function PaymentSuccessScreen({ navigation, route }: any) {
  const { groupId } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 התשלום בוצע בהצלחה</Text>

      {groupId && (
        <Text style={styles.text}>קבוצה מספר {groupId}</Text>
      )}

      <Pressable
        style={styles.button}
        onPress={() => navigation.replace('Profile')}
      >
        <Text style={styles.buttonText}>מעבר לאזור האישי</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
