import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { act } from "react-test-renderer";

// 🔧 Adjust this import path to wherever your Explore tab component lives
import ExploreScreen from "@/app/(tabs)/explore";

// --- Mocks for external / side-effect modules ---

// Auth context (if used anywhere up the tree)
jest.mock("../../app/auth_context", () => ({
  useAuth: jest.fn(() => ({
    userName: "test@example.com",
    login: jest.fn(),
    logout: jest.fn(),
  })),
}));

// Gemini / prompt code
jest.mock("@/scripts/geminiprompttest", () => ({
  clearSites: jest.fn(),
  warmGemini: jest.fn().mockResolvedValue("hello"),
  run: jest.fn(),
}));

// Google Maps helpers
jest.mock("@/scripts/google-maps-util", () => ({
  GetPlacesInRadius: jest.fn().mockResolvedValue([
    {
      name: "Royce Hall",
      vicinity: "UCLA",
      formatted_address: "10745 Dickson Ct, Los Angeles, CA",
    },
    {
      name: "Powell Library",
      vicinity: "UCLA",
      formatted_address: "10740 Dickson Ct, Los Angeles, CA",
    },
  ]),
}));

// Location
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ status: "granted" }),
  watchPositionAsync: jest.fn((options, callback) => {
    // Simulate initial location after a small delay
    setTimeout(() => {
      callback({
        coords: {
          latitude: 34.0689,
          longitude: -118.4452,
          altitude: null,
          accuracy: 10,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      });
    }, 100);

    return Promise.resolve({
      remove: jest.fn(),
    });
  }),
  Accuracy: {
    High: 4,
  },
}));

// Text-to-speech
jest.mock("expo-speech", () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeakingAsync: jest.fn().mockResolvedValue(false),
}));

// react-native-maps: provide a MapView with animateCamera
jest.mock("react-native-maps", () => {
  const React = require("react");
  const { View } = require("react-native");

  const MockMapView = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      animateCamera: jest.fn(),
      setCamera: jest.fn(),
      animateToRegion: jest.fn(),
    }));

    // Default testID to "explore-map" if none provided
    return <View testID={props.testID ?? "explore-map"} {...props} />;
  });

  const Mock = (props) => <View testID={props.testID} {...props} />;

  return {
    __esModule: true,
    default: MockMapView,
    Marker: Mock,
    Polyline: Mock,
    Circle: Mock,
    PROVIDER_GOOGLE: "google",
  };
});

// Themed components
jest.mock("@/components/themed-view", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    ThemedView: ({ children, ...props }) => <View {...props}>{children}</View>,
  };
});

jest.mock("@/components/themed-text", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    ThemedText: ({ children, ...props }) => <Text {...props}>{children}</Text>,
  };
});

jest.mock("@/components/themed-text-input", () => {
  const React = require("react");
  const { TextInput } = require("react-native");
  return {
    ThemedTextInput: (props) => <TextInput {...props} />,
  };
});

jest.mock("@/components/ui/themed-button", () => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");
  return {
    ThemedButton: ({ content, onPress, disabled, ...props }) => (
      <TouchableOpacity onPress={onPress} disabled={disabled} {...props}>
        <Text>{content}</Text>
      </TouchableOpacity>
    ),
  };
});

// --- Tests ---

describe("ExploreScreen end-to-end flows", () => {
  const Location = require("expo-location");
  const { GetPlacesInRadius } = require("@/scripts/google-maps-util");
  const { run, clearSites } = require("@/scripts/geminiprompttest");
  const Speech = require("expo-speech");

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Default Gemini response
    run.mockResolvedValue(
      "Royce Hall: This historic UCLA building was completed in 1929 and is a centerpiece of campus."
    );
  });

  it("renders initial explore screen with Start Exploring button", () => {
    const { getByText, queryByTestId } = render(<ExploreScreen />);

    // Initial hero screen
    expect(getByText(/start exploring/i)).toBeTruthy();

    // Map should NOT be visible yet
    expect(queryByTestId("explore-map")).toBeNull();
  });

  it("starts tour when Start Exploring is pressed and permission is granted", async () => {
    const { getByText, getByTestId } = render(<ExploreScreen />);

    const startButton = getByText(/start exploring/i);
    fireEvent.press(startButton);

    // Permission requested
    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    });

    // Tour mode: Map + End Tour button visible
    await waitFor(() => {
      expect(getByTestId("explore-map")).toBeTruthy();
      expect(getByText(/end tour/i)).toBeTruthy();
    });
  });

  it("does not start tour when location permission is denied", async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: "denied",
    });

    const { getByText, queryByTestId } = render(<ExploreScreen />);

    const startButton = getByText(/start exploring/i);
    fireEvent.press(startButton);

    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    });

    // We should remain on the initial screen
    expect(getByText(/start exploring/i)).toBeTruthy();
    expect(queryByTestId("explore-map")).toBeNull();
  });

  it("periodically calls GetPlacesInRadius and Gemini run while tour is on", async () => {
    const { getByText, findAllByTestId } = render(<ExploreScreen />);

    // Start tour
    fireEvent.press(getByText(/start exploring/i));

    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    });

    // Advance time so the location watcher fires
    await act(async () => {
      jest.advanceTimersByTime(200); // triggers watchPositionAsync callback (100ms)
    });

    // Initial interval is 5s; fast-forward beyond that
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    // Now the promptGemini interval should have fired
    await waitFor(() => {
      expect(GetPlacesInRadius).toHaveBeenCalled();
      expect(run).toHaveBeenCalled();
    });

    // Narration should appear as info-block(s)
    const blocks = await findAllByTestId("info-block");
    expect(blocks.length).toBeGreaterThan(0);
    expect(blocks[0].props.children.props.children).toContain("Royce Hall");
  });
});
