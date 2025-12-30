import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

/* ---------- Public Screens ---------- */
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

/* ---------- Products ---------- */
import ProductsScreen from './screens/ProductsScreen';
import ProductScreen from './screens/ProductScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import CategoryProductsScreen from './screens/CategoryProductsScreen';

/* ---------- Groups & Payments ---------- */
import GroupScreen from './screens/GroupScreen';
import MyGroupsScreen from './screens/MyGroupsScreen';
import PayScreen from './screens/PayScreen';
import PaymentSuccessScreen from './screens/PaymentSuccessScreen';
import PaymentCancelScreen from './screens/PaymentCancelScreen';

/* ---------- Admin ---------- */
import AdminCategoriesScreen from './screens/admin/AdminCategoriesScreen';
import AdminProductsScreen from './screens/admin/AdminProductsScreen';
import AdminEditProductScreen from './screens/admin/AdminEditProductScreen';
import AdminNewProductScreen from './screens/admin/AdminNewProductScreen';
import AdminStatsScreen from './screens/admin/AdminStatsScreen';
import AdminGroupsScreen from './screens/admin/AdminGroupsScreen';
import AdminUsersScreen from './screens/admin/AdminUsersScreen';

/* ---------- Components ---------- */
import AppHeader from './components/AppHeader';

const Stack = createNativeStackNavigator();

/**
 * 🔗 Linking configuration
 * חובה בשביל Expo Web + Redirect מ-PayPal
 * תומך גם ב־8081 וגם ב־19006
 */
const linking = {
  prefixes: [
    'http://localhost:8081',
    'http://localhost:19006',
  ],
  config: {
    screens: {
      Home: '',
      Login: 'login',
      Register: 'register',

      Products: 'products',
      Product: 'product/:id',

      Group: 'group/:id',
      Profile: 'profile',

      Pay: 'pay',

      // ⭐️ PayPal redirect
      'payment/success': 'payment/success',
      'payment/cancel': 'payment/cancel',

      // Admin (לא חובה ל-Web אבל לא מזיק)
      AdminCategories: 'admin/categories',
      AdminProducts: 'admin/products',
      AdminEditProduct: 'admin/products/edit',
      AdminNewProduct: 'admin/products/new',
      AdminStats: 'admin/stats',
      AdminGroups: 'admin/groups',
      AdminUsers: 'admin/users',
    },
  },
};

export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={({ navigation }) => ({
          header: () => <AppHeader navigation={navigation} />,
        })}
      >
        {/* ---------- Public ---------- */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* ---------- Products ---------- */}
        <Stack.Screen name="Products" component={ProductsScreen} />
        <Stack.Screen name="Product" component={ProductScreen} />
        <Stack.Screen name="Categories" component={CategoriesScreen} />
        <Stack.Screen
          name="CategoryProducts"
          component={CategoryProductsScreen}
        />

        {/* ---------- Groups ---------- */}
        <Stack.Screen name="Group" component={GroupScreen} />
        <Stack.Screen name="Profile" component={MyGroupsScreen} />

        {/* ---------- Payments ---------- */}
        <Stack.Screen name="Pay" component={PayScreen} />
        <Stack.Screen
          name="payment/success"
          component={PaymentSuccessScreen}
        />
        <Stack.Screen
          name="payment/cancel"
          component={PaymentCancelScreen}
        />

        {/* ---------- Admin ---------- */}
        <Stack.Screen
          name="AdminCategories"
          component={AdminCategoriesScreen}
        />
        <Stack.Screen name="AdminProducts" component={AdminProductsScreen} />
        <Stack.Screen
          name="AdminEditProduct"
          component={AdminEditProductScreen}
        />
        <Stack.Screen
          name="AdminNewProduct"
          component={AdminNewProductScreen}
        />
        <Stack.Screen name="AdminStats" component={AdminStatsScreen} />
        <Stack.Screen name="AdminGroups" component={AdminGroupsScreen} />
        <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
