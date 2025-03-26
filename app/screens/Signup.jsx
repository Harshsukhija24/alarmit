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
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

const Signup = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handleSignup = async () => {
    if (!email || !password || !displayName) {
      setError("Please fill all required fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update profile to add display name
      await updateProfile(userCredential.user, {
        displayName: displayName.trim(),
      });

      // Create a user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        displayName: displayName.trim(),
        email: email.toLowerCase(),
        createdAt: new Date(),
      });

      Alert.alert("Success", "Account created successfully!");
      // Navigation will be handled by the auth state listener in App.js
    } catch (error) {
      console.error("Signup error:", error);
      let errorMessage = "Failed to create account. Please try again.";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email is already in use";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak";
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
      <Text className="text-white text-3xl font-bold mb-5">Sign Up</Text>

      {error ? (
        <Text className="text-red-400 mb-4 bg-black/50 p-2.5 rounded w-full text-center">
          {error}
        </Text>
      ) : null}

      <TextInput
        placeholder="Display Name"
        placeholderTextColor="white"
        className="w-full border border-white bg-white/20 text-white p-3 rounded-lg mb-4"
        value={displayName}
        onChangeText={setDisplayName}
      />

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

      <TextInput
        placeholder="Confirm Password"
        placeholderTextColor="white"
        secureTextEntry
        className="w-full border border-white bg-white/20 text-white p-3 rounded-lg mb-4"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity
        className="bg-blue-600 w-full p-3 rounded-lg flex-row justify-center items-center"
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="white" className="mr-2" /> : null}
        <Text className="text-white text-center text-lg font-bold">
          Sign Up
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Login")}
        className="mt-5"
      >
        <Text className="text-white text-base">
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

export default Signup;
