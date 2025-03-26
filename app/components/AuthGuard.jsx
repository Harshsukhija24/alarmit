import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../../firebaseConfig";

const AuthGuard = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthenticated(!!user);
      setLoading(false);

      if (!user) {
        // Redirect to login if not authenticated
        navigation.replace("Login");
      }
    });

    return () => unsubscribe();
  }, [navigation]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <ActivityIndicator size="large" color="#E53935" />
        <Text className="text-white mt-4">Verifying authentication...</Text>
      </View>
    );
  }

  if (!authenticated) {
    return null; // Will be redirected in the useEffect
  }

  return children;
};

export default AuthGuard;
