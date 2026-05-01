import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./screens/HomeScreen";
import LanguageScreen from "./screens/LanguageScreen";

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
            />
            <Stack.Screen
            name="Language"
            component={LanguageScreen}
            options={({ route }) => ({ title: route.params.langName })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      );
    }