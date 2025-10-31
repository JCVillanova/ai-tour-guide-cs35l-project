import { useState } from 'react';
import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedButton } from '@/components/ui/themed-button';
import { Fonts } from '@/constants/theme';

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
          <ThemedButton
            onPress={onHandleState}
            content='Exit'
            size='medium'
            style={{}}
          />
        </ThemedView>
      </ParallaxScrollView>
    </>
  );
}

function DynamicTour() {
  const [planStarted, setPlanStarted] = useState(false);

  function HandleState() {
    console.log('Plan Tour button pressed');
    console.log(planStarted);
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
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});