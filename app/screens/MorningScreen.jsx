import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import React, { useEffect, useState } from "react";
import { AntDesign, Feather } from "@expo/vector-icons"; // Importing Icons

const MorningScreen = () => {
  const [dateTime, setDateTime] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setDateTime(now.toDateString());

      const hour = now.getHours();
      if (hour < 12) {
        setGreeting("Good Morning ☀️");
      } else if (hour < 18) {
        setGreeting("Good Afternoon 🌤️");
      } else {
        setGreeting("Good Evening 🌙");
      }
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <ImageBackground
        source={{
          uri: "https://i.pinimg.com/736x/0f/2a/57/0f2a57e48f66638c6e956b5229a704b7.jpg",
        }}
        className="w-full h-screen flex justify-center items-center"
        resizeMode="cover"
      >
        {/* Date & Greeting Section */}
        <View className="absolute top-24 items-center w-full">
          <Text className="text-white text-3xl font-bold">{greeting}</Text>
          <Text className="text-gray-300 text-lg mt-1">{dateTime}</Text>
        </View>

        {/* Card Container */}
        <View className="p-6 rounded-xl w-11/12 items-center mt-24">
          {/* Morning Energy */}
          <TouchableOpacity className="bg-gray-900 p-5 my-3 w-full rounded-lg flex-row items-center justify-between border border-gray-700">
            <View className="flex-row items-center">
              <Feather
                name="sunrise"
                size={24}
                color="white"
                className="mr-3"
              />
              <View>
                <Text className="text-white text-lg font-bold">
                  Morning Energy
                </Text>
                <Text className="text-gray-300 text-sm">
                  See you in the Morning
                </Text>
              </View>
            </View>
            <AntDesign name="arrowright" size={24} color="white" />
          </TouchableOpacity>

          {/* Morning Feeling */}
          <TouchableOpacity className="bg-gray-900 p-5 my-3 w-full rounded-lg flex-row items-center justify-between border border-gray-700">
            <View className="flex-row items-center">
              <Feather name="smile" size={24} color="white" className="mr-3" />
              <Text className="text-white text-lg font-bold">
                Morning Feeling
              </Text>
            </View>
            <AntDesign name="arrowright" size={24} color="white" />
          </TouchableOpacity>

          {/* Horoscope */}
          <TouchableOpacity className="bg-gray-900 p-5 my-3 w-full rounded-lg flex-row items-center justify-between border border-gray-700">
            <View className="flex-row items-center">
              <Feather name="star" size={24} color="white" className="mr-3" />
              <View>
                <Text className="text-white text-lg font-bold">Horoscope</Text>
                <Text className="text-gray-300 text-sm">
                  Wake up! Your daily fortune is here!
                </Text>
              </View>
            </View>
            <AntDesign name="arrowright" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </ScrollView>
  );
};

export default MorningScreen;
