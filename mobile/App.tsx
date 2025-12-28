import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import AppHeader from './components/AppHeader';
import ProductsScreen from './screens/ProductsScreen';
import ProductScreen from './screens/ProductScreen';
import GroupScreen from './screens/GroupScreen';
import MyGroupsScreen from './screens/MyGroupsScreen';
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"   // ⭐ הדף הראשון
        screenOptions={({ navigation }) => ({
          header: () => <AppHeader navigation={navigation} />,
        })}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Products" component={ProductsScreen} />
        <Stack.Screen name="Product" component={ProductScreen} />
<Stack.Screen name="Group" component={GroupScreen} />
<Stack.Screen name="Profile" component={MyGroupsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
