const SERVER_URL = "http://10.229.218.1:5000";

async function handleLogin(email: string, password: string) {
  const response = await fetch(`${SERVER_URL}/users/authenticate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
}

async function createAccount(email: string, password: string) {
  console.log("Server URL:", SERVER_URL);
  const response = await fetch(`${SERVER_URL}/users`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
}

async function getLocationInfoCoords(
  latitude: number,
  longitude: number
): Promise<string> {
  const response = await fetch(
    `${SERVER_URL}/location-info?lat=${latitude}&lon=${longitude}`,
    { method: "GET" }
  );

  if (!response.ok) {
    console.error("Failed to fetch location info");
    return "";
  }

  const data = await response.text();
  return data;
}

async function getLocationInfoByName(locationName: string): Promise<string> {
  const response = await fetch(
    `${SERVER_URL}/location-info?name=${locationName}`,
    { method: "GET" }
  );
  if (!response.ok) {
    console.error("Failed to fetch location info");
    return "";
  }
  const data = await response.text();
  return data;
}

async function getlocationsNearby(
  latitude: number,
  longitude: number
): Promise<string[]> {
  const response = await fetch(`${SERVER_URL}/locations-nearby`, {
    method: "GET",
  });
  if (!response.ok) {
    console.error("Failed to fetch nearby locations");
    return [];
  }
  const data = await response.json();
  return data.locations;
}

async function logUserActivity(
  email: string,
  location: string,
  information: string
): Promise<void> {
  await fetch(`${SERVER_URL}/log-activity`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, location, information }),
  });
}

async function getUserHistory(email: string): Promise<string[]> {
  const response = await fetch(`${SERVER_URL}/user-history?email=${email}`, {
    method: "GET",
  });

  if (!response.ok) {
    console.error("Failed to fetch user history");
    return [];
  }

  const data = await response.json();
  return data.history;
}

async function getTourNarration(placesText: string): Promise<string> {
  const response = await fetch(`${SERVER_URL}/tour-narration`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ placesText }),
  });

  if (!response.ok) {
    console.error("Failed to generate tour narration");
    return "";
  }

  const data = await response.json();
  return data.narration;
}

// Test endpoint (no external dependencies) to verify fetch works
async function testEcho(
  text: string
): Promise<{ originalText: string; reversedText: string }> {
  console.log("Testing fetch with simple echo endpoint...");
  const response = await fetch(`${SERVER_URL}/test-echo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    console.error("Test echo failed with status:", response.status);
    throw new Error(`Test echo failed: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("Test echo response:", data);
  return {
    originalText: data.originalText,
    reversedText: data.reversedText,
  };
}

export {
  createAccount,
  getLocationInfoByName,
  getLocationInfoCoords,
  getlocationsNearby,
  getUserHistory,
  handleLogin,
  logUserActivity,
  getTourNarration,
  testEcho,
};
