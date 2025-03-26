import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import CustomTimePicker from "../components/CustomTimePicker";

const AlarmDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { alarmId } = route.params || {};
  const [alarm, setAlarm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlarmDetails = async () => {
      if (!alarmId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const alarmDoc = await getDoc(doc(db, "alarms", alarmId));

        if (alarmDoc.exists()) {
          setAlarm({ id: alarmDoc.id, ...alarmDoc.data() });
        } else {
          Alert.alert("Error", "Alarm not found");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error fetching alarm:", error);
        Alert.alert("Error", "Failed to load alarm details");
      } finally {
        setLoading(false);
      }
    };

    fetchAlarmDetails();
  }, [alarmId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  if (!alarm) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No alarm data available</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Format time for display
  const formatTime = (timestamp) => {
    if (!timestamp) return "Unknown time";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get day names that are enabled
  const getActiveDays = () => {
    if (!alarm.days) return "One-time alarm";

    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const activeDays = days.filter((day) => alarm.days[day]);

    if (activeDays.length === 0) return "One-time alarm";
    if (activeDays.length === 7) return "Every day";

    return activeDays
      .map((day) => day.charAt(0).toUpperCase() + day.slice(1, 3))
      .join(", ");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alarm Details</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(alarm.timestamp)}</Text>
          <Text style={styles.daysText}>{getActiveDays()}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <MaterialIcons name="label" size={24} color="#E53935" />
            <Text style={styles.detailText}>{alarm.label || "No label"}</Text>
          </View>

          <View style={styles.detailItem}>
            <MaterialIcons name="fitness-center" size={24} color="#E53935" />
            <Text style={styles.detailText}>
              {alarm.mission === "math" || alarm.mission === "slider"
                ? "Math Problem"
                : "Typing Test"}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <MaterialIcons
              name={alarm.enabled ? "toggle-on" : "toggle-off"}
              size={24}
              color={alarm.enabled ? "#4CAF50" : "#757575"}
            />
            <Text style={styles.detailText}>
              {alarm.enabled ? "Enabled" : "Disabled"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate("Alarm")}
        >
          <Text style={styles.editButtonText}>Edit in Alarms Screen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#1f1f1f",
  },
  backButton: {
    marginRight: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  timeContainer: {
    alignItems: "center",
    marginVertical: 40,
  },
  timeText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#E53935",
  },
  daysText: {
    fontSize: 16,
    color: "#aaa",
    marginTop: 10,
  },
  detailsContainer: {
    backgroundColor: "#1f1f1f",
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  detailText: {
    fontSize: 16,
    color: "white",
    marginLeft: 15,
  },
  editButton: {
    backgroundColor: "#E53935",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  editButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  backButtonText: {
    color: "#E53935",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default AlarmDetail;
