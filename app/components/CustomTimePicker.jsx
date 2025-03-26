import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";

const CustomTimePicker = ({ selectedTime = new Date(), onTimeChange }) => {
  const [hours, setHours] = useState(selectedTime.getHours());
  const [minutes, setMinutes] = useState(selectedTime.getMinutes());
  const [ampm, setAmPm] = useState(selectedTime.getHours() >= 12 ? "PM" : "AM");

  useEffect(() => {
    if (selectedTime) {
      setHours(selectedTime.getHours());
      setMinutes(selectedTime.getMinutes());
      setAmPm(selectedTime.getHours() >= 12 ? "PM" : "AM");
    }
  }, [selectedTime]);

  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  const minuteOptions = Array.from({ length: 60 }, (_, i) =>
    i < 10 ? `0${i}` : `${i}`
  );

  const handleHourChange = (hour) => {
    let newHour = parseInt(hour);
    if (ampm === "PM" && newHour !== 12) {
      newHour += 12;
    } else if (ampm === "AM" && newHour === 12) {
      newHour = 0;
    }

    setHours(newHour);

    const newTime = new Date(selectedTime || new Date());
    newTime.setHours(newHour);
    onTimeChange(newTime);
  };

  const handleMinuteChange = (minute) => {
    const newMinute = parseInt(minute);
    setMinutes(newMinute);

    const newTime = new Date(selectedTime || new Date());
    newTime.setMinutes(newMinute);
    onTimeChange(newTime);
  };

  const handleAmPmChange = (value) => {
    setAmPm(value);

    let newHour = hours;
    if (value === "PM" && hours < 12) {
      newHour = hours + 12;
    } else if (value === "AM" && hours >= 12) {
      newHour = hours - 12;
    }

    setHours(newHour);

    const newTime = new Date(selectedTime || new Date());
    newTime.setHours(newHour);
    onTimeChange(newTime);
  };

  const getDisplayHour = () => {
    if (hours === 0) return 12;
    if (hours > 12) return hours - 12;
    return hours;
  };

  return (
    <View className="bg-gray-700 rounded-lg p-4 mt-2">
      <View className="flex-row justify-center items-center">
        <View className="w-1/4 items-center">
          <Text className="text-gray-400 mb-2">Hour</Text>
          <ScrollView
            className="h-40 bg-gray-800 rounded-lg"
            showsVerticalScrollIndicator={false}
          >
            {hourOptions.map((hour) => (
              <TouchableOpacity
                key={`hour-${hour}`}
                className={`py-3 px-5 ${
                  getDisplayHour() === hour ? "bg-red-600" : ""
                }`}
                onPress={() => handleHourChange(hour)}
              >
                <Text className="text-white text-xl">{hour}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Text className="text-white text-3xl mx-2">:</Text>

        <View className="w-1/4 items-center">
          <Text className="text-gray-400 mb-2">Minute</Text>
          <ScrollView
            className="h-40 bg-gray-800 rounded-lg"
            showsVerticalScrollIndicator={false}
          >
            {minuteOptions.map((minute) => (
              <TouchableOpacity
                key={`minute-${minute}`}
                className={`py-3 px-5 ${
                  minutes === parseInt(minute) ? "bg-red-600" : ""
                }`}
                onPress={() => handleMinuteChange(minute)}
              >
                <Text className="text-white text-xl">{minute}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="w-1/4 items-center ml-4">
          <Text className="text-gray-400 mb-2">AM/PM</Text>
          <View className="bg-gray-800 rounded-lg overflow-hidden">
            <TouchableOpacity
              className={`py-3 px-6 ${ampm === "AM" ? "bg-red-600" : ""}`}
              onPress={() => handleAmPmChange("AM")}
            >
              <Text className="text-white text-xl">AM</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`py-3 px-6 ${ampm === "PM" ? "bg-red-600" : ""}`}
              onPress={() => handleAmPmChange("PM")}
            >
              <Text className="text-white text-xl">PM</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="mt-4 items-center">
        <Text className="text-white text-2xl">
          {getDisplayHour()}:{minutes < 10 ? `0${minutes}` : minutes} {ampm}
        </Text>
      </View>
    </View>
  );
};

export default CustomTimePicker;
