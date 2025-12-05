import { useEffect, useRef, useState, type ReactNode } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { ThemedButton } from '@/components/ui/themed-button';
import { Fonts } from '@/constants/theme';
import { generateTour } from '@/scripts/geminiprompttest';
import { checkApiKey, searchQuery } from '@/scripts/google-maps-util';

import polyline from '@mapbox/polyline';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import MapView, { Circle, Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

let tourGenerated = false;

// Store the decoded route points so we can pass them to Gemini
let points: Array<{ latitude: number; longitude: number }> = [];

// Props for different states of MapIntegratedScreen bottom half
interface SearchUIProps {
  onHandleState: () => void;
  handleTextChange: (text: string) => void;
  searchResults: ReactNode | null;
}

interface TourConfirmationUIProps {
  destination: string;
  setTourAwaitingConfirm: (val: boolean) => void;
  setTourInProgress: (val: boolean) => void;
  CenterMap: () => void;
}

interface TourInProgressUIProps {
  destination: string;
  setTourInProgress: (val: boolean) => void;
  points: Array<{ latitude: number; longitude: number }>;
}

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

function SearchUI({ onHandleState, handleTextChange, searchResults }: SearchUIProps) {
  return (
    <ThemedView
      style={{
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 400,
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
        <ThemedButton
          onPress={onHandleState}
          content='Exit'
          size='medium'
          style={{}}
        />
      </ThemedView>
    </ThemedView>
  );
}

function TourConfirmationUI({ destination, setTourAwaitingConfirm, setTourInProgress, CenterMap }: TourConfirmationUIProps) {
  return (
    <ThemedView
      style={{
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 400,
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
          Confirm Tour
        </ThemedText>
        <ThemedView
          style={{
            alignItems: 'center',
            flex: 1,
            height: 192,
            justifyContent: 'center',
          }}
        >
          <ThemedText
            style={{
              fontSize: 30,
              lineHeight: 30,
              textAlign: 'center',
            }}
          >
            Your tour will take you to {destination}
          </ThemedText>
        </ThemedView>
        <ThemedView
          style={{
            flexDirection: 'row',
            gap: 24,
            justifyContent: 'center',
          }}
        >
          <ThemedButton
            onPress={() => (setTourAwaitingConfirm(false))}
            content='Back'
            size='medium'
            style={{}}
          />
          <ThemedButton
            onPress={() => (setTourInProgress(true), CenterMap())}
            content='Start Tour'
            size='medium'
            style={{}}
          />
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

function TourInProgressUI({ destination, setTourInProgress, points }: TourInProgressUIProps) {

  const [infoBlocks, setInfoBlocks] = useState<string[]>([]);
  const [hasStartedTTS, setHasStartedTTS] = useState(false);
  const cancelRef = useRef(false);

  // Generate the tour text once per tour
  if (!tourGenerated) {
    tourGenerated = true;
    generateTour(points).then((output) => {
      if (!output) return;

      const delimiter = "====================";
      const formatted = output.split(delimiter).map(s => s.trim()).filter(Boolean);

      setInfoBlocks(formatted);
    });
  }

  //tts loop
  function speakBlock(index: number) {
    if (cancelRef.current || index >= infoBlocks.length) {
      return;
    }

    const text = infoBlocks[index];

    Speech.speak(text, {
      onDone: () => {
        if (cancelRef.current) {
          return;
        }
        speakBlock(index + 1);
      },onStopped: () => {return;},onError: () => {return;},});
  }

  // Start tts when first get infoblocks
  useEffect(() => {
    if (infoBlocks.length > 0 && !hasStartedTTS) {
      setHasStartedTTS(true);
      speakBlock(0);
    }
  }, [infoBlocks, hasStartedTTS]);

  // Cleanup functions for tts
  useEffect(() => {
    return () => {
      cancelRef.current = true;
      Speech.stop();
      tourGenerated = false;
    };
  }, []);

  const handleExit = () => {
    cancelRef.current = true;
    Speech.stop();
    tourGenerated = false;
    setTourInProgress(false);
  };


  return (
    <ThemedView style={{
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: 400,
      padding: 16,
    }}>
      <ThemedText type='subtitle'
        style={{
          fontFamily: Fonts.rounded,
          marginBottom: 16,
        }}
      >En route to {destination}</ThemedText>
      {infoBlocks.length === 0 ?
      (
        <ThemedView
          style={{
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <ThemedText
            style={{
              fontSize: 30,
              lineHeight: 30,
            }}
          >Loading your guide...</ThemedText>
        </ThemedView>
      ) : (
        <ThemedView style={{ flex: 1 }}>
          <ScrollView
            style={styles.infoScroll}
            contentContainerStyle={styles.infoScrollContent}
          >
            {infoBlocks.map((block, index) => (
              <ThemedView key={index} style={styles.infoBlock}>
                <ThemedText style={styles.infoText}>{block}</ThemedText>
              </ThemedView>
            ))}
          </ScrollView>
        </ThemedView>
      )}
      <ThemedButton
        onPress={handleExit}
        content='Exit'
        size='medium'
        style={{}}
      />
    </ThemedView>
  );
}

function MapIntegratedScreen({ onHandleState }: { onHandleState: () => void }) {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<ReactNode | null>(null);

  const [tourInterfaceOn, setTourInterfaceOn] = useState(false);
  const [tourAwaitingConfirm, setTourAwaitingConfirm] = useState(false);
  const [tourInProgress, setTourInProgress] = useState(false);

  const [routeCoordinates, setRouteCoordinates] = useState<Array<{ latitude: number, longitude: number }>>([]);
  const [destination, setDestination] = useState('');
  const [mapCentered, setMapCentered] = useState(false);

  // current gps coords
  const [currentCoords, setCurrentCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const mapRef = useRef<MapView | null>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    startTourInterface();

    // Cleanup when component unmounts
    return () => {
      endTourInterface();
    };
  }, []);

  const getDirections = async (startLoc: string, destinationLoc: string) => {
    try {
      const KEY = checkApiKey();
      // Fetch the route from Google
      const response = await fetch(
        'https://routes.googleapis.com/directions/v2:computeRoutes',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': KEY,
            'X-Goog-FieldMask': 'routes.polyline.encodedPolyline' // We only ask for the polyline
          },
          body: JSON.stringify({
            origin: {
              location: {
                latLng: {
                  latitude: currentCoords?.latitude,
                  longitude: currentCoords?.longitude,
                }
              }
            },
            destination: {
              address: destinationLoc
            },
            travelMode: 'DRIVE'
          })
        }
      );
      const json = await response.json();
      console.log(json);

      if (json.routes && json.routes.length > 0) {
        // Google returns an encoded string for the route points
        const encodedPolyline = json.routes[0].polyline.encodedPolyline;

        // Decode this string into an array of {latitude, longitude}
        const decodedPoints = polyline.decode(encodedPolyline);
        points = decodedPoints.map((point: [number, number]) => ({
          latitude: point[0],
          longitude: point[1]
        }));

        console.log("Points generated:", points.length);
        setRouteCoordinates(points);

        if (mapRef.current) {
          mapRef.current.fitToCoordinates(points, {
            edgePadding: {
              top: 75,
              right: 75,
              bottom: 75,
              left: 75,
            },
            animated: true,
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const startTourInterface = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    setTourInterfaceOn(true);

    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (loc) => {
        const { latitude, longitude } = loc.coords;

        setCurrentCoords({ latitude, longitude });

        if (!mapCentered) {
          mapRef.current?.animateCamera(
            {
              center: { latitude, longitude },
              zoom: 16,
              heading: 0,
              pitch: 0,
            },
            { duration: 500 }
          );
          setMapCentered(true);
        }
      }
    );
  };

  async function CenterMap() {
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
  }

  const endTourInterface = () => {
    watchRef.current?.remove();
    watchRef.current = null;
    setTourInterfaceOn(false);
    tourGenerated = false;
    Speech.stop();
  };

  type SearchResultItem = {
    name: string;
    address: string;
  };

  async function handleSearch(text: string) {
    // Search for results
    const ret = await searchQuery(text);
    const places = Array.isArray(ret) ? ret : [];
    const resultsData: SearchResultItem[] = [];
    places.forEach((place) => {
      const name = place?.displayName?.text || "Unknown Place";
      const address = place?.formattedAddress || "No Address";
      resultsData.push({ name, address });
    });

    let resultsDisplay: ReactNode | null = null;

    function SelectSearchResult(item: SearchResultItem) {
      console.log("Selected a search result: " + item.name);
      if (currentCoords != null) {
        console.log("Trying to get directions");
        getDirections(currentCoords.latitude + "," + currentCoords.longitude, item.address);
        setTourAwaitingConfirm(true);
        setDestination(item.name);
      }
    }

    // Each search result is a button that will call SelectSearchResult
    const renderSearchResult = ({ item }: { item: SearchResultItem }) => (
      <Pressable
        style={({ pressed }) => [
          {
            backgroundColor: pressed ? 'gray' : 'transparent'
          }
        ]}
        onPress={() => SelectSearchResult(item)}
      >
        <ThemedText style={styles.searchResultText}>
          Name: {item.name}{"\n"}Address: {item.address}
        </ThemedText>
        <ThemedView style={styles.horizontalDivider}></ThemedView>
      </Pressable>
    );

    // Render a list if there are search results
    if (resultsData.length > 0) {
      resultsDisplay = (
        <FlatList
          data={resultsData}
          renderItem={renderSearchResult}
          style={styles.searchResults}
        />
      );
    } else { // If there are no search results
      resultsDisplay = (
        <ThemedText>No results found</ThemedText>
      );
    }

    setSearchResults(resultsDisplay);
  }

  function handleTextChange(text: string) {
    setSearchText(text);
    console.log('Changed search text to "' + text + '"');
    handleSearch(text);
  }

  const endPoint = routeCoordinates[routeCoordinates.length - 1];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{
        flex: 1,
      }}
    >
      <ThemedView
        style={styles.mapContainer && {
          flex: 1,
          flexShrink: 1,
        }}
      >
        <MapView
          ref={(r) => { mapRef.current = r; }}
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
              radius={50}
              strokeColor="rgba(26,115,232,0.9)"
              fillColor="rgba(26,115,232,0.25)"
              strokeWidth={2}
            />
          )}
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#682cad" // Fallback color
            strokeWidth={7}
          />
          {endPoint && (
            <Marker
              coordinate={endPoint}
            />
          )}
        </MapView>
      </ThemedView>
      {tourAwaitingConfirm ? (tourInProgress ?
        <TourInProgressUI
          destination={destination}
          setTourInProgress={setTourInProgress}
          points={points}
        /> :
        <TourConfirmationUI
          destination={destination}
          setTourAwaitingConfirm={setTourAwaitingConfirm}
          setTourInProgress={setTourInProgress}
          CenterMap={CenterMap}
        />) :
        <SearchUI
          onHandleState={onHandleState}
          handleTextChange={handleTextChange}
          searchResults={searchResults}
        />}
    </KeyboardAvoidingView>
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
  horizontalDivider: {
    borderColor: 'white',
    borderWidth: 0.5,
    height: 0,
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
    borderTopColor: '#333',
  },
  infoScroll: {
    flex: 1,
    marginBottom: 16,
  },
  infoScrollContent: {
    gap: 12,
  },
  infoText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  searchResults: {
    height: '100%',
    width: '100%',
  },
  searchResultText: {
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
