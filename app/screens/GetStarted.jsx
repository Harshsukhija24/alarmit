import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";

const GetStarted = () => {
  const navigation = useNavigation();

  return (
    <ImageBackground
      source={{
        uri: "https://i.pinimg.com/736x/88/9d/03/889d0311af25dd85e87efb8f968b1d90.jpg",
      }} // Replace with actual image URL
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View className="flex-1 justify-center items-center px-6 bg-black/40">
        <Text className="text-white text-3xl font-bold text-center">
          Wake Up Refreshed Everyday
        </Text>
        <Text className="text-gray-300 text-lg mt-2 text-center">
          Alarmy never fails to wake you up
        </Text>

        {/* Alarm Image */}
        <Image
          source={{
            uri: "https://i.pinimg.com/736x/86/7a/25/867a25c20cc30ff1abe37247e2d856c3.jpg",
          }}
          className="w-40 h-40 mt-6"
          resizeMode="contain"
        />

        <TouchableOpacity
          className="bg-red-500  px-20 py-3 rounded-full mt-6"
          onPress={() => navigation.navigate("Login")}
        >
          <Text className="text-white text-lg font-semibold">Next</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default GetStarted;
