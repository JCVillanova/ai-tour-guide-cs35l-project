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
import MapView, { Circle, Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

let tourGenerated = false;

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

let points;
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
  points:  Map<Map<string, number>, Map<string, number>>;
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

  //console.log(points); //points works here too

  //console.log(generateTour(points));
  if (!tourGenerated) {
    tourGenerated = true
    generateTour(points).then((places) =>
      setInfoBlocks(infoBlocks => [...infoBlocks, places])
    );

  }


  // const places = Array.isArray(ret) ? ret : [];

  const [infoBlocks, setInfoBlocks] = useState<string[]>([
  ]);


  // TODO: LINK INFOBLOCKS TO GEMINI PROMPTING USING POINTS ALONG THE ROUTE

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
        }}
      >En route to {destination}</ThemedText>
      <ScrollView
        style={styles.infoScroll}
        contentContainerStyle={styles.infoScrollContent}
      >
        {infoBlocks.map((block, index) => (
          <ThemedView key={index} style={styles.infoBlock}>
            <ThemedText style={styles.infoBullet}>{'\u2022'}</ThemedText>
            <ThemedText style={styles.infoText}>{block}</ThemedText>
          </ThemedView>
        ))}
      </ScrollView>
      <ThemedButton
        onPress={() => (setTourInProgress(false))}
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

  const [routeCoordinates, setRouteCoordinates] = useState<Array<{latitude: number, longitude: number}>>([]);
  const [destination, setDestination] = useState('');
  const [mapCentered, setMapCentered] = useState(false);

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
        
        // You must decode this string into an array of {latitude, longitude}
        const decodedPoints = polyline.decode(encodedPolyline);
        points = decodedPoints.map((point) => ({
          latitude: point[0],
          longitude: point[1]
        }));

        //console.log(points); console.log here works
        
        console.log("Points generated:", points.length);
        setRouteCoordinates(points);
        endPoint = routeCoordinates[routeCoordinates.length - 1];

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

  // current gps coords
  const [currentCoords, setCurrentCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const mapRef = useRef<MapView | null>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

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
  };

  type SearchResultItem = {
    name: string;
    address: string;
  };

  async function handleSearch(text: string) {
    // Search for results
    const ret = await searchQuery(text)
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
      resultsData["No results found"];
    }

    setSearchResults(resultsDisplay);
  }

  function handleTextChange(text: string) {
    setSearchText(text);
    console.log('Changed search text to "' + text + '"');
    handleSearch(text)
  }

  let endPoint = routeCoordinates[routeCoordinates.length - 1];

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
              <Marker
                coordinate={endPoint}
              />
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#1e1e1e',
  },
  infoBullet: {
    marginRight: 8,
    marginTop: 2,
    color: '#ffffff',
    fontSize: 16,
  },
  infoContainer: {
    flex: 1, // bottom half
    backgroundColor: '#101010',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  infoScroll: {
    flex: 1,
  },
  infoScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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