// src/scripts/history-storage.ts
import { SERVERURL } from "@env";
const SERVER_URL = SERVERURL;

export type TourRecord = {
  title: string;
  startingPoint: string;
  destination: string;
  geminiOutput: string; // full Gemini output string
  date: string;
};

/**
 * Save a single tour to the logged-in user's history.
 * email = userName from useAuth() (your login email).
 */
export async function saveTourToHistory(
  email: string,
  record: TourRecord
): Promise<void> {
  try {
    const response = await fetch(`${SERVER_URL}/user-history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, record }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("Failed to save tour history:", response.status, text);
    }
  } catch (err) {
    console.error("Error saving tour history:", err);
  }
}

/**
 * Get all tours for a given user (by email).
 * HistoryScreen already calls getHistory(userName).
 */
export async function getHistory(email: string): Promise<TourRecord[]> {
  try {
    const response = await fetch(
      `${SERVER_URL}/user-history?email=${encodeURIComponent(email)}`,
      { method: "GET" }
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("Failed to fetch user history:", response.status, text);
      return [];
    }

    const data = await response.json();
    // backend will respond with { history: [...] }
    return Array.isArray(data.history) ? data.history : [];
  } catch (err) {
    console.error("Error fetching user history:", err);
    return [];
  }
}
