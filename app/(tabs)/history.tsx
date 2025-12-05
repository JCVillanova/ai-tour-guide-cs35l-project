import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

// Type needed to pass history info to respective history blocks
type TourRecord = {
  title: string;
  startingPoint: string;
  destination: string;
  geminiOutput: string;
};

function SavedTour({
  title,
  startingPoint,
  destination,
  geminiOutput,
}: TourRecord) {
  // TODO: DELIMIT GEMINI OUTPUT LIKE IN INDEX

  return (
    <Collapsible title={title}>
      <ThemedView style={styles.savedTourContent}>
        <ThemedText type='defaultSemiBold' style={styles.savedTourCategory}>
          Starting Point:
        </ThemedText>
        <ThemedText type='default'>
          {startingPoint}
        </ThemedText>
        <ThemedText type='defaultSemiBold' style={styles.savedTourCategory}>
          Destination:
        </ThemedText>
        <ThemedText type='default'>
          {destination}
        </ThemedText>
        <ThemedText type='defaultSemiBold' style={styles.savedTourCategory}>
          Tour Guide Info:
        </ThemedText>
        <ThemedText type='default'>
          {geminiOutput}
        </ThemedText>
      </ThemedView>
    </Collapsible>
  );
}

export default function HistoryScreen() {
  // TODO: REPLACE DUMMY CONTENT WITH ACTUAL TOUR HISTORY LINKED TO GIVEN ACCOUNT

  const [infoBlocks, setInfoBlocks] = useState<TourRecord[]>([
    {
      title: "Golden Gate Bridge Tour",
      startingPoint: "Pier 39, San Francisco",
      destination: "Sausalito Viewpoint",
      geminiOutput: "This tour features stunning views of the bay and Alcatraz..."
    },
    {
      title: "NYC Museum Hop",
      startingPoint: "Metropolitan Museum of Art",
      destination: "Museum of Modern Art (MoMA)",
      geminiOutput: "Explore the art history of New York with an itinerary designed by AI..."
    },
    
  ]);

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
      }
      headerDisplay={false}
      style={{}}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          History
        </ThemedText>
      </ThemedView>
      <ThemedText>This section should have various history features to access past user activity.</ThemedText>
      <ScrollView
        style={styles.infoScroll}
        contentContainerStyle={styles.infoScrollContent}
      >
        {infoBlocks.map((block, index) => ( // Each tour saved in history is put inside an infoBlock
          <ThemedView key={index} style={styles.infoBlock}>
            <SavedTour
              title={block.title}
              startingPoint={block.startingPoint}
              destination={block.destination}
              geminiOutput={block.geminiOutput}
            />
          </ThemedView>
        ))}
      </ScrollView>
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
  infoBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    backgroundColor: '#101010',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  infoScroll: {
    borderRadius: 12,
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
  savedTourCategory: {
    backgroundColor: 'transparent',
    fontSize: 18,
  },
  savedTourContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    gap: 8,
    paddingTop: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
  },
});