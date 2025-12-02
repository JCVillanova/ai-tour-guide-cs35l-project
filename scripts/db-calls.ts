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

async function getLocationInfo(
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

export { createAccount, handleLogin };
