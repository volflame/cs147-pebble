import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { useRef, useState, type ComponentRef } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type GestureResponderEvent,
} from 'react-native';

import MediaTile from './src/components/MediaTile';
import NavBar, { NAV_HEIGHT, type SectionKey } from './src/components/NavBar';
import { PondRipples, TapRipple } from './src/components/Ripples';
import { Bubbles, Floating } from './src/components/Underwater';
import WatchingPebble from './src/components/WatchingPebble';
import ZoomOverlay, { usePebbleZoom } from './src/components/ZoomOverlay';
import { demo, gallery, hero, team } from './src/media';
import { TITLE_FONT, BODY_FONT, usePebbleFonts } from './src/fonts';

const MAX_WIDTH = 1100;
const GAP = 24;
// The pond with fish (2000×1499), and its rock cut out as a separate layer so the moving
// ripples can pass behind the rock. ROCK_BOX is where the rock sits in the pond, in source px;
// RIPPLE_AT is the centre of the rings.
const POND_IMAGE = require('./assets/pond-fish.png');
const POND_W = 2000;
const POND_H = 1499;
const ROCK = require('./assets/pond-fish-rock.png');
const ROCK_BOX = { x: 785, y: 625, width: 454, height: 238 };
const RIPPLE_AT = { x: 1011, y: 800 };
// The underwater painting, cropped and turned so the deep (dark) water is at the bottom.
const WATER = require('./assets/water.jpg');

// Pond blue from the app's splash screen.
const POND = '#5AB3DE';
// The deepest blue at the bottom of the underwater painting, so the team section carries it on.
const DEEP = '#225188';

