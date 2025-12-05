import AsyncStorage from '@react-native-async-storage/async-storage';

export type TourRecord = {
  title: string;
  startingPoint: string;
  destination: string;
  geminiOutput: string;
  date: string;
};

// Helper to generate a unique key for each user
const getStorageKey = (email: string) => `tour_history_${email}`;

// Save a new tour (requires email)
export const saveTourToHistory = async (email: string, newTour: TourRecord) => {
  if (!email) return; // Don't save if no user is logged in

  try {
    const key = getStorageKey(email);
    const existingHistory = await getHistory(email);
    const updatedHistory = [newTour, ...existingHistory];
    await AsyncStorage.setItem(key, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error saving tour:', error);
  }
};

// Get all tours (requires email)
export const getHistory = async (email: string): Promise<TourRecord[]> => {
  if (!email) return [];

  try {
    const key = getStorageKey(email);
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error reading history:', error);
    return [];
  }
};