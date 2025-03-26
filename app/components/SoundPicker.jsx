import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Alert,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import {
  getAllSounds,
  saveCustomSound,
  deleteCustomSound,
  playSound,
  stopSound,
} from "../utils/AudioManager";

const SoundPicker = ({ selectedSound, onSoundChange }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [sounds, setSounds] = useState({ predefined: [], custom: [] });
  const [playingSound, setPlayingSound] = useState(null);
  const [customSoundName, setCustomSoundName] = useState("");
  const [addCustomModalVisible, setAddCustomModalVisible] = useState(false);
  const [selectedUri, setSelectedUri] = useState(null);

  // Load available sounds on component mount
  useEffect(() => {
    loadSounds();
    return () => {
      // Clean up any playing sounds when component unmounts
      if (playingSound) {
        stopSound(playingSound);
      }
    };
  }, []);

  // Load all available sounds
  const loadSounds = async () => {
    const allSounds = await getAllSounds();
    setSounds(allSounds);
  };

  // Play a sound sample
  const handlePlaySound = async (sound, isCustom = false) => {
    // Stop previously playing sound if exists
    if (playingSound) {
      await stopSound(playingSound);
      setPlayingSound(null);
    }

    // Play the selected sound
    const soundName = isCustom ? sound : sound; // for custom sounds, the full filename is passed
    const soundObj = await playSound(soundName);
    if (soundObj) {
      setPlayingSound(soundObj);

      // Stop automatically after 3 seconds for the preview
      setTimeout(async () => {
        if (soundObj) {
          await stopSound(soundObj);
          setPlayingSound(null);
        }
      }, 3000);
    }
  };

  // Select a sound
  const handleSelectSound = (sound, isCustom = false) => {
    // Stop any playing sound
    if (playingSound) {
      stopSound(playingSound);
      setPlayingSound(null);
    }

    onSoundChange(isCustom ? `custom:${sound}` : sound);
    setModalVisible(false);
  };

  // Delete a custom sound
  const handleDeleteCustomSound = async (soundName) => {
    Alert.alert(
      "Delete Sound",
      `Are you sure you want to delete "${soundName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const success = await deleteCustomSound(soundName);
            if (success) {
              await loadSounds();
              Alert.alert("Success", "Sound deleted successfully");
            }
          },
        },
      ]
    );
  };

  // Pick a custom sound file
  const pickCustomSound = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["audio/mpeg", "audio/mp3", "audio/wav"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      // Get the first selected asset
      const asset = result.assets[0];
      setSelectedUri(asset.uri);

      // Extract filename from URI
      const fileName = asset.name || "custom_sound.mp3";
      setCustomSoundName(fileName.replace(/\.[^/.]+$/, "")); // Remove extension
      setAddCustomModalVisible(true);
    } catch (error) {
      console.error("Error picking sound:", error);
      Alert.alert("Error", "Failed to pick sound file");
    }
  };

  // Save the picked custom sound
  const saveCustomSoundFile = async () => {
    if (!customSoundName) {
      Alert.alert("Error", "Please enter a name for the sound");
      return;
    }

    if (!selectedUri) {
      Alert.alert("Error", "No sound file selected");
      return;
    }

    const formattedName = customSoundName.trim().replace(/\s+/g, "_") + ".mp3";
    const savedFileName = await saveCustomSound(selectedUri, formattedName);

    if (savedFileName) {
      await loadSounds();
      setAddCustomModalVisible(false);
      setCustomSoundName("");
      setSelectedUri(null);
      Alert.alert("Success", "Custom sound added successfully");
    }
  };

  // Format the display name for a sound
  const formatSoundName = (sound, isCustom = false) => {
    if (isCustom) {
      // Remove extension and replace underscores with spaces
      return sound.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
    }
    // Capitalize the first letter of predefined sounds
    return sound.charAt(0).toUpperCase() + sound.slice(1);
  };

  // Get the currently selected sound name for display
  const getSelectedSoundName = () => {
    if (selectedSound.startsWith("custom:")) {
      const customSound = selectedSound.replace("custom:", "");
      return formatSoundName(customSound, true);
    }
    return formatSoundName(selectedSound);
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="bg-gray-700 p-3 rounded-lg mt-1"
      >
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-lg">{getSelectedSoundName()}</Text>
          <MaterialIcons name="arrow-drop-down" size={24} color="white" />
        </View>
      </TouchableOpacity>

      {/* Sound Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-gray-800 p-5 rounded-lg w-11/12 max-h-5/6">
            <Text className="text-white text-xl font-bold mb-4">
              Select Alarm Sound
            </Text>

            {/* Predefined Sounds Section */}
            <Text className="text-gray-400 text-lg mb-2">Default Sounds</Text>
            <FlatList
              data={sounds.predefined}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <View className="flex-row items-center justify-between py-3 border-b border-gray-700">
                  <TouchableOpacity
                    onPress={() => handleSelectSound(item)}
                    className="flex-1"
                  >
                    <Text
                      className={`text-white text-lg ${
                        selectedSound === item ? "font-bold" : ""
                      }`}
                    >
                      {formatSoundName(item)}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handlePlaySound(item)}
                    className="bg-gray-700 p-2 rounded-full mr-2"
                  >
                    <MaterialIcons name="play-arrow" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              )}
              className="mb-4"
            />

            {/* Custom Sounds Section */}
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-400 text-lg">Custom Sounds</Text>
              <TouchableOpacity
                onPress={pickCustomSound}
                className="bg-red-600 py-1 px-3 rounded-lg"
              >
                <Text className="text-white">Add Sound</Text>
              </TouchableOpacity>
            </View>

            {sounds.custom.length > 0 ? (
              <FlatList
                data={sounds.custom}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <View className="flex-row items-center justify-between py-3 border-b border-gray-700">
                    <TouchableOpacity
                      onPress={() => handleSelectSound(item, true)}
                      className="flex-1"
                    >
                      <Text
                        className={`text-white text-lg ${
                          selectedSound === `custom:${item}` ? "font-bold" : ""
                        }`}
                      >
                        {formatSoundName(item, true)}
                      </Text>
                    </TouchableOpacity>

                    <View className="flex-row">
                      <TouchableOpacity
                        onPress={() => handlePlaySound(item, true)}
                        className="bg-gray-700 p-2 rounded-full mr-2"
                      >
                        <MaterialIcons
                          name="play-arrow"
                          size={20}
                          color="white"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDeleteCustomSound(item)}
                        className="bg-gray-700 p-2 rounded-full"
                      >
                        <MaterialIcons
                          name="delete"
                          size={20}
                          color="#EF4444"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            ) : (
              <Text className="text-gray-500 py-4 text-center">
                No custom sounds added
              </Text>
            )}

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="bg-gray-700 py-3 rounded-lg mt-4 items-center"
            >
              <Text className="text-white font-bold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Custom Sound Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addCustomModalVisible}
        onRequestClose={() => setAddCustomModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-gray-800 p-5 rounded-lg w-11/12">
            <Text className="text-white text-xl font-bold mb-4">
              Name Your Sound
            </Text>

            <TextInput
              className="bg-gray-700 text-white p-3 rounded-lg mb-4"
              placeholder="Enter a name for your sound"
              placeholderTextColor="gray"
              value={customSoundName}
              onChangeText={setCustomSoundName}
            />

            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => {
                  setAddCustomModalVisible(false);
                  setCustomSoundName("");
                  setSelectedUri(null);
                }}
                className="bg-gray-600 py-3 px-5 rounded-lg"
              >
                <Text className="text-white font-bold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={saveCustomSoundFile}
                className="bg-red-600 py-3 px-5 rounded-lg"
              >
                <Text className="text-white font-bold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SoundPicker;
