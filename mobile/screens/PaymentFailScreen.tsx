import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function PaymentFailScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>❌ התשלום נכשל</Text>
      <Text style={styles.text}>
        ניתן לנסות שוב או לחזור לאזור האישי
      </Text>

      <Pressable
        style={styles.button}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>חזרה</Text>
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
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  text: {
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
