import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { updateProfile, signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";

const ProfileScreen = ({ navigation }) => {
  const currentUser = auth.currentUser;
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(
    currentUser?.displayName || ""
  );

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      // Navigation will be handled by App.js auth observer
    } catch (error) {
      Alert.alert("Error", "Failed to log out: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert("Error", "Display name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim(),
      });

      Alert.alert("Success", "Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <View className="flex-1 items-center justify-center p-4 bg-zinc-900">
        <Text className="text-white text-lg mb-5 text-center">
          Please log in to view your profile
        </Text>
        <TouchableOpacity
          className="bg-blue-500 py-3 px-6 rounded-lg"
          onPress={() => navigation.navigate("Login")}
        >
          <Text className="text-white font-semibold text-base">
            Go to Login
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-zinc-900">
      <View className="bg-zinc-800 p-5 items-center mb-5">
        <View className="mb-4">
          <Ionicons name="person-circle" size={100} color="#3B82F6" />
        </View>

        {isEditing ? (
          <View className="w-full px-5">
            <TextInput
              className="bg-zinc-700 rounded-lg p-3 text-white mb-4"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Display Name"
              placeholderTextColor="#9CA3AF"
              autoFocus
            />
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="bg-zinc-700 flex-1 mr-2 py-3 rounded-lg items-center"
                onPress={() => {
                  setDisplayName(currentUser?.displayName || "");
                  setIsEditing(false);
                }}
                disabled={isLoading}
              >
                <Text className="text-white font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-blue-500 flex-1 ml-2 py-3 rounded-lg items-center"
                onPress={handleUpdateProfile}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text className="text-white font-semibold">Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="items-center">
            <Text className="text-2xl font-bold text-white mb-1">
              {currentUser.displayName || "User"}
            </Text>
            <Text className="text-gray-400 mb-3">{currentUser.email}</Text>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="pencil" size={16} color="#3B82F6" />
              <Text className="text-blue-500 ml-1">Edit Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View className="mx-4 mb-5 bg-zinc-800 rounded-xl p-4">
        <Text className="text-white text-lg font-bold mb-4">Account</Text>

        <View className="flex-row justify-between py-3 border-b border-zinc-700">
          <Text className="text-white">Email</Text>
          <Text className="text-gray-400">{currentUser.email}</Text>
        </View>

        <View className="flex-row justify-between py-3">
          <Text className="text-white">User ID</Text>
          <Text className="text-gray-400">{currentUser.uid}</Text>
        </View>
      </View>

      <View className="mx-4 mb-5 bg-zinc-800 rounded-xl p-4">
        <TouchableOpacity
          className="flex-row items-center justify-center py-3"
          onPress={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text className="text-red-500 ml-2 font-semibold">Logout</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
