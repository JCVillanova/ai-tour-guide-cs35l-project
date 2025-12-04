import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Collapsible } from "@/components/ui/collapsible";
import { Fonts } from "@/constants/theme";
import { getTourNarration } from "@/scripts/backend-call";
// import { run } from "@/scripts/geminiprompttest";
// import {
//   getLocationInfoByName,
//   getLocationInfoCoords,
// } from "@/scripts/backend-call";

import { GetPlacesInRadius } from "@/scripts/google-maps-util";
import * as Location from "expo-location";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Circle, PROVIDER_GOOGLE } from "react-native-maps";

export default function TourScreen() {
  const [tourOn, setTourOn] = useState(false);
  const [infoBlocks, setInfoBlocks] = useState<string[]>([]);

  // current gps coords
  const [currentCoords, setCurrentCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Range in meters for circle radius and prompt
  const [rangeMeters, setRangeMeters] = useState<number>(30);
  const [rangeInput, setRangeInput] = useState<string>("30");

  // prompt cooldown in seconds
  const [promptIntervalSec, setPromptIntervalSec] = useState<number>(30);
  const [promptIntervalInput, setPromptIntervalInput] = useState<string>("30");

  const mapRef = useRef<MapView | null>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const promptTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stop GPS watcher and prompt timer when we leave the screen
  useEffect(() => {
    return () => {
      watchRef.current?.remove();
      watchRef.current = null;

      if (promptTimerRef.current) {
        clearInterval(promptTimerRef.current);
        promptTimerRef.current = null;
      }
    };
  }, []);

  const promptGemini = async () => {
    if (currentCoords) {
      // Await the places search so we pass meaningful text to the Gemini prompt
      const places = await GetPlacesInRadius(
        currentCoords.latitude,
        currentCoords.longitude,
        rangeMeters,
        "AIzaSyCeVPoJrwSedLMPpMtiCfP7bagnRRwtD18"
      );

      // Convert results to readable text (name / vicinity / formatted_address)
      let placesText: string;
      if (Array.isArray(places) && places.length > 0) {
        placesText = places
          .map((p: any, i: number) => {
            const name = p.name || p.vicinity || p.formatted_address;
            return `${i + 1}. ${name ?? JSON.stringify(p)}`;
          })
          .join("\n");
      } else {
        placesText = "No nearby places found.";
      }

      const geminiPrompt = await getTourNarration(placesText);
      setInfoBlocks((infoBlocks) => [...infoBlocks, geminiPrompt]);
    }
  };

  // useEffect(() => {
  //   const intervalId = setInterval(promptGemini, promptIntervalSec * 1000);
  //   return () => {
  //     clearInterval(intervalId);
  //   };
  // }, []);

  const startTour = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    setTourOn(true);

    // let geminiPrompt = await run();
    // setInfoBlocks(infoBlocks => [...infoBlocks, geminiPrompt]);

    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (loc) => {
        const { latitude, longitude } = loc.coords;

        setCurrentCoords({ latitude, longitude });

        mapRef.current?.animateCamera(
          {
            center: { latitude, longitude },
            zoom: 16,
            heading: 0,
            pitch: 0,
          },
          { duration: 500 }
        );
      }
    );
  };

  const endTour = () => {
    watchRef.current?.remove();
    watchRef.current = null;
    setInfoBlocks([]);
    setTourOn(false);
    Speech.stop();
    if (promptTimerRef.current) {
      clearInterval(promptTimerRef.current);
      promptTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (promptTimerRef.current) {
      clearInterval(promptTimerRef.current);
      promptTimerRef.current = null;
    }

    if (!tourOn || promptIntervalSec <= 0) {
      return;
    }

    // promptTimerRef.current = setInterval(() => {
    //   setInfoBlocks((prev) => [
    //     ...prev,
    //     `prompted after ${promptIntervalSec} seconds`,
    //   ]);
    // }, promptIntervalSec * 1000);
    const intervalGemini = setInterval(promptGemini, promptIntervalSec * 1000);

    return () => {
      if (promptTimerRef.current) {
        clearInterval(promptTimerRef.current);
        promptTimerRef.current = null;
      }
      clearInterval(intervalGemini);
    };
  }, [tourOn, promptIntervalSec]);

  //text to speech
  useEffect(() => {
    if (infoBlocks.length === 0) return;

    const latest = infoBlocks[infoBlocks.length - 1];
    Speech.speak(latest);
    return () => {
      Speech.stop();
    };
  }, [infoBlocks, tourOn]);

  //input boxes
  const handleRangeChange = (text: string) => {
    setRangeInput(text);
    const value = parseFloat(text);
    if (!isNaN(value) && value >= 10) {
      setRangeMeters(value);
    }
  };

  const handlePromptIntervalChange = (text: string) => {
    setPromptIntervalInput(text);
    const value = parseFloat(text);
    if (!isNaN(value) && value >= 5) {
      setPromptIntervalSec(value);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {!tourOn ? (
        <ParallaxScrollView
          headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
          headerImage={<></>}
          headerDisplay={false}
          style={{}}
        >
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
              Explore
            </ThemedText>
          </ThemedView>

          <View style={styles.centerArea}>
            <Pressable style={styles.primaryBtn} onPress={startTour}>
              <Text style={styles.primaryBtnText}>Start Tour</Text>
            </Pressable>
          </View>

          <ThemedText>Todos for this tab are listed below:</ThemedText>

          <Collapsible title="Include some kind of maps API - done">
            <ThemedText>
              Already done: connected to google maps view, should move with
              location
            </ThemedText>
          </Collapsible>
          <Collapsible title="Retrieve information - connect to some LLM to generate information">
            <ThemedText>- Should be able to search for a location</ThemedText>
            <ThemedText>
              - Should be able to generate information about said location
            </ThemedText>
            <ThemedText>
              - Maybe highlight direction or point on map that is being talked
              about
            </ThemedText>
            <ThemedText>
              - Show a circle on what is being scanned for being
              information-worthy (radius in which info is being searched up for)
            </ThemedText>
          </Collapsible>
        </ParallaxScrollView>
      ) : (
        <View style={styles.tourContainer}>
          {}
          <View style={styles.mapContainer}>
            <MapView
              ref={(r) => {
                mapRef.current = r;
              }}
              provider={PROVIDER_GOOGLE}
              style={StyleSheet.absoluteFill}
              mapType="standard"
              showsUserLocation
              showsMyLocationButton
              initialRegion={{
                latitude: 34.0689,
                longitude: -118.4452,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              {}
              {currentCoords && (
                <Circle
                  center={currentCoords}
                  radius={rangeMeters}
                  strokeColor="rgba(26,115,232,0.9)"
                  fillColor="rgba(26,115,232,0.25)"
                  strokeWidth={2}
                />
              )}
            </MapView>

            <Pressable style={styles.endBtn} onPress={endTour}>
              <Text style={styles.endBtnText}>End Tour</Text>
            </Pressable>
          </View>

          {}
          <View style={styles.controlsContainer}>
            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>Range (meters):</Text>
              <TextInput
                style={styles.controlInput}
                keyboardType="numeric"
                value={rangeInput}
                onChangeText={handleRangeChange}
                placeholder="e.g. 150"
                placeholderTextColor="#888"
              />
            </View>

            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>Prompt time (seconds):</Text>
              <TextInput
                style={styles.controlInput}
                keyboardType="numeric"
                value={promptIntervalInput}
                onChangeText={handlePromptIntervalChange}
                placeholder="e.g. 15"
                placeholderTextColor="#888"
              />
            </View>
          </View>

          {}
          <View style={styles.infoContainer}>
            <ScrollView
              style={styles.infoScroll}
              contentContainerStyle={styles.infoScrollContent}
            >
              {infoBlocks.map((block, index) => (
                <View key={index} style={styles.infoBlock}>
                  <Text style={styles.infoBullet}>{"\u2022"}</Text>
                  <Text style={styles.infoText}>{block}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  centerArea: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  primaryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#1a73e8",
  },
  primaryBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  tourContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  controlsContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#111",
    borderTopWidth: 1,
    borderTopColor: "#333",
    gap: 12,
  },
  controlGroup: {
    flex: 1,
  },
  controlLabel: {
    color: "#ccc",
    fontSize: 12,
    marginBottom: 4,
  },
  controlInput: {
    backgroundColor: "#222",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: "#fff",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#444",
  },

  infoContainer: {
    flex: 1, // bottom half
    backgroundColor: "#101010",
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  endBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "#ff0000ff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  endBtnText: {
    color: "white",
    fontWeight: "bold",
  },

  infoScroll: {
    flex: 1,
  },
  infoScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  infoBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#1e1e1e",
  },
  infoBullet: {
    marginRight: 8,
    marginTop: 2,
    color: "#ffffff",
    fontSize: 16,
  },
  infoText: {
    flex: 1,
    color: "#ffffff",
    fontSize: 14,
  },
});
