import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import MediaTile from './src/components/MediaTile';
import { gallery, hero } from './src/media';

const MAX_WIDTH = 1100;
const GAP = 24;

export default function App() {
  const { width } = useWindowDimensions();
  const columns = width >= 900 ? 3 : width >= 600 ? 2 : 1;
  const tileBasis = `${100 / columns}%` as const;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>pebble</Text>
          <Text style={styles.tagline}>A short line about what pebble does.</Text>
        </View>

        <MediaTile item={hero} autoPlay />

        <Text style={styles.sectionTitle}>Gallery</Text>
        <View style={styles.grid}>
          {gallery.map((item, i) => (
            <View key={i} style={[styles.cell, { width: tileBasis }]}>
              <MediaTile item={item} />
            </View>
          ))}
        </View>

        <Text style={styles.footer}>© {new Date().getFullYear()} pebble</Text>
      </View>
      <StatusBar style="dark" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 64,
  },
  container: {
    width: '100%',
    maxWidth: MAX_WIDTH,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontFamily: 'Arial',
    fontSize: 72,
    fontWeight: '700',
    color: '#111',
    letterSpacing: -2,
  },
  tagline: {
    fontFamily: 'Arial',
    fontSize: 18,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: 'Arial',
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginTop: 72,
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -GAP / 2,
  },
  cell: {
    paddingHorizontal: GAP / 2,
    marginBottom: GAP,
  },
  footer: {
    fontFamily: 'Arial',
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginTop: 64,
  },
});
