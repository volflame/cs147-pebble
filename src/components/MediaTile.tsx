import { Asset } from 'expo-asset';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useRef, useState, type ComponentRef } from 'react';
import { Animated, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import type { MediaItem, MediaLink } from '../media';
import { TITLE_FONT, BODY_FONT } from '../fonts';

export type Rect = { x: number; y: number; width: number; height: number };

type Props = {
  item: MediaItem;
  autoPlay?: boolean;
  /** White caption and links, for tiles over the dark underwater background. */
  lightText?: boolean;
  /** Slides only: hidden while its zoomed copy is shown in the overlay. */
  hidden?: boolean;
  /** Slides only: clicked. `rect` is the tile's position in the window. */
  onPress?: (rect: Rect) => void;
  /** Slides only: which pebble drawing to use (0-3). */
  variant?: number;
};

// Every tile uses the same frame (Pebble 4's shape); each pebble drawing is contained in it.
const FRAME_ASPECT = 622 / 446;
// Where the slide sits on each pebble's grey body, as fractions of the frame: centre x/y and
// width. `x` is for the pebble as drawn; the flipped (mirrored) side uses 1 - x.
const PEBBLES = [
  { image: require('../../assets/media/design_assets/Pebble 1.png'), x: 0.51, y: 0.63, width: 0.4 },
  { image: require('../../assets/media/design_assets/Pebble 2.png'), x: 0.5, y: 0.53, width: 0.32 },
  { image: require('../../assets/media/design_assets/Pebble 3.png'), x: 0.49, y: 0.56, width: 0.26 },
  { image: require('../../assets/media/design_assets/Pebble 4.png'), x: 0.5, y: 0.62, width: 0.5 },
];
const HOVER_SCALE = 1.06;

/** The slide's box on the flipped-over pebble, as percentages of the frame. */
export function slideBox(variant: number) {
  const p = PEBBLES[variant % PEBBLES.length];
  const height = (p.width * FRAME_ASPECT * 9) / 16;
  return {
    left: `${(1 - p.x - p.width / 2) * 100}%`,
    top: `${(p.y - height / 2) * 100}%`,
    width: `${p.width * 100}%`,
    height: `${height * 100}%`,
  } as const;
}

export default function MediaTile({
  item,
  autoPlay = false,
  lightText,
  ...pebbleProps
}: Props) {
  if (item.type === 'slides')
    return <PebbleTile item={item} lightText={lightText} {...pebbleProps} />;

  const frame = (
    <View style={styles.frame}>
      {item.source == null ? (
        <Placeholder />
      ) : item.type === 'video' ? (
        <Video source={item.source} poster={item.poster} autoPlay={autoPlay && item.poster == null} />
      ) : (
        <Image source={item.source} style={styles.fill} contentFit="cover" />
      )}
    </View>
  );

  return (
    <View>
      {item.href != null ? (
        <Pressable onPress={() => Linking.openURL(resolveHref(item.href!))}>{frame}</Pressable>
      ) : (
        frame
      )}
      <Footer item={item} light={lightText} />
    </View>
  );
}

export function Footer({ item, light }: { item: MediaItem; light?: boolean }) {
  return (
    <>
      {item.caption ? <Text style={[styles.caption, light && styles.light]}>{item.caption}</Text> : null}
      {item.links?.length ? (
        <View style={styles.links}>
          {item.links.map((link) => (
            <LinkText key={link.label} link={link} light={light} />
          ))}
        </View>
      ) : null}
    </>
  );
}

// Slides sit face-down in the grid: just the pebble, which grows a little on hover.
// Clicking hands the tile to the zoom overlay (see ZoomOverlay), which lifts a copy to the
// middle of the screen and flips it over.
function PebbleTile({ item, lightText, hidden, onPress, variant = 0 }: Omit<Props, 'autoPlay'>) {
  const ref = useRef<ComponentRef<typeof View>>(null);
  const [scale] = useState(() => new Animated.Value(1));
  const grow = (to: number) =>
    Animated.spring(scale, { toValue: to, friction: 6, tension: 80, useNativeDriver: false }).start();

  return (
    <View ref={ref} style={{ opacity: hidden ? 0 : 1 }}>
      <Pressable
        onHoverIn={() => grow(HOVER_SCALE)}
        onHoverOut={() => grow(1)}
        onFocus={() => grow(HOVER_SCALE)}
        onBlur={() => grow(1)}
        onPress={() =>
          // Measure the whole tile (pebble + links) so the zoomed copy starts exactly on top of it.
          ref.current?.measureInWindow((x, y, width, height) => {
            grow(1);
            onPress?.({ x, y, width, height });
          })
        }
        accessibilityRole="button"
        accessibilityLabel={item.caption ? `Show ${item.caption}` : 'Show slides'}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <PebbleFaces item={item} progress={0} variant={variant} />
        </Animated.View>
      </Pressable>
      <Footer item={item} light={lightText} />
    </View>
  );
}

/** The pebble (front) and its mirrored underside with the slide on it (back). */
export function PebbleFaces({
  item,
  progress,
  variant = 0,
}: {
  item: MediaItem;
  variant?: number;
  /** 0 = face-down (pebble), 1 = flipped over (slide). */
  progress: Animated.Value | 0;
}) {
  const rotate = (from: number) =>
    progress === 0
      ? `${from}deg`
      : progress.interpolate({ inputRange: [0, 1], outputRange: [`${from}deg`, `${from + 180}deg`] });
  const frontStyle = { transform: [{ perspective: 1000 }, { rotateY: rotate(0) }] };
  const backStyle = { transform: [{ perspective: 1000 }, { rotateY: rotate(180) }] };
  const pebble = PEBBLES[variant % PEBBLES.length].image;
  const box = slideBox(variant);

  return (
    <View style={styles.flipFrame} pointerEvents="none">
      <Animated.View style={[styles.face, frontStyle]}>
        <Image source={pebble} style={styles.fill} contentFit="contain" />
      </Animated.View>
      {/* The underside is the same pebble mirrored, like a real flipped stone. */}
      <Animated.View style={[styles.face, backStyle]}>
        <Image source={pebble} style={[styles.fill, styles.mirrored]} contentFit="contain" />
        {item.source != null ? (
          <Image source={item.source} style={[styles.slide, box]} contentFit="cover" />
        ) : (
          <View style={[styles.slide, box, styles.comingSoon]}>
            <Text style={styles.comingSoonText}>coming soon</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

// Bundled assets (require()) resolve to a URL that already includes the web baseUrl.
export function resolveHref(href: number | string) {
  return typeof href === 'string' ? href : Asset.fromModule(href).uri;
}

function LinkText({ link, light }: { link: MediaLink; light?: boolean }) {
  const style = [styles.link, light && styles.light];
  const href = resolveHref(link.href);

  if (Platform.OS !== 'web') {
    return (
      <Text style={style} onPress={() => Linking.openURL(href)}>
        {link.label}
      </Text>
    );
  }

  // react-native-web renders Text with `href` as an <a>; these props aren't in RN's types.
  const webProps = {
    href,
    hrefAttrs: link.download
      ? { download: link.download }
      : { target: '_blank', rel: 'noopener noreferrer' },
  };
  return (
    <Text style={style} {...webProps}>
      {link.label}
    </Text>
  );
}

function Video({
  source,
  poster,
  autoPlay,
}: {
  source: number | string;
  poster?: number;
  autoPlay: boolean;
}) {
  const [started, setStarted] = useState(poster == null);
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = autoPlay;
    if (autoPlay) p.play();
  });

  return (
    <View style={styles.fill}>
      <VideoView player={player} style={styles.fill} contentFit="contain" nativeControls />
      {/* The poster covers the player until it's pressed (it isn't muted, so it plays with sound). */}
      {!started && poster != null ? (
        <Pressable
          style={[StyleSheet.absoluteFill, styles.poster]}
          onPress={() => {
            setStarted(true);
            player.play();
          }}
          accessibilityRole="button"
          accessibilityLabel="Play video"
        >
          <Image source={poster} style={StyleSheet.absoluteFill} contentFit="cover" />
          <View style={styles.playButton}>
            <View style={styles.playTriangle} />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

function Placeholder() {
  return (
    <View style={[styles.fill, styles.placeholder]}>
      <Text style={styles.placeholderText}>coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f2f2f2',
  },
  flipFrame: {
    width: '100%',
    userSelect: 'none',
    aspectRatio: FRAME_ASPECT,
  },
  face: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backfaceVisibility: 'hidden',
  },
  mirrored: {
    transform: [{ scaleX: -1 }],
  },
  // Positioned per pebble by slideBox() to sit inside the grey body, below the eyes.
  slide: {
    position: 'absolute',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#111',
    backgroundColor: '#fff',
  },
  comingSoon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoonText: {
    fontFamily: TITLE_FONT,
    fontSize: 9,
    color: '#999',
  },
  fill: {
    width: '100%',
    height: '100%',
  },
  // Play button in the corner, clear of the words in the poster frame.
  poster: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: 16,
    cursor: 'pointer',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // A CSS-border triangle pointing right, nudged so it looks centred in the circle.
  playTriangle: {
    width: 0,
    height: 0,
    marginLeft: 6,
    borderTopWidth: 14,
    borderBottomWidth: 14,
    borderLeftWidth: 22,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#fff',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontFamily: BODY_FONT,
    fontSize: 14,
    color: '#999',
    letterSpacing: 1,
  },
  caption: {
    fontFamily: BODY_FONT,
    fontSize: 18,
    color: '#555',
    marginTop: 8,
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 6,
  },
  light: {
    color: '#fff',
  },
  link: {
    fontFamily: TITLE_FONT,
    fontSize: 14,
    color: '#111',
    textDecorationLine: 'underline',
  },
});
