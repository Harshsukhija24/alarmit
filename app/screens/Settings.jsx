import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { auth } from "../../firebaseConfig";
import { signOutUser, getUserProfile } from "../utils/AuthManager";
import AuthGuard from "../components/AuthGuard";

const SettingsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    soundEffects: true,
    vibration: true,
    dailyStats: false,
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const profileResult = await getUserProfile();
        if (profileResult.success) {
          setUserProfile(profileResult.user);
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await signOutUser();
            // Navigation will be handled by App.js auth observer
          } catch (error) {
            Alert.alert("Error", "Failed to sign out");
            console.error(error);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const toggleSetting = (setting) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  return (
    <AuthGuard>
      <View className="flex-1 bg-gray-900">
        <View className="p-5">
          <Text className="text-white text-2xl font-bold">Settings</Text>
        </View>

        <ScrollView className="flex-1 px-5">
          {/* User Account Section */}
          <View className="bg-gray-800 p-5 rounded-xl mb-6">
            <Text className="text-gray-400 font-medium mb-4">ACCOUNT</Text>

            <TouchableOpacity
              className="bg-red-600 py-3 mt-2 rounded-lg items-center"
              onPress={handleSignOut}
            >
              <Text className="text-white font-bold">Sign Out</Text>
            </TouchableOpacity>
          </View>

          {/* App Settings Section */}
          <View className="bg-gray-800 p-5 rounded-xl mb-6">
            <Text className="text-gray-400 font-medium mb-4">APP SETTINGS</Text>

            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-5">
                <View className="flex-row items-center">
                  <MaterialIcons name="notifications" size={24} color="white" />
                  <Text className="text-white text-base ml-3">
                    Notifications
                  </Text>
                </View>
                <Switch
                  value={settings.notifications}
                  onValueChange={() => toggleSetting("notifications")}
                  trackColor={{ false: "#767577", true: "#E53935" }}
                  thumbColor={settings.notifications ? "#f4f3f4" : "#f4f3f4"}
                />
              </View>

              <View className="flex-row justify-between items-center mb-5">
                <View className="flex-row items-center">
                  <MaterialIcons name="dark-mode" size={24} color="white" />
                  <Text className="text-white text-base ml-3">Dark Mode</Text>
                </View>
                <Switch
                  value={settings.darkMode}
                  onValueChange={() => toggleSetting("darkMode")}
                  trackColor={{ false: "#767577", true: "#E53935" }}
                  thumbColor={settings.darkMode ? "#f4f3f4" : "#f4f3f4"}
                />
              </View>

              <View className="flex-row justify-between items-center mb-5">
                <View className="flex-row items-center">
                  <MaterialIcons name="volume-up" size={24} color="white" />
                  <Text className="text-white text-base ml-3">
                    Sound Effects
                  </Text>
                </View>
                <Switch
                  value={settings.soundEffects}
                  onValueChange={() => toggleSetting("soundEffects")}
                  trackColor={{ false: "#767577", true: "#E53935" }}
                  thumbColor={settings.soundEffects ? "#f4f3f4" : "#f4f3f4"}
                />
              </View>

              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <MaterialIcons name="vibration" size={24} color="white" />
                  <Text className="text-white text-base ml-3">Vibration</Text>
                </View>
                <Switch
                  value={settings.vibration}
                  onValueChange={() => toggleSetting("vibration")}
                  trackColor={{ false: "#767577", true: "#E53935" }}
                  thumbColor={settings.vibration ? "#f4f3f4" : "#f4f3f4"}
                />
              </View>
            </View>
          </View>

          {/* Alarm Settings */}
          <View className="bg-gray-800 p-5 rounded-xl mb-6">
            <Text className="text-gray-400 font-medium mb-4">
              ALARM SETTINGS
            </Text>

            <View className="flex-row justify-between items-center mb-5">
              <View className="flex-row items-center">
                <MaterialIcons name="insights" size={24} color="white" />
                <Text className="text-white text-base ml-3">
                  Daily Statistics
                </Text>
              </View>
              <Switch
                value={settings.dailyStats}
                onValueChange={() => toggleSetting("dailyStats")}
                trackColor={{ false: "#767577", true: "#E53935" }}
                thumbColor={settings.dailyStats ? "#f4f3f4" : "#f4f3f4"}
              />
            </View>
          </View>

          {/* About Section */}
          <View className="bg-gray-800 p-5 rounded-xl mb-6">
            <Text className="text-gray-400 font-medium mb-4">ABOUT</Text>

            <TouchableOpacity className="py-2">
              <Text className="text-white text-base">Privacy Policy</Text>
            </TouchableOpacity>

            <TouchableOpacity className="py-2">
              <Text className="text-white text-base">Terms of Service</Text>
            </TouchableOpacity>

            <TouchableOpacity className="py-2">
              <Text className="text-white text-base">About Us</Text>
            </TouchableOpacity>

            <View className="mt-3">
              <Text className="text-gray-500">Version 1.0.0</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </AuthGuard>
  );
};

export default SettingsScreen;
