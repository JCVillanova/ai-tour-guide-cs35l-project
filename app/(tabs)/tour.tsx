import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export default function TourScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Tour
        </ThemedText>
      </ThemedView>
      <ThemedText>Todos for this tab are listed below:</ThemedText>
      <Collapsible title="Include some kind of maps API">
        <ThemedText>
          We need to connect the app to a maps service so that a map can be overlaid onto the app&apos;s UI. Many of the routing features will require this API.
        </ThemedText>
      </Collapsible>
      <Collapsible title="Retrieve information">
        <ThemedText>
          - Should be able to search for a location
        </ThemedText>
        <ThemedText>
          - Should be able to tap a location on the map UI and get things near the tap
        </ThemedText>
        <ThemedText>
          - Relevant information should display for any location tapped on
        </ThemedText>
        <ThemedText>
          - Should be able to interact with information, e.g. save the location, add it to lists, add it to a route, etc.
        </ThemedText>
      </Collapsible>
      <Collapsible title="Create routes">
        <ThemedText>
          - Should have a create route button that sets up this process
        </ThemedText>
        <ThemedText>
          - In this mode, the user should be able to select a start and end position, and the AI should create a route based on that (which will be displayed)
        </ThemedText>
        <ThemedText>
          - The user should also be able to add intermediate positions on the tour that the AI will consider
        </ThemedText>
      </Collapsible>
    </ParallaxScrollView>
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