export default function App() {
  const { width, height } = useWindowDimensions();
  const narrow = width < 600;
  const columns = width >= 900 ? 3 : width >= 600 ? 2 : 1;
  const screenHeight = Math.max(height - NAV_HEIGHT, 480);
  const pebbles = usePebbleZoom();
  const { zoom } = pebbles;
  const fontsLoaded = usePebbleFonts();

  // Nav links scroll to each screen. Positions are measured at click time (layout shifts as
  // images and the video load), relative to where the page is currently scrolled.
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const scrollY = useRef(0);
  const homeRef = useRef<ComponentRef<typeof View>>(null);
  const aboutRef = useRef<ComponentRef<typeof View>>(null);
  const processRef = useRef<ComponentRef<typeof View>>(null);
  const teamRef = useRef<ComponentRef<typeof View>>(null);
  // On web, read the live position: onScroll can lag behind while a smooth scroll is running.
  const currentScroll = () =>
    Platform.OS === 'web'
      ? ((scroll.current?.getScrollableNode() as unknown as HTMLElement | undefined)?.scrollTop ?? 0)
      : scrollY.current;
  const navigate = (key: SectionKey) =>
    ({ home: homeRef, about: aboutRef, process: processRef, team: teamRef })[key].current?.measureInWindow((_x, y) =>
      scroll.current?.scrollTo({ y: Math.max(0, currentScroll() + y - NAV_HEIGHT), animated: true }),
    );

  // Hold the first paint until the fonts are in, so text doesn't jump from a fallback font.
  if (!fontsLoaded) return <View style={styles.page} />;

  return (
    <View style={styles.page}>
      <ScrollView
        ref={scroll}
        style={styles.page}
        contentContainerStyle={styles.content}
        scrollEventThrottle={16}
        onScroll={(e) => {
          scrollY.current = e.nativeEvent.contentOffset.y;
        }}
      >
        <View ref={homeRef}>
          <HomeScreen width={width} minHeight={screenHeight} />
        </View>
        <View ref={aboutRef}>
          <ConceptScreen width={width} minHeight={screenHeight} />
        </View>

        {/* 3: the assignment pebbles, suspended in deepening water. */}
        <View ref={processRef} style={[styles.screen, styles.water, { minHeight: screenHeight }]}>
          <Image source={WATER} style={StyleSheet.absoluteFill} contentFit="fill" />
          <Bubbles height={screenHeight * 1.4} />
          <View style={styles.container}>
            <Text style={[styles.sectionTitle, styles.firstTitle, styles.onWater, styles.processTitle]}>our process</Text>
            <Text style={[styles.note, styles.onWater, styles.processNote]}>
              Our assignment slides so far. Tap a pebble to flip it over.
            </Text>
            <View style={[styles.floatGrid, narrow && styles.floatGridNarrow]}>
              {gallery.map((item, i) => (
                <View
                  key={i}
                  style={[
                    styles.floatCell,
                    columns === 1
                      ? { width: '78%', alignSelf: i % 2 ? 'flex-end' : 'flex-start' }
                      : {
                          width: `${100 / columns}%`,
                          // Stagger the pebbles so they read as scattered, not as a grid.
                          marginTop: OFFSETS[columns][i % OFFSETS[columns].length],
                        },
                  ]}
                >
                  <Floating seed={i}>
                    <MediaTile
                      item={item}
                      variant={i}
                      lightText
                      hidden={zoom?.index === i}
                      onPress={(rect) => pebbles.open(i, rect)}
                    />
                  </Floating>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 4: team, in the deep water the process section fades into. */}
        <View ref={teamRef} style={[styles.screen, styles.teamScreen]}>
          <View style={styles.container}>
            <Text style={[styles.sectionTitle, styles.firstTitle, styles.onWater, styles.teamTitle]}>
              meet the team
            </Text>
            <View style={[styles.grid, styles.teamGrid]}>
              {team.map((member) => (
                <View key={member.name} style={[styles.cell, styles.teamCell]}>
                  <Image source={member.photo} style={styles.headshot} contentFit="cover" />
                  <Text style={[styles.memberName, styles.onWater]}>
                    {member.name}
                  </Text>
                  <Text style={[styles.memberRole, styles.onWater]}>{member.role}</Text>
                  <Text style={[styles.memberDetails, styles.onDeep]}>
                    {member.details}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Footer band in the pond blue of the first screen. */}
        <View style={styles.footerBand}>
          <Text style={styles.footer}>© {new Date().getFullYear()} pebble</Text>
        </View>
        <StatusBar style="dark" />
      </ScrollView>
      <NavBar narrow={narrow} onNavigate={navigate} />
      {zoom ? (
        <ZoomOverlay
          key={zoom.index}
          zoom={zoom}
          item={gallery[zoom.index]}
          variant={zoom.index}
          onClose={pebbles.close}
          onClosed={pebbles.closed}
        />
      ) : null}
    </View>
  );
}

// Extra top margin per tile, by column count, so the floating pebbles sit at uneven heights.
const OFFSETS: Record<number, number[]> = {
  2: [0, 70, 20, 90, 10, 60],
  3: [0, 90, 30, 70, 0, 110],
};

/** 1: the pond. The stone rests in the middle with rings spreading out; taps make ripples too. */
function HomeScreen({ width, minHeight }: { width: number; minHeight: number }) {
  const ref = useRef<ComponentRef<typeof View>>(null);
  const [taps, setTaps] = useState<{ id: number; x: number; y: number }[]>([]);
  const nextId = useRef(0);
  // The pond covers the whole section (cropping the edges as needed), centred on the rock.
  const k = Math.max(width / POND_W, minHeight / POND_H);
  const pondW = POND_W * k;
  const pondH = POND_H * k;
  const offsetX = (width - pondW) / 2;
  const offsetY = (minHeight - pondH) / 2;
  const rock = {
    left: offsetX + ROCK_BOX.x * k,
    top: offsetY + ROCK_BOX.y * k,
    width: ROCK_BOX.width * k,
    height: ROCK_BOX.height * k,
  };

  const ripple = (e: GestureResponderEvent) => {
    const { pageX, pageY } = e.nativeEvent;
    ref.current?.measureInWindow((x, y) => {
      const id = nextId.current++;
      setTaps((list) => [...list, { id, x: pageX - x, y: pageY - y }]);
    });
  };

  return (
    <View ref={ref} style={[styles.screen, styles.pond, { height: minHeight }]}>
      <Image
        source={POND_IMAGE}
        style={{ position: 'absolute', left: offsetX, top: offsetY, width: pondW, height: pondH }}
        contentFit="fill"
        pointerEvents="none"
      />
      {/* Rings spread out under the rock, so they're drawn in section coordinates around it. */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <PondRipples
          x={offsetX + RIPPLE_AT.x * k}
          y={offsetY + RIPPLE_AT.y * k}
          width={rock.width * 1.15}
          height={rock.width * 0.42}
        />
        {/* Tap ripples sit under the rock too, so a tap on the rock spreads out from beneath it. */}
        {taps.map((t) => (
          <TapRipple
            key={t.id}
            x={t.x}
            y={t.y}
            onDone={() => setTaps((list) => list.filter((other) => other.id !== t.id))}
          />
        ))}
        <Image source={ROCK} style={[styles.rock, rock]} contentFit="fill" />
        <View style={[styles.rock, rock, styles.rockLabel]}>
          <Text style={[styles.heroTitle, { fontSize: rock.width * 0.2 }]}>pebble.</Text>
        </View>
        <View style={[styles.heroFooter, { top: minHeight * 0.86 }]}>
          <Text style={styles.heroTagline}>imperfection rocks.</Text>
        </View>
      </View>
      <Pressable style={StyleSheet.absoluteFill} onPress={ripple} accessible={false} />
    </View>
  );
}

/** 2: what pebble is, with Pebble 2 watching the cursor. */
function ConceptScreen({ width, minHeight }: { width: number; minHeight: number }) {
  const wide = width >= 760;
  return (
    <View style={[styles.screen, styles.concept, { minHeight }]}>
      <View style={styles.container}>
        <View style={[styles.conceptRow, wide && styles.conceptRowWide]}>
          <WatchingPebble width={wide ? 230 : 170} />
          <View style={[styles.conceptText, wide && styles.conceptTextWide]}>
            <Text style={styles.conceptTitle}>concept</Text>
            {CONCEPT.map(({ label, body }) => (
              <View key={label} style={styles.conceptItem}>
                <Text style={styles.conceptLabel}>{label}</Text>
                <Text style={styles.conceptBody}>{body}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.video}>
          <MediaTile item={hero} autoPlay />
        </View>
        <View style={[styles.video, styles.demoVideo]}>
          <MediaTile item={demo} />
        </View>
      </View>
    </View>
  );
}

// Draft copy: replace with the team's own words.
const CONCEPT = [
  {
    label: 'why',
    body: 'Life moves fast, and it is easy to forget to slow down. When we do make things, we tend to chase perfect instead of enjoying the process.',
  },
  {
    label: 'what',
    body: 'Ground yourself with daily drawing prompts. Make shared gardens, reach “mile-stones”, and take a break from the hustle and bustle.',
  },
  {
    label: 'values',
    body: 'Imperfection rocks. Small, steady moments of play. Growing together with friends.',
  },
];

const styles = StyleSheet.create({
  page: {
    flex: 1,
    // Sky blue sampled from the window drawing (design_assets/Untitled_Artwork-5.png).
    backgroundColor: '#B1CBE4',
  },
  content: {
    paddingTop: NAV_HEIGHT,
  },
  screen: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  container: {
    width: '100%',
    maxWidth: MAX_WIDTH,
  },

  // 1: pond
  pond: {
    backgroundColor: POND,
    paddingHorizontal: 0,
  },
  rock: {
    position: 'absolute',
  },
  rockLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  heroTitle: {
    fontFamily: TITLE_FONT,
    color: '#fff',
    letterSpacing: -1,
  },
  heroTagline: {
    fontFamily: TITLE_FONT,
    fontSize: 20,
    color: '#fff',
  },

  // 2: concept
  concept: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  conceptRow: {
    alignItems: 'center',
    gap: 32,
  },
  conceptRowWide: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 96,
  },
  conceptText: {
    width: '100%',
    maxWidth: 520,
  },
  conceptTextWide: {
    width: undefined,
    flexShrink: 1,
  },
  conceptTitle: {
    fontFamily: TITLE_FONT,
    fontSize: 56,
    color: '#111',
    letterSpacing: -1.5,
    marginBottom: 12,
  },
  conceptItem: {
    marginTop: 20,
  },
  conceptLabel: {
    fontFamily: TITLE_FONT,
    fontSize: 22,
    color: '#111',
  },
  conceptBody: {
    fontFamily: BODY_FONT,
    fontSize: 17,
    lineHeight: 26,
    color: '#444',
    marginTop: 4,
  },
  video: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    marginTop: 64,
  },
  demoVideo: {
    marginTop: 40,
  },

  // 3: underwater
  water: {
    paddingTop: 56,
    backgroundColor: '#5AB3DE',
  },
  floatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -GAP,
    marginTop: 16,
  },
  floatGridNarrow: {
    flexDirection: 'column',
    marginHorizontal: 0,
  },
  floatCell: {
    paddingHorizontal: GAP * 1.5,
    marginBottom: GAP * 1.5,
  },

  // 4: team
  teamScreen: {
    paddingTop: 32,
    paddingBottom: 48,
    backgroundColor: DEEP,
  },
  teamTitle: {
    fontSize: 32,
    textAlign: 'center',
  },
  onDeep: {
    color: '#C9DAEC',
  },
  sectionTitle: {
    fontFamily: TITLE_FONT,
    fontSize: 24,
    color: '#111',
    marginTop: 72,
    marginBottom: 8,
  },
  firstTitle: {
    marginTop: 0,
  },
  // White text over the underwater painting.
  onWater: {
    color: '#fff',
  },
  note: {
    fontFamily: BODY_FONT,
    fontSize: 15,
    color: '#444',
    marginBottom: 24,
  },
  processTitle: {
    fontSize: 48,
    marginBottom: 12,
  },
  processNote: {
    fontSize: 17,
    marginBottom: 72,
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
  teamGrid: {
    justifyContent: 'center',
    marginTop: 16,
  },
  teamCell: {
    width: 220,
    maxWidth: '100%',
    alignItems: 'center',
  },
  headshot: {
    width: '100%',
    aspectRatio: 368 / 436,
    borderRadius: 12,
    backgroundColor: '#f2f2f2',
  },
  memberName: {
    fontFamily: TITLE_FONT,
    fontSize: 16,
    color: '#111',
    marginTop: 12,
    textAlign: 'center',
  },
  memberRole: {
    fontFamily: BODY_FONT,
    fontSize: 15,
    marginTop: 2,
    textAlign: 'center',
  },
  memberDetails: {
    fontFamily: BODY_FONT,
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    textAlign: 'center',
  },
  footerBand: {
    width: '100%',
    paddingVertical: 24,
    backgroundColor: POND,
  },
  footer: {
    fontFamily: BODY_FONT,
    fontSize: 13,
    color: '#fff',
    textAlign: 'center',
  },
});
