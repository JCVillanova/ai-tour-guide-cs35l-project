import { useState } from 'react';
import { StyleSheet } from 'react-native';

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
          backgroundColor: 'lightgreen',
          height: '50%',
        }}
      ></ThemedView>
      <ThemedView
        style={{
          flexDirection: 'column',
          height: '50%',
          justifyContent: 'space-between',
          padding: 16,
        }}
      >
        <ThemedView
          style={[
            {flexGrow: 1},
            styles.titleContainer
          ]}
        >
          <ThemedText
            type="title"
            style={{
              fontFamily: Fonts.rounded,
            }}>
            Tour
          </ThemedText>
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
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});