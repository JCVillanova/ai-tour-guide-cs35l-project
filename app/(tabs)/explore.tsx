import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { ThemedButton } from '@/components/ui/themed-button';
import { Fonts } from '@/constants/theme';
import { clearSites, run, warmGemini } from '@/scripts/geminiprompttest';
import { GetPlacesInRadius } from '@/scripts/google-maps-util';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import MapView, { Circle, PROVIDER_GOOGLE } from 'react-native-maps';

export default function TourScreen() {
  const [tourOn, setTourOn] = useState(false);
  const [infoBlocks, setInfoBlocks] = useState<string[]>([]);
  const infoBlocksRef = useRef<string[]>([]);
  const ttsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentReadIndexRef = useRef(0);
  const tourOnRef = useRef(false);

  useEffect(() => {
    warmGemini();
  }, []);

  // keep tourOnRef in sync with state (used by TTS loop)
  useEffect(() => {
    tourOnRef.current = tourOn;
  }, [tourOn]);

  // current gps coords (for UI / map)
  const [currentCoords, setCurrentCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // ref with latest coords for interval / Gemini
  const coordsRef = useRef<{ latitude: number; longitude: number } | null>(null);
  useEffect(() => {
    coordsRef.current = currentCoords;
  }, [currentCoords]);

  // Range in meters for circle radius and prompt
  const [rangeMeters, setRangeMeters] = useState<number>(30);
  const [rangeInput, setRangeInput] = useState<string>('30');

  // prompt cooldown in seconds
  const [promptIntervalSec, setPromptIntervalSec] = useState<number>(5);
  const [promptIntervalInput, setPromptIntervalInput] = useState<string>('5');

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
    const coords = coordsRef.current;
    if (!coords) return;

    const places = await GetPlacesInRadius(
      coords.latitude,
      coords.longitude,
      rangeMeters
    );

    let placesText: string;
    if (Array.isArray(places) && places.length > 0) {
      placesText = places
        .map((p: any, i: number) => {
          const name = p.name || p.vicinity || p.formatted_address;
          return `${i + 1}. ${name ?? JSON.stringify(p)}`;
        })
        .join('\n');
    } else {
      placesText = 'No nearby places found.';
    }

    const geminiPrompt = await run(placesText);
    if (geminiPrompt === '') {
      return;
    }

    setInfoBlocks((infoBlocks) => [...infoBlocks, geminiPrompt]);
  };

  const startTour = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    setTourOn(true);

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
    clearSites();
    setTourOn(false);

    Speech.stop();

    if (promptTimerRef.current) {
      clearInterval(promptTimerRef.current);
      promptTimerRef.current = null;
    }
  };

  // Interval that periodically calls promptGemini
  useEffect(() => {
    if (!tourOn || promptIntervalSec <= 0) {
      if (promptTimerRef.current) {
        clearInterval(promptTimerRef.current);
        promptTimerRef.current = null;
      }
      return;
    }

    // clear any existing interval before creating a new one
    if (promptTimerRef.current) {
      clearInterval(promptTimerRef.current);
      promptTimerRef.current = null;
    }

    const id = setInterval(() => {
      promptGemini();
    }, promptIntervalSec * 1000);

    promptTimerRef.current = id;

    // cleanup
    return () => {
      if (promptTimerRef.current) {
        clearInterval(promptTimerRef.current);
        promptTimerRef.current = null;
      }
    };
  }, [tourOn, promptIntervalSec, rangeMeters]);

  useEffect(() => {
    infoBlocksRef.current = infoBlocks;
  }, [infoBlocks]);

  // text to speech
  useEffect(() => {
    const READ_DELAY_MS = 2000; // delay between finishing one block and starting the next
    const EMPTY_WAIT_MS = 1000; // how often to check for new blocks when caught up

    // When tour stops, clean everything up
    if (!tourOn) {
      if (ttsTimeoutRef.current) {
        clearTimeout(ttsTimeoutRef.current);
        ttsTimeoutRef.current = null;
      }
      Speech.stop();
      currentReadIndexRef.current = 0;
      return;
    }

    const readNext = () => {
      if (!tourOnRef.current) return;

      const blocks = infoBlocksRef.current;
      const idx = currentReadIndexRef.current;

      // No new blocks yet, check again later
      if (idx >= blocks.length) {
        ttsTimeoutRef.current = setTimeout(readNext, EMPTY_WAIT_MS);
        return;
      }

      const text = blocks[idx];

      Speech.speak(text, {
        onDone: () => {
          if (!tourOnRef.current) return;
          currentReadIndexRef.current += 1;
          ttsTimeoutRef.current = setTimeout(readNext, READ_DELAY_MS);
        },
        onError: () => {
          if (!tourOnRef.current) return;
          currentReadIndexRef.current += 1;
          ttsTimeoutRef.current = setTimeout(readNext, READ_DELAY_MS);
        },
      });
    };

    // start reading when tour on
    readNext();

    // cleanup if tourOn off or effect re-runs
    return () => {
      if (ttsTimeoutRef.current) {
        clearTimeout(ttsTimeoutRef.current);
        ttsTimeoutRef.current = null;
      }
    };
  }, [tourOn]);

  // input boxes
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
    <ThemedView style={{ flex: 1 }}>
      {!tourOn ? (
        <ParallaxScrollView
          headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
          headerImage={<></>}
          headerDisplay={false}
          style={{}}
        >
          <ThemedView style={styles.exploreContainer}>
            <ThemedText type="title" style={styles.exploreTitle}>
              Explore
            </ThemedText>

            <ThemedButton
              onPress={startTour}
              content='Start Tour'
              size='large'
              style={{}}
            />
          </ThemedView>
        </ParallaxScrollView>
      ) : (
        <ThemedView style={styles.tourContainer}>
          <ThemedView style={styles.mapContainer}>
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
          </ThemedView>

          <ThemedView style={styles.controlsContainer}>
            <ThemedView style={styles.controlGroup}>
              <ThemedText style={styles.controlLabel}>Range (meters):</ThemedText>
              <ThemedTextInput
                style={styles.controlInput}
                keyboardType="numeric"
                value={rangeInput}
                onChangeText={handleRangeChange}
                placeholder="e.g. 150"
                placeholderTextColor="#888"
              />
            </ThemedView>

            <ThemedView style={styles.controlGroup}>
              <ThemedText style={styles.controlLabel}>Prompt time (seconds):</ThemedText>
              <ThemedTextInput
                style={styles.controlInput}
                keyboardType="numeric"
                value={promptIntervalInput}
                onChangeText={handlePromptIntervalChange}
                placeholder="e.g. 15"
                placeholderTextColor="#888"
              />
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.infoContainer}>
            <ScrollView
              style={styles.infoScroll}
              contentContainerStyle={styles.infoScrollContent}
            >
              {infoBlocks.map((block, index) => (
                <View key={index} style={styles.infoBlock}>
                  <Text style={styles.infoText}>{block}</Text>
                </View>
              ))}
            </ScrollView>
          </ThemedView>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  exploreContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  exploreTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 32,
    marginBottom: 16,
  },
  centerArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  primaryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1a73e8',
  },
  primaryBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tourContainer: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  controlsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
    gap: 12,
  },
  controlGroup: {
    flex: 1,
  },
  controlLabel: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 0,
  },
  controlInput: {
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#444',
  },
  endBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#ff0000ff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  endBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoBlock: {
    padding: 12,
    borderColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  infoBullet: {
    marginRight: 8,
    marginTop: 2,
    color: '#ffffff',
    fontSize: 16,
  },
  infoContainer: {
    flex: 1, // bottom half
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  infoScroll: {
    flex: 1,
    padding: 12,
  },
  infoScrollContent: {
    gap: 12,
  },
  infoText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
  },
});
