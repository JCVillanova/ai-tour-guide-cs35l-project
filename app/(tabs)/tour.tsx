import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';

function InitialScreen({ onPlanTour }: { onPlanTour: () => void }) {
  return (
    <ThemedView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ThemedView
        style={{
          backgroundColor: 'purple',
          borderRadius: 16,
        }}
      >
        <Pressable
          onPress={onPlanTour}
          style={{
            paddingHorizontal: 32,
            paddingVertical: 24,
          }}
        >
          <ThemedText
            style={{
              fontSize: 18
            }}
          >Plan Tour</ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

function MapIntegratedScreen() {
  return (
    <>
      <ThemedView
        style={{
          backgroundColor: 'purple',
          height: '50%',
        }}
      >

      </ThemedView>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
        headerImage={<></>}
        headerDisplay={false}
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText
            type="title"
            style={{
              fontFamily: Fonts.rounded,
            }}>
            Tour
          </ThemedText>
        </ThemedView>
      </ParallaxScrollView>
    </>
  );
}

function DynamicTour() {
  const [planStarted, setPlanStarted] = useState(false);

  function PlanTour() {
    console.log('Plan Tour button pressed');
    console.log(planStarted);
    setPlanStarted(true);
  }

  let display = planStarted ? <MapIntegratedScreen /> : <InitialScreen onPlanTour={PlanTour}/>;

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
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});