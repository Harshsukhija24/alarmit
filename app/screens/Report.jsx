import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React, { useState } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { CalendarDays } from "lucide-react-native";

const Report = () => {
  const [isAwake, setIsAwake] = useState(false);

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });

  const toggleSleepWake = () => {
    setIsAwake(!isAwake);
  };

  return (
    <View className="flex-1  gap-4  bg-black p-4">
      <View className="flex-row mt-3 justify-between items-center mb-4">
        <Text className="text-white text-lg font-bold">
          {format(today, "MMM dd, yyyy, EEE")}
        </Text>
        <CalendarDays color="white" size={20} />
      </View>

      <View className="flex-row justify-between bg-gray-800 p-3 rounded-lg mb-4">
        {Array.from({ length: 7 }).map((_, index) => {
          const day = addDays(weekStart, index);
          return (
            <View key={index} className="items-center">
              {/* <Text className="text-gray-400">{format(day, "d")}</Text> */}
              <View
                className={`mt-1 p-2 rounded-full ${
                  format(day, "d") === format(today, "d")
                    ? "bg-white"
                    : "bg-transparent"
                }`}
              >
                <Text
                  className={`${
                    format(day, "d") === format(today, "d")
                      ? "text-black font-bold"
                      : "text-white"
                  }`}
                >
                  {format(day, "d")}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <View className="bg-indigo-900 p-4 rounded-lg flex-row justify-center items-center mb-6">
        <TouchableOpacity
          onPress={toggleSleepWake}
          className={`w-1/2 p-3 rounded-full flex items-center ${
            !isAwake ? "bg-white" : "bg-transparent"
          }`}
        >
          <Text
            className={`text-lg ${
              !isAwake ? "text-black font-bold" : "text-gray-400"
            }`}
          >
            Sleep
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={toggleSleepWake}
          className={`w-1/2 p-3 rounded-full flex items-center ${
            isAwake ? "bg-white" : "bg-transparent"
          }`}
        >
          <Text
            className={`text-lg ${
              isAwake ? "text-black font-bold" : "text-gray-400"
            }`}
          >
            Wake up
          </Text>
        </TouchableOpacity>
      </View>

      <View className="bg-gray-900 p-6 rounded-lg mb-6">
        <Text className="text-gray-400 text-sm text-center">Quality</Text>
        <Text className="text-white text-xl font-bold text-center mb-2">
          Upcoming
        </Text>
        <Text className="text-gray-400 text-center mb-4">
          Use the sleep tracking 3 times and see how you slept!
        </Text>

        <View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-white">Net sleep time</Text>
            <Text className="text-gray-400">1st diagnosis </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-white">Sleep efficiency</Text>
            <Text className="text-gray-400">2nd diagnosis </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-white">Snore</Text>
            <Text className="text-gray-400">3rd diagnosis </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity className="bg-indigo-600 p-4 rounded-lg">
        <Text className="text-white text-lg text-center font-bold">
          Track my sleep
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Report;
