import { useEffect, useState } from 'react';
import {
  Animated,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import type { MediaItem } from '../media';
import { Footer, PebbleFaces, resolveHref, slideBox, type Rect } from './MediaTile';
import { TITLE_FONT } from '../fonts';

const MAX_SCALE = 2.5;
// Room kept clear at the top of the screen for the "go back" button.
const TOP_INSET = 72;

export type Zoom = { index: number; rect: Rect; open: boolean };

/** Which gallery pebble (if any) is brought to the centre. Only one at a time. */
export function usePebbleZoom() {
  const [zoom, setZoom] = useState<Zoom | null>(null);
  return {
    zoom,
    open(index: number, rect: Rect) {
      setZoom((z) => z ?? { index, rect, open: true });
    },
    /** Starts the trip back to the grid. */
    close() {
      setZoom((z) => (z ? { ...z, open: false } : z));
    },
    /** Called once the trip back finishes. */
    closed() {
      setZoom(null);
    },
  };
}

type Props = {
  zoom: Zoom;
  item: MediaItem;
  /** Which pebble drawing the tile uses. */
  variant: number;
  onClose: () => void;
  onClosed: () => void;
};

// Sits over the whole screen. The copy starts exactly on top of the grid tile, then moves to
// the centre, grows and flips over in one motion; "go back" plays it backwards.
export default function ZoomOverlay({ zoom, item, variant, onClose, onClosed }: Props) {
  const { width: winW, height: winH } = useWindowDimensions();
  const [progress] = useState(() => new Animated.Value(0));
  const [backHovered, setBackHovered] = useState(false);
  const { rect } = zoom;

  useEffect(() => {
    const anim = Animated.spring(progress, {
      toValue: zoom.open ? 1 : 0,
      friction: 9,
      tension: 50,
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (finished && !zoom.open) onClosed();
    });
    return () => anim.stop();
    // onClosed is recreated every render; only the open/closed flip should restart the spring.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom.open, progress]);

  // Escape also goes back (web).
  useEffect(() => {
    if (Platform.OS !== 'web' || !zoom.open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom.open, onClose]);

  const availH = winH - TOP_INSET * 2;
  const scale = Math.min((winW * 0.9) / rect.width, availH / rect.height, MAX_SCALE);
  const dx = winW / 2 - (rect.x + rect.width / 2);
  const dy = winH / 2 - (rect.y + rect.height / 2);
  const lerp = (to: number, from = 0) =>
    progress.interpolate({ inputRange: [0, 1], outputRange: [from, to] });

  return (
    // The backdrop catches all pointer/scroll input, so the page stays put while a pebble is out.
    <View style={StyleSheet.absoluteFill} pointerEvents={zoom.open ? 'auto' : 'none'}>
      {/* Tapping anywhere but the slide (or the links under it) goes back. */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: lerp(1) }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessible={false} />
      </Animated.View>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.tile,
          {
            left: rect.x,
            top: rect.y,
            width: rect.width,
            transform: [{ translateX: lerp(dx) }, { translateY: lerp(dy) }, { scale: lerp(scale, 1) }],
          },
        ]}
      >
        <View pointerEvents="box-none">
          <PebbleFaces item={item} progress={progress} variant={variant} />
          {item.href != null ? (
            <Pressable
              style={[styles.slideHit, slideBox(variant)]}
              onPress={() => Linking.openURL(resolveHref(item.href!))}
              accessibilityRole="button"
              accessibilityLabel={item.caption ? `Open ${item.caption}` : 'Open slides'}
            />
          ) : null}
        </View>
        <View pointerEvents="box-none">
          <Footer item={item} />
        </View>
      </Animated.View>
      <Animated.View style={[styles.backWrap, { opacity: lerp(1) }]}>
        <Pressable
          onPress={onClose}
          onHoverIn={() => setBackHovered(true)}
          onHoverOut={() => setBackHovered(false)}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={[styles.backButton, backHovered && styles.backButtonHovered]}
        >
          <Text style={[styles.backText, backHovered && styles.backTextHovered]}>← go back</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  tile: {
    position: 'absolute',
  },
  slideHit: {
    position: 'absolute',
    cursor: 'pointer',
  },
  backWrap: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#111',
    backgroundColor: '#fff',
  },
  backButtonHovered: {
    backgroundColor: '#111',
  },
  backText: {
    fontFamily: TITLE_FONT,
    fontSize: 16,
    color: '#111',
  },
  backTextHovered: {
    color: '#fff',
  },
});
