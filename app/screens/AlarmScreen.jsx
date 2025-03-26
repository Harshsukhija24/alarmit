import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  MaterialIcons,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import CustomTimePicker from "../components/CustomTimePicker";
import { initializeAudioDirectory } from "../utils/AudioManager";

const AlarmScreen = () => {
  const navigation = useNavigation();
  const [alarms, setAlarms] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAlarmId, setCurrentAlarmId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newAlarm, setNewAlarm] = useState({
    time: new Date(),
    repeat: {
      sun: false,
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
    },
    mission: "math", // Default mission type
    label: "",
    enabled: true,
  });

  // Initialize audio directory on component mount
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        await initializeAudioDirectory();
      } catch (error) {
        console.error("Error initializing:", error);
        Alert.alert("Error", "Failed to initialize application");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) {
      return; // Not logged in
    }

    // Set up listener for alarms
    const alarmsRef = collection(db, "alarms");
    const q = query(alarmsRef, where("userId", "==", auth.currentUser.uid));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const alarmsData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const alarm = {
            id: doc.id,
            ...data,
            // Convert Firestore Timestamp to JS Date for display
            time: data.timestamp ? data.timestamp.toDate() : new Date(),
          };
          alarmsData.push(alarm);
        });

        // Sort alarms by time
        alarmsData.sort((a, b) => a.time - b.time);
        setAlarms(alarmsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching alarms:", error);
        Alert.alert("Error", "Failed to load alarms");
        setLoading(false);
      }
    );

    // Clean up the listener on unmount
    return () => unsubscribe();
  }, []);

  // Handle time selection
  const handleTimeChange = (selectedTime) => {
    setNewAlarm({ ...newAlarm, time: selectedTime });
  };

  // Toggle day selection
  const toggleDay = (day) => {
    setNewAlarm({
      ...newAlarm,
      repeat: {
        ...newAlarm.repeat,
        [day]: !newAlarm.repeat[day],
      },
    });
  };

  // Format days for display
  const formatDays = (days) => {
    if (!days) return "One time";

    const dayInitials = {
      sunday: "S",
      monday: "M",
      tuesday: "T",
      wednesday: "W",
      thursday: "T",
      friday: "F",
      saturday: "S",
    };

    const selectedDays = Object.entries(days)
      .filter(([_, selected]) => selected)
      .map(([day, _]) => dayInitials[day] || "");

    return selectedDays.length > 0 ? selectedDays.join(" ") : "One time";
  };

  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Reset form to default values
  const resetForm = () => {
    setNewAlarm({
      time: new Date(),
      repeat: {
        sun: false,
        mon: false,
        tue: false,
        wed: false,
        thu: false,
        fri: false,
        sat: false,
      },
      mission: "math",
      label: "",
      enabled: true,
    });
    setEditMode(false);
    setCurrentAlarmId(null);
  };

  // Save alarm to Firestore
  const saveAlarm = async () => {
    try {
      setLoading(true);

      if (!auth.currentUser) {
        Alert.alert("Error", "You must be logged in to create an alarm");
        return;
      }

      // Convert repeat object to days object for Firestore
      const days = {
        monday: newAlarm.repeat.mon,
        tuesday: newAlarm.repeat.tue,
        wednesday: newAlarm.repeat.wed,
        thursday: newAlarm.repeat.thu,
        friday: newAlarm.repeat.fri,
        saturday: newAlarm.repeat.sat,
        sunday: newAlarm.repeat.sun,
      };

      if (editMode && currentAlarmId) {
        // Update existing alarm
        await updateDoc(doc(db, "alarms", currentAlarmId), {
          timestamp: Timestamp.fromDate(newAlarm.time),
          days,
          mission: newAlarm.mission,
          label: newAlarm.label,
          enabled: newAlarm.enabled,
          updated: Timestamp.now(),
        });

        Alert.alert("Success", "Alarm updated successfully");
      } else {
        // Create new alarm
        await addDoc(collection(db, "alarms"), {
          userId: auth.currentUser.uid,
          timestamp: Timestamp.fromDate(newAlarm.time),
          days,
          mission: newAlarm.mission,
          label: newAlarm.label || "Alarm",
          enabled: newAlarm.enabled,
          created: Timestamp.now(),
          updated: Timestamp.now(),
          triggered: false,
        });

        Alert.alert("Success", "Alarm created successfully");
      }

      // Close modal and reset form
      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error("Error saving alarm:", error);
      Alert.alert("Error", "Failed to save alarm");
    } finally {
      setLoading(false);
    }
  };

  // Delete alarm
  const deleteAlarm = async (id) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, "alarms", id));
      setLoading(false);
    } catch (error) {
      console.error("Error deleting alarm:", error);
      Alert.alert("Error", "Failed to delete alarm");
      setLoading(false);
    }
  };

  // Open edit modal for an alarm
  const editAlarm = (alarm) => {
    // Convert alarm data to the format needed for editing
    const repeat = {
      mon: alarm.days?.monday || false,
      tue: alarm.days?.tuesday || false,
      wed: alarm.days?.wednesday || false,
      thu: alarm.days?.thursday || false,
      fri: alarm.days?.friday || false,
      sat: alarm.days?.saturday || false,
      sun: alarm.days?.sunday || false,
    };

    setNewAlarm({
      time: new Date(alarm.time),
      repeat,
      mission: alarm.mission || "math",
      label: alarm.label || "",
      enabled: alarm.enabled,
    });

    setEditMode(true);
    setCurrentAlarmId(alarm.id);
    setModalVisible(true);
  };

  // Cancel editing
  const cancelEdit = () => {
    resetForm();
    setModalVisible(false);
  };

  // Toggle alarm enabled state
  const toggleAlarmEnabled = async (alarm) => {
    try {
      await updateDoc(doc(db, "alarms", alarm.id), {
        enabled: !alarm.enabled,
        updated: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error toggling alarm:", error);
      Alert.alert("Error", "Failed to update alarm");
    }
  };

  // Confirm before deleting alarm
  const confirmDelete = (alarm) => {
    Alert.alert("Delete Alarm", "Are you sure you want to delete this alarm?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteAlarm(alarm.id),
      },
    ]);
  };

  return (
    <View className="flex-1 bg-zinc-900">
      {/* Header */}
      <View className="flex-row justify-between items-center py-4 px-5 bg-zinc-800">
        <Text className="text-2xl font-bold text-white">Alarms</Text>
        <TouchableOpacity
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <MaterialIcons name="add" size={30} color="#E53935" />
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-black/50 z-50">
          <ActivityIndicator size="large" color="#E53935" />
        </View>
      )}

      {/* Alarms List */}
      {alarms.length > 0 ? (
        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-zinc-800 mx-4 mt-4 rounded-xl p-4 flex-row justify-between items-center"
              onPress={() => editAlarm(item)}
            >
              <View>
                <Text
                  className={`text-3xl font-bold ${
                    item.enabled ? "text-white" : "text-gray-500"
                  }`}
                >
                  {formatTime(new Date(item.time))}
                </Text>
                <Text
                  className={`${
                    item.enabled ? "text-gray-300" : "text-gray-500"
                  } mt-1`}
                >
                  {item.label || "Alarm"} • {formatDays(item.days || {})}
                </Text>
                <View className="flex-row items-center mt-1">
                  <MaterialIcons
                    name={item.mission === "math" ? "calculate" : "keyboard"}
                    size={16}
                    color={item.enabled ? "#E53935" : "#888"}
                    style={{ marginRight: 5 }}
                  />
                  <Text
                    className={`${
                      item.enabled ? "text-red-500" : "text-gray-500"
                    } font-medium`}
                  >
                    {item.mission === "math" ? "Math Problem" : "Typing Test"}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => confirmDelete(item)}
                  className="mr-3"
                >
                  <MaterialIcons name="delete" size={24} color="#888" />
                </TouchableOpacity>
                <Switch
                  value={item.enabled}
                  onValueChange={() => toggleAlarmEnabled(item)}
                  trackColor={{ false: "#767577", true: "#E53935" }}
                  thumbColor={item.enabled ? "#f4f3f4" : "#f4f3f4"}
                />
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View className="flex-1 justify-center items-center px-8">
          <MaterialCommunityIcons
            name="alarm-off"
            size={80}
            color="#888"
            className="mb-5"
          />
          <Text className="text-gray-400 text-lg text-center">
            No alarms set. Tap the + button to create your first alarm.
          </Text>
        </View>
      )}

      {/* Add/Edit Alarm Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={cancelEdit}
      >
        <View className="flex-1 bg-zinc-900">
          {/* Modal Header */}
          <View className="flex-row justify-between items-center py-4 px-5 bg-zinc-800">
            <TouchableOpacity onPress={cancelEdit}>
              <Text className="text-gray-400 text-base">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-bold text-white">
              {editMode ? "Edit Alarm" : "Add Alarm"}
            </Text>
            <TouchableOpacity onPress={saveAlarm}>
              <Text className="text-red-500 text-base">Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="p-5">
            {/* Time Picker */}
            <View className="items-center mb-8 p-5 bg-zinc-800 rounded-xl">
              <CustomTimePicker
                selectedTime={newAlarm.time}
                onTimeChange={handleTimeChange}
              />
            </View>

            {/* Repeat Section */}
            <View className="bg-zinc-800 mb-5 rounded-xl p-4">
              <Text className="text-white text-lg font-bold mb-4">Repeat</Text>
              <View className="flex-row justify-between">
                {[
                  { key: "sun", label: "S" },
                  { key: "mon", label: "M" },
                  { key: "tue", label: "T" },
                  { key: "wed", label: "W" },
                  { key: "thu", label: "T" },
                  { key: "fri", label: "F" },
                  { key: "sat", label: "S" },
                ].map((day) => (
                  <TouchableOpacity
                    key={day.key}
                    className={`w-9 h-9 rounded-full justify-center items-center border ${
                      newAlarm.repeat[day.key]
                        ? "bg-red-600 border-red-600"
                        : "border-gray-500"
                    }`}
                    onPress={() => toggleDay(day.key)}
                  >
                    <Text
                      className={
                        newAlarm.repeat[day.key]
                          ? "text-white"
                          : "text-gray-500"
                      }
                    >
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Label Section */}
            <View className="bg-zinc-800 mb-5 rounded-xl p-4">
              <Text className="text-white text-lg font-bold mb-4">Label</Text>
              <TextInput
                className="bg-zinc-700 rounded-lg p-3 text-white"
                placeholder="Alarm name (optional)"
                placeholderTextColor="#888"
                value={newAlarm.label}
                onChangeText={(text) =>
                  setNewAlarm({ ...newAlarm, label: text })
                }
              />
            </View>

            {/* Mission Type Section */}
            <View className="bg-zinc-800 mb-5 rounded-xl p-4">
              <Text className="text-white text-lg font-bold mb-4">
                Mission Type
              </Text>
              <View className="flex-row flex-wrap">
                {/* Math Mission */}
                <TouchableOpacity
                  className={`flex-row items-center ${
                    newAlarm.mission === "math"
                      ? "bg-zinc-700"
                      : "bg-transparent"
                  } rounded-lg p-3 mr-2 mb-2 flex-1 min-w-[45%]`}
                  onPress={() => setNewAlarm({ ...newAlarm, mission: "math" })}
                >
                  <MaterialIcons
                    name="calculate"
                    size={24}
                    color={newAlarm.mission === "math" ? "#E53935" : "#888"}
                    style={{ marginRight: 10 }}
                  />
                  <View>
                    <Text className="text-white font-bold">Math Problem</Text>
                    <Text className="text-gray-500 text-xs">
                      Solve a simple math problem
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Typing Mission */}
                <TouchableOpacity
                  className={`flex-row items-center ${
                    newAlarm.mission === "typing"
                      ? "bg-zinc-700"
                      : "bg-transparent"
                  } rounded-lg p-3 mr-2 mb-2 flex-1 min-w-[45%]`}
                  onPress={() =>
                    setNewAlarm({ ...newAlarm, mission: "typing" })
                  }
                >
                  <MaterialIcons
                    name="keyboard"
                    size={24}
                    color={newAlarm.mission === "typing" ? "#E53935" : "#888"}
                    style={{ marginRight: 10 }}
                  />
                  <View>
                    <Text className="text-white font-bold">Typing Test</Text>
                    <Text className="text-gray-500 text-xs">
                      Type a phrase correctly
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default AlarmScreen;
