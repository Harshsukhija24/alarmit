import { Audio } from "expo-av";

// Simple global audio reference
let sound = null;
let isPlaying = false;

export const initializeAudioDirectory = async () => {
  try {
    console.log("Initializing audio directory...");

    // Clean up first
    await forceClearAudio();

    // Set up basic audio mode
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      interruptionModeIOS: 1,
      interruptionModeAndroid: 1,
      shouldDuckAndroid: false,
    });

    console.log("Audio initialization completed successfully");
    return true;
  } catch (error) {
    console.error("Failed to initialize audio:", error);
    return false;
  }
};

// Load and play a sound
export const playSound = async () => {
  try {
    if (sound) {
      // Clean up existing sound object
      await sound.unloadAsync();
      sound = null;
    }

    // Create and load the sound file
    const { sound: newSound } = await Audio.Sound.createAsync(
      require("../../assets/audio/alarm-sound.mp3"),
      {
        shouldPlay: true,
        isLooping: true,
        volume: 1.0,
      }
    );

    sound = newSound;
    isPlaying = true;

    // Set up status update callback to track when sound finishes
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        isPlaying = false;
      }
    });

    console.log("Sound loaded and playing");
    return true;
  } catch (error) {
    console.error("Error playing sound:", error);
    isPlaying = false;
    return false;
  }
};

// Stop the sound
export const stopSound = async () => {
  try {
    if (sound) {
      console.log("Stopping sound");
      await sound.stopAsync();
      await sound.unloadAsync();
      sound = null;
      isPlaying = false;
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error stopping sound:", error);
    isPlaying = false;
    return false;
  }
};

// Pause the sound
export const pauseSound = async () => {
  try {
    if (sound) {
      console.log("Pausing sound");
      await sound.pauseAsync();
      isPlaying = false;
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error pausing sound:", error);
    return false;
  }
};

// Resume the sound
export const resumeSound = async () => {
  try {
    if (sound) {
      console.log("Resuming sound");
      await sound.playAsync();
      isPlaying = true;
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error resuming sound:", error);
    return false;
  }
};

// Check if audio is currently playing
export const isAudioPlaying = () => {
  return isPlaying;
};

// Force clear all audio objects
export const forceClearAudio = async () => {
  try {
    console.log("Force clearing audio");
    if (sound) {
      try {
        await sound.stopAsync().catch(() => {});
        await sound.unloadAsync().catch(() => {});
      } catch (e) {
        console.log("Error cleaning up sound:", e);
      }
      sound = null;
    }
    isPlaying = false;
    return true;
  } catch (error) {
    console.error("Error force clearing audio:", error);
    return false;
  }
};

// Add a default export
const AudioManager = {
  initializeAudioDirectory,
  playSound,
  stopSound,
  pauseSound,
  resumeSound,
  forceClearAudio,
  isAudioPlaying,
};

export default AudioManager;
