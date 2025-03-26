import { View, Text, Switch, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";

const SleepScreen = () => {
  const [isReminderOn, setIsReminderOn] = useState(false);

  return (
    <View className="flex-1 gap-6 bg-[#121212] p-5">
      <Text className="text-white p-3 text-3xl mt-4 mb-3">
        Track your Sleep
      </Text>
      <View className="bg-[#1e1e1e] p-4 rounded-lg">
        <Text className="text-white text-lg mb-1">Bedtime reminder</Text>
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-400 text-lg">11:30 PM</Text>
          <Switch
            value={isReminderOn}
            onValueChange={() => setIsReminderOn(!isReminderOn)}
            thumbColor={isReminderOn ? "#4a90e2" : "#bbb"}
          />
        </View>
      </View>

      <View className="bg-[#1e1e1e] p-5 rounded-lg mt-5">
        <Text className="text-white text-xl font-bold text-center">
          You're not taking as much sleep as you think
        </Text>
        <Text className="text-gray-400 text-center mt-2">
          Is my actual sleep time enough?
        </Text>

        <View className="items-center my-5">
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/763/763812.png",
            }}
            className="w-20 h-20 tint-gray-400"
          />
        </View>

        <TouchableOpacity className="bg-blue-500 p-4 rounded-lg">
          <Text className="text-white text-lg text-center">Track my sleep</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SleepScreen;
