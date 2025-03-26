import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  BackHandler,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { forceClearAudio } from "../utils/AudioManager";

const MissionModal = ({ isVisible, onComplete, missionType }) => {
  const [completed, setCompleted] = useState(false);
  const [mathProblem, setMathProblem] = useState("");
  const [mathAnswer, setMathAnswer] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [typingText, setTypingText] = useState("");
  const [userTyping, setUserTyping] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Input references for auto-focus
  const inputRef = useRef(null);

  // Prevent back button from dismissing the modal
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (isVisible && !completed) {
          Alert.alert(
            "Alarm Active",
            "You must complete the mission to dismiss the alarm!",
            [{ text: "OK" }]
          );
          return true; // Prevent default behavior
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [isVisible, completed]);

  // Reset state when modal becomes visible
  useEffect(() => {
    if (isVisible) {
      resetState();
      console.log("Mission modal visible, generating mission:", missionType);

      // Generate the appropriate mission
      if (missionType === "math" || missionType === "slider") {
        generateMathProblem();
      } else if (missionType === "typing") {
        generateTypingTest();
      }
    } else {
      // Reset the processing flag when modal is hidden
      setProcessingComplete(false);
    }
  }, [isVisible, missionType]);

  // Focus the input when the modal is visible
  useEffect(() => {
    if (isVisible && inputRef.current) {
      const timeout = setTimeout(() => {
        inputRef.current.focus();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isVisible, mathProblem, typingText]);

  // Check if the mission is completed
  useEffect(() => {
    if (!isVisible || processingComplete) return;

    // For math mission
    if ((missionType === "math" || missionType === "slider") && showSuccess) {
      setCompleted(true);
    }

    // For typing mission
    if (
      missionType === "typing" &&
      userTyping === typingText &&
      typingText !== ""
    ) {
      setCompleted(true);
    }
  }, [showSuccess, userTyping, typingText, isVisible, processingComplete]);

  // Handle mission completion
  useEffect(() => {
    if (isVisible && completed && !processingComplete) {
      console.log("======== MISSION COMPLETION DETECTED ========");
      setProcessingComplete(true);

      // Add a small delay to show the success state before dismissing
      console.log("Setting up timer to call onComplete in 1 second...");

      // Immediately prevent further handling
      const timer = setTimeout(() => {
        try {
          if (onComplete) {
            console.log("ACTUALLY CALLING onComplete callback now!");
            onComplete();
          } else {
            console.error("onComplete callback is not defined!");
          }
        } catch (error) {
          console.error("Error calling onComplete:", error);
        }
      }, 1000);

      // Clean up timer if component unmounts during the delay
      return () => {
        console.log("Clearing mission completion timer");
        clearTimeout(timer);
      };
    }
  }, [isVisible, completed, processingComplete, onComplete]);

  // Reset all state
  const resetState = () => {
    setMathProblem("");
    setMathAnswer("");
    setUserAnswer("");
    setIsLoading(false);
    setShowSuccess(false);
    setProcessingComplete(false);
    setCompleted(false);
    setAttempts(0);
    setTypingText("");
    setUserTyping("");
  };

  // Generate a math problem
  const generateMathProblem = () => {
    try {
      const num1 = Math.floor(Math.random() * 20) + 10;
      const num2 = Math.floor(Math.random() * 20) + 10;
      const operators = ["+", "-", "*"];
      const operator = operators[Math.floor(Math.random() * operators.length)];

      let problem = "";
      let answer = 0;

      switch (operator) {
        case "+":
          problem = `${num1} + ${num2}`;
          answer = num1 + num2;
          break;
        case "-":
          // Ensure the result is positive
          if (num1 >= num2) {
            problem = `${num1} - ${num2}`;
            answer = num1 - num2;
          } else {
            problem = `${num2} - ${num1}`;
            answer = num2 - num1;
          }
          break;
        case "*":
          problem = `${num1} × ${num2}`;
          answer = num1 * num2;
          break;
      }

      console.log(`Generated math problem: ${problem}, answer: ${answer}`);
      setMathProblem(problem);
      setMathAnswer(answer.toString());
    } catch (error) {
      console.error("Error generating math problem:", error);
      // Fallback to a simple problem
      setMathProblem("5 + 5");
      setMathAnswer("10");
    }
  };

  // Generate a typing test
  const generateTypingTest = () => {
    try {
      const phrases = [
        "The quick brown fox jumps over the lazy dog",
        "A journey of a thousand miles begins with a single step",
        "Early to bed and early to rise makes a person healthy wealthy and wise",
        "All that glitters is not gold",
        "Actions speak louder than words",
      ];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      console.log(`Generated typing test: ${randomPhrase}`);
      setTypingText(randomPhrase);
    } catch (error) {
      console.error("Error generating typing test:", error);
      // Fallback to a simple phrase
      setTypingText("Good morning");
    }
  };

  // Check the math answer
  const checkMathAnswer = () => {
    setIsLoading(true);

    try {
      console.log(`Checking answer for ${missionType} mission`);

      if (userAnswer.trim() === mathAnswer.trim()) {
        handleSuccess();
      } else {
        handleIncorrect();
      }
    } catch (error) {
      console.error("Error checking answer:", error);
      setIsLoading(false);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  // Check the typing answer
  const checkTypingAnswer = () => {
    if (!userTyping.trim()) {
      Alert.alert("Missing Text", "Please type the text shown above");
      return;
    }

    const isCorrect =
      userTyping.trim().toLowerCase() === typingText.trim().toLowerCase();
    console.log(
      "Checking typing answer, result:",
      isCorrect ? "CORRECT" : "INCORRECT"
    );

    if (isCorrect) {
      console.log("Typing test passed, completing directly");
      handleSuccess();
    } else {
      console.log("Typing test failed, decrementing attempts");
      setAttempts((prev) => prev + 1);

      if (attempts >= 2) {
        console.log("Out of attempts, generating new typing test");
        generateTypingTest();
        setAttempts(0);
      }

      setUserTyping("");
      Alert.alert("Incorrect", "Your typing doesn't match. Try again!");
    }
  };

  // Handle successful answer
  const handleSuccess = () => {
    console.log("Answer correct, showing success");
    setShowSuccess(true);
    setIsLoading(false);

    // If not already processing completion, trigger onComplete
    if (!processingComplete) {
      setProcessingComplete(true);
      setTimeout(() => {
        if (onComplete && typeof onComplete === "function") {
          console.log("Calling onComplete");
          onComplete();
        }
      }, 1500);
    }
  };

  // Handle incorrect answer
  const handleIncorrect = () => {
    console.log("Answer incorrect");
    setAttempts((prev) => prev + 1);
    setUserAnswer("");
    setUserTyping("");
    setIsLoading(false);

    // Create a new problem after 3 failed attempts
    if (attempts >= 2) {
      if (missionType === "math" || missionType === "slider") {
        generateMathProblem();
      } else if (missionType === "typing") {
        generateTypingTest();
      }
      setAttempts(0);
    }

    // Focus the input field again
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // Render the component
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        if (!completed) {
          Alert.alert(
            "Alarm Active",
            "You must complete the mission to dismiss the alarm!",
            [{ text: "OK" }]
          );
        }
      }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.header}>
            {completed
              ? "Mission Completed!"
              : missionType === "math" || missionType === "slider"
              ? "Solve Math Problem"
              : "Complete Typing Test"}
          </Text>

          {completed ? (
            <View style={styles.successContainer}>
              <MaterialIcons name="check-circle" size={80} color="#4CAF50" />
              <Text style={styles.successText}>Great job!</Text>
              <Text style={styles.successSubtext}>
                Your alarm has been dismissed
              </Text>
              {processingComplete && (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  style={{ marginTop: 15 }}
                />
              )}
            </View>
          ) : missionType === "math" || missionType === "slider" ? (
            <View style={styles.missionContainer}>
              <Text style={styles.mathProblem}>{mathProblem}</Text>
              <TextInput
                style={styles.answerInput}
                keyboardType="numeric"
                value={userAnswer}
                onChangeText={setUserAnswer}
                placeholder="Enter your answer"
                placeholderTextColor="#aaa"
                autoFocus
                ref={inputRef}
              />
              <Text style={styles.attemptsText}>
                Attempts remaining: {3 - attempts}
              </Text>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={checkMathAnswer}
              >
                <Text style={styles.submitButtonText}>Submit Answer</Text>
              </TouchableOpacity>
              {showSuccess && (
                <Text style={[styles.resultText, { color: "green" }]}>
                  Correct! Mission complete.
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.missionContainer}>
              <Text style={styles.typingPrompt}>Type the following text:</Text>
              <Text style={styles.typingText}>{typingText}</Text>
              <TextInput
                style={styles.typingInput}
                value={userTyping}
                onChangeText={setUserTyping}
                placeholder="Start typing here..."
                placeholderTextColor="#aaa"
                multiline
                autoFocus
                ref={inputRef}
              />
              <Text style={styles.attemptsText}>
                Attempts remaining: {3 - attempts}
              </Text>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={checkTypingAnswer}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          )}

          {!completed && (
            <Text style={styles.warningText}>
              Complete this mission to stop the alarm
            </Text>
          )}

          {isLoading && (
            <ActivityIndicator
              size="large"
              color="#2196F3"
              style={{ marginTop: 20 }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  modalContent: {
    backgroundColor: "#1f1f1f",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  missionContainer: {
    alignItems: "center",
  },
  mathProblem: {
    fontSize: 36,
    color: "#E53935",
    fontWeight: "bold",
    marginVertical: 20,
  },
  answerInput: {
    backgroundColor: "#333",
    color: "white",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  typingPrompt: {
    color: "#aaa",
    fontSize: 16,
    marginVertical: 10,
  },
  typingText: {
    color: "#E53935",
    fontSize: 18,
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#333",
    borderRadius: 10,
    width: "100%",
    textAlign: "center",
    fontWeight: "500",
  },
  typingInput: {
    backgroundColor: "#333",
    color: "white",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    minHeight: 100,
    fontSize: 16,
    marginVertical: 10,
    textAlignVertical: "top",
  },
  attemptsText: {
    color: "#aaa",
    marginVertical: 10,
  },
  submitButton: {
    backgroundColor: "#E53935",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
    minWidth: 200,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  successText: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
    marginTop: 20,
  },
  successSubtext: {
    fontSize: 16,
    color: "#aaa",
    marginTop: 5,
  },
  warningText: {
    color: "#E53935",
    textAlign: "center",
    marginTop: 20,
    fontWeight: "bold",
  },
  resultText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    textAlign: "center",
  },
});

export default MissionModal;
