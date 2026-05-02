import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// --- SCREENS ---
import AuthScreen from "./screens/AuthScreen";
import HomeScreen from "./screens/HomeScreen";
import LanguageScreen from "./screens/LanguageScreen";
import LyricScreen from "./screens/LyricScreen";
import UploadScreen from "./screens/UploadScreen";

// --- PLACEHOLDER SCREENS ---
import CategoriesScreen from "./screens/CategoriesScreen";
import FavouritesScreen from "./screens/FavouritesScreen";
import ProfileScreen from "./screens/ProfileScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- PHASE 1: BOTTOM TAB NAVIGATOR ---
function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
              // Automatically set header and tab bar colours based on the theme
              headerShown: true,
              headerTintColor: '#166534',
              headerTiltStyle: { fontWeight: 'bold' },
              tabBarActiveTintColor: '#166534',
              tabBarInactiveTintColor: 'gray',
              tabBarStyle: { paddingBottom: 5, paddingTop: 5, height: 60 },
              
              // Assign icons based on the route name
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                else if (route.name === 'Categories') iconName = focused ? 'grid' : 'grid-outline';
                else if (route.name === 'Upload') iconName = focused ? 'add-circle' : 'add-circle-outline';
                else if (route.name === 'Favourites') iconName = focused ? 'person' : 'person-outline';

                return <Ionicons name={iconName} size={size} color={color} />;
              },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{headerShown: false}}/>
            <Tab.Screen name="Categories" component={CategoriesScreen} />
            <Tab.Screen name="Upload" component={UploadScreen} options={{title: 'Add Song'}} />
            <Tab.Screen name="Favourites" component={FavouritesScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}
// --- PHASE 2: STACK NAVIGATOR ---
export default function App() {
    return (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="MainApp">
            <Stack.Screen name="MainApp" component={MainTabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="Lyrics" component={LyricScreen} options={{headerShown: false}} />
            <Stack.Screen name="Language" component={LanguageScreen} options={({ route }) => ({ title: route.params.categoryName })} />
            <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'Login' }} />  
          </Stack.Navigator>
        </NavigationContainer>
      );
    }