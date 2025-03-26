import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const DAYS_OF_WEEK = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

const MISSION_TYPES = [
  { id: "math", label: "Math Problem" },
  { id: "typing", label: "Typing Challenge" },
];

const EditAlarm = ({ route, navigation }) => {
  const { alarm } = route.params;
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [alarmTime, setAlarmTime] = useState(new Date(alarm.time));
  const [days, setDays] = useState(
    alarm.days || {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    }
  );
  const [label, setLabel] = useState(alarm.label || "");
  const [enabled, setEnabled] = useState(alarm.enabled);
  const [missionType, setMissionType] = useState(alarm.mission || "math");

  useEffect(() => {
    navigation.setOptions({
      title: "Edit Alarm",
      headerRight: () => (
        <TouchableOpacity style={{ marginRight: 16 }} onPress={saveAlarm}>
          <Text style={{ color: "#007AFF", fontSize: 17, fontWeight: "600" }}>
            Save
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [alarmTime, days, label, enabled, missionType]);

  const showTimePicker = () => {
    setTimePickerVisible(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisible(false);
  };

  const handleTimeConfirm = (time) => {
    setAlarmTime(time);
    hideTimePicker();
  };

  const toggleDay = (dayId) => {
    setDays((prevDays) => ({
      ...prevDays,
      [dayId]: !prevDays[dayId],
    }));
  };

  const selectMissionType = (type) => {
    setMissionType(type);
  };

  const saveAlarm = async () => {
    try {
      // Check if at least one day is selected for repeating alarms
      const anyDaySelected = Object.values(days).some((day) => day);

      await updateDoc(doc(db, "alarms", alarm.id), {
        timestamp: Timestamp.fromDate(alarmTime),
        days,
        label,
        enabled,
        mission: missionType,
        updated: Timestamp.now(),
      });

      navigation.goBack();
    } catch (error) {
      console.error("Error saving alarm:", error);
      Alert.alert("Error", "Failed to save alarm");
    }
  };

  // Format time for display
  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedHours = hours % 12 || 12;
    const ampm = hours >= 12 ? "PM" : "AM";
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Time Section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.timeSelector} onPress={showTimePicker}>
          <Text style={styles.timeText}>{formatTime(alarmTime)}</Text>
        </TouchableOpacity>
      </View>

      {/* Repeat Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Repeat</Text>
        {DAYS_OF_WEEK.map((day) => (
          <TouchableOpacity
            key={day.id}
            style={styles.row}
            onPress={() => toggleDay(day.id)}
          >
            <Text style={styles.dayText}>{day.label}</Text>
            <Switch
              value={days[day.id] || false}
              onValueChange={() => toggleDay(day.id)}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={days[day.id] ? "#f5dd4b" : "#f4f3f4"}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Label Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Label</Text>
        <TextInput
          style={styles.input}
          value={label}
          onChangeText={setLabel}
          placeholder="Alarm name (optional)"
          placeholderTextColor="#999"
        />
      </View>

      {/* Mission Type Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mission Type</Text>
        {MISSION_TYPES.map((mission) => (
          <TouchableOpacity
            key={mission.id}
            style={styles.row}
            onPress={() => selectMissionType(mission.id)}
          >
            <Text style={styles.missionText}>{mission.label}</Text>
            <View
              style={[
                styles.radioOuter,
                missionType === mission.id && styles.radioOuterSelected,
              ]}
            >
              {missionType === mission.id && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Enabled Section */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.enabledText}>Alarm enabled</Text>
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={enabled ? "#f5dd4b" : "#f4f3f4"}
          />
        </View>
      </View>

      <DateTimePickerModal
        isVisible={timePickerVisible}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={hideTimePicker}
        date={alarmTime}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  section: {
    backgroundColor: "white",
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  timeSelector: {
    alignItems: "center",
    paddingVertical: 20,
  },
  timeText: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#007AFF",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dayText: {
    fontSize: 16,
    color: "#333",
  },
  missionText: {
    fontSize: 16,
    color: "#333",
  },
  enabledText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  input: {
    fontSize: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    color: "#333",
  },
  radioOuter: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: "#007AFF",
  },
  radioInner: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: "#007AFF",
  },
});

export default EditAlarm;
