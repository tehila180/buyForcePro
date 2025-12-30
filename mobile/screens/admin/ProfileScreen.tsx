import { View, Button } from 'react-native';

export default function ProfileScreen({ navigation }: any) {
  return (
    <View>
      <Button
        title="שלם עכשיו"
        onPress={() =>
          navigation.navigate('Pay', {
            groupId: 123,
          })
        }
      />
    </View>
  );
}
