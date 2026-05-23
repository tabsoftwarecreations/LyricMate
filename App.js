import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

// --- SCREENS ---
import { supabase } from './screens/supabase';
import AuthScreen from "./screens/AuthScreen";
import HomeScreen from "./screens/HomeScreen";
import LanguageScreen from "./screens/LanguageScreen";
import LyricScreen from "./screens/LyricScreen";
import UploadScreen from "./screens/UploadScreen";
import SplashScreen from "./screens/SplashScreen";
import AdminScreen from "./screens/AdminScreen";

// --- PLACEHOLDER SCREENS ---
import CategoriesScreen from "./screens/CategoriesScreen";
import FavouritesScreen from "./screens/FavouritesScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SettingsScreen from "./screens/SettingsScreen"; // VERIFIED IMPORT

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- PHASE 1: BOTTOM TAB NAVIGATOR ---
function MainTabNavigator() {
    const { colors } = useTheme();

    return (
        <Tab.Navigator
        backBehavior="initialRoute"
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.secondaryText,
                tabBarStyle: {
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 68,
                    backgroundColor: colors.card,
                    borderTopColor: colors.border,
                    borderTopWidth: 0.5,
                },
                tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'Categories') iconName = focused ? 'grid' : 'grid-outline';
                    else if (route.name === 'Upload') iconName = focused ? 'add-circle' : 'add-circle-outline';
                    else if (route.name === 'Favourites') iconName = focused ? 'heart' : 'heart-outline';
                    else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
                    return <Ionicons name={iconName} size={focused ? size : size - 1} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Categories" component={CategoriesScreen} />
            <Tab.Screen
                name="Upload"
                component={UploadScreen}
                options={{ title: 'Add Song' }}
                listeners={({ navigation }) => ({
                    tabPress: async (e) => {
                        e.preventDefault();
                        const { data: { session } } = await supabase.auth.getSession();
                        if (!session?.user) { navigation.navigate('Auth'); }
                        else { navigation.navigate('Upload'); }
                    },
                })}
            />
            <Tab.Screen name="Favourites" component={FavouritesScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

// --- PHASE 2: STACK NAVIGATOR ---
export default function App() {
    return (
        <ThemeProvider>
            <NavigationContainer>
                <AppNavigator />
            </NavigationContainer>
        </ThemeProvider>
    );
}

function AppNavigator() {
    const { colors } = useTheme();

    return (
        <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.primary,
                headerShadowVisible: false,
                headerBackTitleVisible: false,
            }}
        >
            <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MainApp" component={MainTabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="Lyrics" component={LyricScreen} options={{ title: '' }} />
            <Stack.Screen name="Language" component={LanguageScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Admin Portal' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        </Stack.Navigator>
    );
}