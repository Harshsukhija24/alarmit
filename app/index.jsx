import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import GetStarted from "./screens/GetStarted";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import MainScreen from "./MainScreen";
import SettingsScreen from "./screens/Settings";
import AlarmDetail from "./screens/AlarmDetail";
import { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { View, ActivityIndicator } from "react-native";

const Stack = createStackNavigator();

export default function Router({ resetAudioSystem }) {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Handle user state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, [initializing]);

  if (initializing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1a1a1a",
        }}
      >
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={user ? "MainScreen" : "GetStarted"}
    >
      <Stack.Screen name="GetStarted" component={GetStarted} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen
        name="MainScreen"
        component={MainScreen}
        initialParams={{ resetAudioSystem }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          presentation: "card",
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="AlarmDetail"
        component={AlarmDetail}
        options={{
          presentation: "modal",
          animationEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}
