//NOTE - THE ADDRESS BEFORE 3000 MUST BE YOUR IP ADDRESS OF YOUR LOCAL MACHINE
//      - TO FIND YOUR IP ADDRESS, RUN "ipconfig" IN COMMAND PROMPT AND LOOK FOR "IPv4 Address"
//      - REPLACE ALL OCCURRENCES OF THE OLD IP ADDRESS WITH YOUR NEW IP ADDRESS
let SERVER_URL = "http://10.229.218.1:3000";

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

export {
  createAccount,
  getLocationInfoByName,
  getLocationInfoCoords,
  getlocationsNearby,
  getTourNarration,
  getUserHistory,
  handleLogin,
  logUserActivity,
};
