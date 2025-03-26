import React, { useEffect, useState } from "react";
import { View, AppState, Text, Alert, Vibration } from "react-native";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import MissionModal from "./MissionModal";
import { playSound, stopSound, isAudioPlaying } from "../utils/AudioManager";

const AlarmService = () => {
  const [showMission, setShowMission] = useState(false);
  const [currentAlarm, setCurrentAlarm] = useState(null);
  const [alarmInterval, setAlarmInterval] = useState(null);
  const [appState, setAppState] = useState(AppState.currentState);

  console.log("AlarmService mounted");

  useEffect(() => {
    // Set up the AppState listener
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Check for alarms immediately on mount
    checkForAlarms();

    // Set up interval to check for alarms every minute
    const interval = setInterval(checkForAlarms, 60000);
    setAlarmInterval(interval);

    // Clean up
    return () => {
      console.log("AlarmService unmounting");
      clearInterval(interval);
      subscription.remove();

      // Ensure any playing sound is stopped when component unmounts
      if (isAudioPlaying()) {
        console.log("Stopping sound on unmount");
        stopSound();
      }

      // Cancel any vibrations
      Vibration.cancel();
    };
  }, []);

  // Handle app state changes
  const handleAppStateChange = (nextAppState) => {
    if (appState.match(/inactive|background/) && nextAppState === "active") {
      console.log("App returned to foreground, checking alarms");
      checkForAlarms();
    }
    setAppState(nextAppState);
  };

  // Function to check for enabled alarms
  const checkForAlarms = async () => {
    if (!auth.currentUser) {
      console.log("No current user, skipping alarm check");
      return;
    }

    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentDay = now.getDay();
      const dayNames = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const currentDayName = dayNames[currentDay];

      console.log(
        `Checking alarms at ${currentHour}:${currentMinute} on ${currentDayName}`
      );

      // Query for enabled alarms for the current user
      const alarmsRef = collection(db, "alarms");
      const q = query(
        alarmsRef,
        where("enabled", "==", true),
        where("userId", "==", auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log("No alarms found for current user");
        return;
      }

      console.log(
        `Found ${querySnapshot.size} enabled alarms, checking times...`
      );

      // Check each alarm
      querySnapshot.forEach((docSnap) => {
        const alarm = docSnap.data();
        const alarmId = docSnap.id;

        // Check if alarm is set for today or is a one-time alarm with no days set
        const isOneTimeAlarm =
          !alarm.days || !Object.values(alarm.days).some((day) => day);

        if (isOneTimeAlarm || (alarm.days && alarm.days[currentDayName])) {
          // Parse alarm time
          const alarmTime = new Date(alarm.timestamp.toDate());
          const alarmHour = alarmTime.getHours();
          const alarmMinute = alarmTime.getMinutes();

          console.log(
            `Checking alarm ${alarmId}: set for ${alarmHour}:${alarmMinute}, current time: ${currentHour}:${currentMinute}`
          );

          // Check if alarm time matches current time (within a 1-minute window)
          if (alarmHour === currentHour && alarmMinute === currentMinute) {
            console.log(`Alarm ${alarmId} triggered!`);
            // Trigger alarm
            triggerAlarm({
              id: alarmId,
              ...alarm,
            });
          }
        }
      });
    } catch (error) {
      console.error("Error checking alarms:", error);
    }
  };

  // Function to trigger an alarm
  const triggerAlarm = async (alarm) => {
    console.log("Triggering alarm:", alarm);

    // Clean up any existing intervals
    if (alarmInterval) {
      clearInterval(alarmInterval);
    }

    // Set current alarm
    setCurrentAlarm(alarm);

    // Play sound and vibration
    try {
      // Start vibration pattern
      const PATTERN = [1000, 2000, 3000];
      Vibration.vibrate(PATTERN, true);

      // Play alarm sound
      const sound = await playSound();
      console.log("Alarm sound playing:", sound ? "Yes" : "No");

      // Show the mission modal
      setShowMission(true);
    } catch (error) {
      console.error("Error triggering alarm:", error);
      Alert.alert(
        "Alarm Error",
        "There was a problem playing the alarm sound."
      );
    }

    // If it's a one-time alarm, mark it as triggered
    if (!alarm.days || !Object.values(alarm.days).some((day) => day)) {
      try {
        await updateDoc(doc(db, "alarms", alarm.id), {
          triggered: true,
        });
      } catch (error) {
        console.error("Error updating alarm triggered status:", error);
      }
    }
  };

  // Function to handle mission completion
  const onMissionComplete = async () => {
    console.log("Mission completed, stopping alarm");

    // Stop sound
    try {
      await stopSound();
    } catch (error) {
      console.error("Error stopping sound:", error);
    }

    // Cancel vibration
    Vibration.cancel();

    // Hide mission modal
    setShowMission(false);

    // If it's a one-time alarm, disable it
    if (
      currentAlarm &&
      (!currentAlarm.days ||
        !Object.values(currentAlarm.days).some((day) => day))
    ) {
      try {
        await updateDoc(doc(db, "alarms", currentAlarm.id), {
          enabled: false,
        });
        console.log("One-time alarm disabled");
      } catch (error) {
        console.error("Error disabling one-time alarm:", error);
      }
    }

    // Reset current alarm
    setCurrentAlarm(null);

    // Restart the interval for checking alarms
    const interval = setInterval(checkForAlarms, 60000);
    setAlarmInterval(interval);
  };

  return (
    <View>
      {showMission && currentAlarm && (
        <MissionModal
          isVisible={showMission}
          missionType={currentAlarm.mission || "math"}
          onComplete={onMissionComplete}
        />
      )}
    </View>
  );
};

export default AlarmService;
