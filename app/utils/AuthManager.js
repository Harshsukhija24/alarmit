import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

/**
 * Creates a new user account and user profile document
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @param {string} displayName - User's display name
 * @returns {Promise<UserCredential>} Firebase user credential
 */
export const createUser = async (email, password, displayName) => {
  try {
    // Create the user account with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update the user's profile with display name
    if (displayName) {
      await updateProfile(userCredential.user, {
        displayName: displayName.trim(),
      });
    }

    // Create user document in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      displayName: displayName ? displayName.trim() : "",
      email: email.toLowerCase(),
      createdAt: new Date(),
    });

    return userCredential;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

/**
 * Signs in a user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<UserCredential>} Firebase user credential
 */
export const signInUser = async (email, password) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

/**
 * Signs out the current user
 * @returns {Promise<void>}
 */
export const signOutUser = async () => {
  try {
    return await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

/**
 * Sends a password reset email to the user
 * @param {string} email - User's email address
 * @returns {Promise<void>}
 */
export const resetPassword = async (email) => {
  try {
    return await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

/**
 * Gets the current user's profile data from Firestore
 * @returns {Promise<Object|null>} User profile data or null if not found
 */
export const getUserProfile = async () => {
  if (!auth.currentUser) return null;

  try {
    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

/**
 * Checks if the current user owns a specific alarm
 * @param {string} alarmId - The ID of the alarm to check
 * @returns {boolean} True if the user owns the alarm, false otherwise
 */
export const userOwnsAlarm = (alarmUserId) => {
  if (!auth.currentUser) return false;
  return alarmUserId === auth.currentUser.uid;
};

/**
 * Checks if a user is currently authenticated
 * @returns {boolean} True if user is authenticated, false otherwise
 */
export const isAuthenticated = () => {
  return auth.currentUser !== null;
};

/**
 * Gets the current user object
 * @returns {Object|null} Firebase user object or null if not signed in
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Add default export that includes all the functions
export default {
  createUser,
  signInUser,
  signOutUser,
  resetPassword,
  getUserProfile,
  userOwnsAlarm,
  isAuthenticated,
  getCurrentUser,
};
