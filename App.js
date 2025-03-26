import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Alert } from "react-native";
import { Audio } from "expo-av";
import { onAuthStateChanged } from "firebase/auth"; 
import { auth } from "./firebaseConfig";

// Screens
import AlarmScreen from "./app/screens/AlarmScreen";
import ProfileScreen from "./app/screens/ProfileScreen";
import LoginScreen from "./app/screens/Login";
import SignupScreen from "./app/screens/Signup";

// Components
import AlarmService from "./app/components/AlarmService";

// Audio utility
import { forceClearAudio } from "./app/utils/AudioManager";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// MainTabs Component
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Alarms") {
            iconName = focused ? "alarm" : "alarm-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#E53935",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#121212",
          borderTopColor: "#333",
        },
        headerStyle: {
          backgroundColor: "#121212",
        },
        headerTintColor: "#FFF",
      })}
    >
      <Tab.Screen name="Alarms" component={AlarmScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Handle user state changes
  const onAuthStateChangedHandler = (user) => {
    setUser(user);
    if (initializing) setInitializing(false);
  };

  useEffect(() => {
    // Set up the authentication observer
    const unsubscribe = onAuthStateChanged(auth, onAuthStateChangedHandler);

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Initialize audio on app start
    const initializeAudio = async () => {
      try {
        console.log("Initializing audio system");
        // Reset the audio module to ensure clean state
        await Audio.setIsEnabledAsync(false);
        await forceClearAudio();
        await Audio.setIsEnabledAsync(true);

        // Set audio mode for alarms
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
          playThroughEarpieceAndroid: false,
        });

        console.log("Audio system initialized successfully");
        setAppReady(true);
      } catch (error) {
        console.error("Failed to initialize audio:", error);
        Alert.alert(
          "Audio Initialization Failed",
          "There was a problem setting up the audio. Some features may not work correctly."
        );
        setAppReady(true); // Allow app to continue anyway
      }
    };

    initializeAudio();

    // Clean up
    return () => {
      const disableAudio = async () => {
        try {
          await forceClearAudio();
          await Audio.setIsEnabledAsync(false);
        } catch (error) {
          console.error("Error disabling audio:", error);
        }
      };

      disableAudio();
    };
  }, []);

  // Function to reset audio system - can be called as needed
  const resetAudioSystem = async () => {
    try {
      Alert.alert(
        "Resetting Audio",
        "Attempting to reset the audio system...",
        [{ text: "OK" }]
      );

      await Audio.setIsEnabledAsync(false);
      await forceClearAudio();
      await Audio.setIsEnabledAsync(true);

      // Set audio mode for alarms
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
        playThroughEarpieceAndroid: false,
      });

      Alert.alert("Success", "Audio system reset successfully");
    } catch (error) {
      console.error("Failed to reset audio:", error);
      Alert.alert("Error", "Failed to reset audio system: " + error.message);
    }
  };

  if (!appReady || initializing) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#121212",
          },
          headerTintColor: "#FFF",
        }}
      >
        {user ? (
          <Stack.Screen
            name="MainScreen"
            component={MainTabs}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
      {user && <AlarmService resetAudioSystem={resetAudioSystem} />}
    </NavigationContainer>
  );
}
