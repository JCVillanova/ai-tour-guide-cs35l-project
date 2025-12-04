import { useRef, useState } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { ThemedButton } from '@/components/ui/themed-button';
import { Fonts } from '@/constants/theme';

import { SearchWithText } from '@/scripts/google-maps-util';
import * as Location from 'expo-location';
import MapView, { Circle, PROVIDER_GOOGLE } from 'react-native-maps';

function InitialScreen({ onHandleState }: { onHandleState: () => void }) {
  return (
    <ThemedView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ThemedButton
        onPress={onHandleState}
        content='Plan Tour'
        size='large'
        style={{}}
      />
    </ThemedView>
  );
}

function MapIntegratedScreen({ onHandleState }: { onHandleState: () => void }) {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState('');

  const [tourOn, setTourOn] = useState(false);

  // current gps coords
  const [currentCoords, setCurrentCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const mapRef = useRef<MapView | null>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  const startTour = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
  
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
      setTourOn(false);
    };

  function handleSearch(text: string) {
    // Do something to display search results
    let resultsText: string;
    let results = SearchWithText(text);

    if (Array.isArray(results) && results.length > 0) {
      resultsText = results
        .map((p: any, i: number) => {
          const name = p.name || p.vicinity || p.formatted_address;
          return `${i + 1}. ${name ?? JSON.stringify(p)}`;
        })
        .join('\n');
    } else {
      resultsText = 'No results found.';
    }

    setSearchResults(resultsText);
  }

  function handleTextChange(text: string) {
    setSearchText(text);
    console.log('Changed search text to "' + text + '"');
    handleSearch(text)
  }

  return (
    <>
      <ThemedView
        style={styles.mapContainer && {
          backgroundColor: 'lightgreen',
          height: '50%',
        }}
      >
            <MapView
              ref={(r) => {mapRef.current = r}}
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
                  radius={2000}
                  strokeColor="rgba(26,115,232,0.9)"
                  fillColor="rgba(26,115,232,0.25)"
                  strokeWidth={2}
                />
              )}
            </MapView>
      </ThemedView>
      <ThemedView
        style={{
          flexDirection: 'column',
          height: '50%',
          justifyContent: 'space-between',
          padding: 16,
        }}
      >
        <ThemedView
          style={{
              flexDirection: 'column',
              flexGrow: 1,
              gap: 16,
            }}
        >
          <ThemedText
            type="title"
            style={{
              fontFamily: Fonts.rounded,
            }}>
            Plan Tour
          </ThemedText>
          <ThemedTextInput
            onChangeText={handleTextChange}
            placeholder='Search for a place anywhere'
          />
          <ThemedView
            style={{
              borderColor: 'white',
              borderRadius: 4,
              borderWidth: 0.5,
              height: 192,
            }}
          >
            <ThemedText
              type='default'
              style={{
                margin: 'auto',
              }}
            >{searchResults}</ThemedText>
          </ThemedView>
        </ThemedView>
        <ThemedButton
          onPress={onHandleState}
          content='Exit'
          size='medium'
          style={{}}
        />
      </ThemedView>
    </>
  );
}

function DynamicTour() {
  const [planStarted, setPlanStarted] = useState(false);

  function HandleState() {
    if (planStarted)
      setPlanStarted(false);
    else
      setPlanStarted(true);
  }

  let display = planStarted ? <MapIntegratedScreen onHandleState={HandleState} /> : <InitialScreen onHandleState={HandleState} />;

  return display;
}

export default function TourScreen() {
  return (
    <ThemedView
      style={{
        flex: 1,
      }}
    >
      <DynamicTour />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});