import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AlarmScreen from "./screens/AlarmScreen";
import SleepScreen from "./screens/SleepScreen";
import MorningScreen from "./screens/MorningScreen";
import SettingsScreen from "./screens/Settings";
import Report from "./screens/Report";
import AlarmService from "./components/AlarmService";

const Tab = createBottomTabNavigator();

const MainScreen = () => {
  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Alarm") {
              iconName = focused ? "alarm" : "alarm-outline";
            } else if (route.name === "Sleep") {
              iconName = focused ? "moon" : "moon-outline";
            } else if (route.name === "Morning") {
              iconName = focused ? "sunny" : "sunny-outline";
            } else if (route.name === "Settings") {
              iconName = focused ? "settings" : "settings-outline";
            } else if (route.name === "Report") {
              iconName = focused ? "document" : "document-outline";
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#E53935",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: { backgroundColor: "blue", paddingBottom: 5 },
        })}
      >
        <Tab.Screen name="Alarm" component={AlarmScreen} />
        <Tab.Screen name="Sleep" component={SleepScreen} />
        <Tab.Screen name="Report" component={Report} />
        <Tab.Screen name="Morning" component={MorningScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>

      <AlarmService />
    </>
  );
};

export default MainScreen;
