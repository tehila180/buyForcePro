import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProductsScreen from './screens/ProductsScreen';
import ProductScreen from './screens/ProductScreen';
import GroupScreen from './screens/GroupScreen';
import MyGroupsScreen from './screens/MyGroupsScreen';
import PayScreen from './screens/PayScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import CategoryProductsScreen from './screens/CategoryProductsScreen';
import AdminCategoriesScreen from './screens/admin/AdminCategoriesScreen';
import AdminProductsScreen from './screens/admin/AdminProductsScreen';
import AdminEditProductScreen from './screens/admin/AdminEditProductScreen';
import AdminNewProductScreen from './screens/admin/AdminNewProductScreen';
import AppHeader from './components/AppHeader';
import AdminStatsScreen from './screens/admin/AdminStatsScreen';
import AdminGroupsScreen from './screens/admin/AdminGroupsScreen';
import AdminUsersScreen from './screens/admin/AdminUsersScreen';
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
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
        <Stack.Screen name="Pay" component={PayScreen} />
        <Stack.Screen name="Categories" component={CategoriesScreen} />
        <Stack.Screen
          name="CategoryProducts"
          component={CategoryProductsScreen}
        />
        <Stack.Screen
  name="AdminCategories"
  component={AdminCategoriesScreen}
/>
<Stack.Screen
  name="AdminStats"
  component={AdminStatsScreen}
/>
<Stack.Screen
  name="AdminGroups"
  component={AdminGroupsScreen}
/>
<Stack.Screen
  name="AdminUsers"
  component={AdminUsersScreen}
/>


     <Stack.Screen name="AdminProducts" component={AdminProductsScreen} />
    <Stack.Screen name="AdminEditProduct" component={AdminEditProductScreen} />
    <Stack.Screen name="AdminNewProduct" component={AdminNewProductScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
