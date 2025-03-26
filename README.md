# Alarmy App

A feature-rich alarm clock app with mission-based alarm dismissal and custom sounds.

## Features

### Alarm Management
- Create, edit, and delete alarms
- Set repeating alarms for specific days of the week
- Enable/disable alarms
- Add custom labels to alarms

### Mission Types
Complete a mission to dismiss the alarm:
- **Math Problems**: Solve random arithmetic operations
- **Slider Puzzle**: Arrange tiles in numerical order
- **Typing Test**: Type a given phrase correctly

### Custom Time Picker
- Interactive custom time picker with hour, minute, and AM/PM selection
- Intuitive scrollable interface
- Real-time time display

### Sound Management
- Choose from predefined alarm sounds
- Add custom alarm sounds to your collection
- Preview sounds before selection
- Manage (add/delete) your custom sound collection

## Project Structure

```
├── app/
│   ├── components/
│   │   ├── AlarmService.jsx - Background service to trigger alarms
│   │   ├── CustomTimePicker.jsx - Custom time selection component
│   │   ├── MissionModal.jsx - Modal with missions to dismiss alarms
│   │   └── SoundPicker.jsx - Component to select and manage alarm sounds
│   ├── screens/
│   │   ├── AlarmScreen.jsx - Main alarm listing and management screen
│   │   └── ... (other screens)
│   └── utils/
│       └── AudioManager.js - Utility for managing audio files
├── assets/
│   └── audio/ - Directory for alarm sound files
└── ... (other project files)
```

## How to Use

### Adding an Alarm
1. Tap the "+" button on the Alarm screen
2. Set the desired time using the custom time picker
3. Select days for the alarm to repeat
4. Choose a mission type that will be required to dismiss the alarm
5. Select an alarm sound
6. Optionally add a label
7. Tap "Save"

### Managing Custom Sounds
1. When adding or editing an alarm, tap on the sound selector
2. In the sound picker modal, tap "Add Sound" under Custom Sounds
3. Select an audio file from your device
4. Name your custom sound and tap "Save"
5. Your custom sound is now available for use with alarms

### When an Alarm Triggers
1. The selected sound will play
2. A mission modal will appear
3. Complete the mission to dismiss the alarm
4. One-time alarms (without selected days) will automatically disable after triggering

## Installation

```bash
# Install dependencies
npm install

# Start the app
npm start
```

## Dependencies
- React Native
- Expo
- Firebase (Firestore)
- Expo AV (for audio)
- Expo Document Picker (for selecting custom sounds)
- Expo File System (for managing audio files)
- React Navigation
- NativeWind (Tailwind for React Native) 