import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

function splitGeminiOutput(geminiOutput: string): string[] {
  const delimiter = "====================";
  return geminiOutput.split(delimiter).filter(text => text.trim().length > 0);
}

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
  const infoBlocks = useMemo(() => {
    return splitGeminiOutput(geminiOutput);
  }, [geminiOutput]);

  return (
    <Collapsible title={title} large={true}>
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
        <Collapsible title='Tour Guide Info:' large={false}>
          <ThemedView
            style={styles.infoScroll &&
              {
                backgroundColor: 'transparent',
                gap: 8,
                marginTop: 8,
                width: '100%',
              }
            }
          >
            {infoBlocks.map((block, index) => (
              <ThemedView key={index} style={styles.infoBlock}>
                <ThemedText style={styles.infoText}>{block}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        </Collapsible>
      </ThemedView>
    </Collapsible>
  );
}

export default function HistoryScreen() {
  // TODO: REPLACE DUMMY CONTENT WITH ACTUAL TOUR HISTORY LINKED TO GIVEN ACCOUNT

  const [historyBlocks, setHistoryBlocks] = useState<TourRecord[]>([
    {
      title: "Golden Gate Bridge Tour",
      startingPoint: "Pier 39, San Francisco",
      destination: "Sausalito Viewpoint",
      geminiOutput: "This tour features stunning views of the bay and Alcatraz...====================something something something something something something something something something something something something something something something"
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
      <ThemedText>View any of your previous tours here!</ThemedText>
      <ScrollView
        style={styles.infoScroll}
        contentContainerStyle={styles.infoScrollContent}
      >
        {historyBlocks.map((block, index) => ( // Each tour saved in history is put inside an infoBlock
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
    backgroundColor: 'transparent',
    gap: 8,
    paddingTop: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
  },
});