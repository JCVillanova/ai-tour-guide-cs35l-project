import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { Fonts } from '@/constants/theme';

export default function TourScreen() {
  const [tourOn, setTourOn] = useState(false);
  const mapRef = useRef<MapView | null>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  // Stop GPS watcher when we leave the screen or end the tour
  useEffect(() => {
    return () => {
      watchRef.current?.remove();
      watchRef.current = null;
    };
  }, []);

  const startTour = async () => {
    // Ask for foreground location permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    setTourOn(true);

    // Start high-accuracy updates and keep camera centered
    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (loc) => {
        const { latitude, longitude } = loc.coords;
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
    setTourOn(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
        headerImage={<></>}
        headerDisplay={false}
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText
            type="title"
            style={{ fontFamily: Fonts.rounded }}
          >
            Explore
          </ThemedText>
        </ThemedView>

        {!tourOn && (
          <View style={styles.centerArea}>
            <Pressable style={styles.primaryBtn} onPress={startTour}>
              <Text style={styles.primaryBtnText}>Start Tour</Text>
            </Pressable>
          </View>
        )}

        <ThemedText>Todos for this tab are listed below:</ThemedText>

        <Collapsible title="Include some kind of maps API - done">
          <ThemedText>
            Already done: connected to google maps view, should move with location
          </ThemedText>
        </Collapsible>
        <Collapsible title="Retrieve information - connect to some LLM to generate information">
          <ThemedText>- Should be able to search for a location</ThemedText>
          <ThemedText>- Should be able to generate information about said location</ThemedText>
          <ThemedText>- Maybe highlight direction or point on map that is being talked about</ThemedText>
          <ThemedText>- Show a circle on what is being scanned for being information-worthy (radius in which info is being searched up for)</ThemedText>
        </Collapsible>
      </ParallaxScrollView>

      {tourOn && (
        <View style={StyleSheet.absoluteFill}>
          <MapView
            ref={(r) => (mapRef.current = r)}
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFill}
            mapType="standard"
            showsUserLocation
            showsMyLocationButton
            initialRegion={{
              latitude: 34.0689,        // UCLA-ish fallback
              longitude: -118.4452,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          />

          <Pressable style={styles.endBtn} onPress={endTour}>
            <Text style={styles.endBtnText}>End Tour</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
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
});
