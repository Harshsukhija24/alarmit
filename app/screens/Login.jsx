import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";

const Login = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigation.replace("MainScreen");
      }
    });

    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigation will be handled by the auth state listener in App.js
    } catch (error) {
      let errorMessage = "Login failed. Please try again.";

      if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{
        uri: "https://i.pinimg.com/736x/88/9d/03/889d0311af25dd85e87efb8f968b1d90.jpg",
      }}
      className="flex-1 justify-center items-center px-5"
      resizeMode="cover"
    >
      <Text className="text-white text-3xl font-bold mb-5">Login</Text>

      {error ? (
        <Text className="text-red-400 mb-4 bg-black/50 p-2.5 rounded w-full text-center">
          {error}
        </Text>
      ) : null}

      <TextInput
        placeholder="Email"
        placeholderTextColor="white"
        keyboardType="email-address"
        autoCapitalize="none"
        className="w-full border border-white bg-white/20 text-white p-3 rounded-lg mb-4"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="white"
        secureTextEntry
        className="w-full border border-white bg-white/20 text-white p-3 rounded-lg mb-4"
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        className="bg-blue-600 w-full p-3 rounded-lg flex-row justify-center items-center"
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="white" className="mr-2" /> : null}
        <Text className="text-white text-center text-lg font-bold">Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Signup")}
        className="mt-5"
      >
        <Text className="text-white text-base">
          Don't have an account? Sign Up
        </Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

export default Login;
