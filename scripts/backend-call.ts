async function handleLogin(email: string, password: string) {
  const response = await fetch("https://your-backend-api.com/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
}

async function createAccount(email: string, password: string) {
  const response = await fetch("https://your-backend-api.com/create-account", {
    method: "POST",
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
    "https://your-backend-api.com/location-info?lat=${latitude}&lon=${longitude}",
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
    "https://your-backend-api.com/location-info?name=${locationName}",
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
  const response = await fetch(
    "https://your-backend-api.com/locations-nearby",
    { method: "GET" }
  );
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
  await fetch("https://your-backend-api.com/log-activity", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, location, information }),
  });
}

async function getUserHistory(email: string): Promise<string[]> {
  const response = await fetch(
    "https://your-backend-api.com/user-history?email=${email}",
    { method: "GET" }
  );

  if (!response.ok) {
    console.error("Failed to fetch user history");
    return [];
  }

  const data = await response.json();
  return data.history;
}

export {
  createAccount,
  getLocationInfoByName,
  getLocationInfoCoords,
  getlocationsNearby,
  getUserHistory,
  handleLogin,
  logUserActivity,
};
