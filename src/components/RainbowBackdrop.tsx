import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

// A giant version of Rainbow.png behind the whole page: the top-right cloud sits at the top of
// the page, the bottom-left cloud at the very bottom.
//
// The page is far taller than the drawing, so it has to stretch vertically. To keep the clouds
// (and their eyes) undistorted, the rows containing them are drawn at their natural aspect
// ratio and only the plain band in between stretches. That band is drawn as many thin strips
// whose stretch eases in and out (a sin² profile), so the rainbow bends smoothly instead of
// kinking where the stretch starts.
const RAINBOW = require('../../assets/media/design_assets/Rainbow.png');
const SRC_W = 1601;
const SRC_H = 1243;
// Source rows between the clouds: above BAND_TOP is the top cloud, below BAND_BOTTOM the bottom one.
const BAND_TOP = 375;
const BAND_BOTTOM = 815;
const STRIPS = 24;

type Strip = { srcTop: number; srcBottom: number; top: number; height: number };

function layoutStrips(width: number, height: number): Strip[] {
  const s = width / SRC_W; // natural scale, used for the cloud rows
  const len = BAND_BOTTOM - BAND_TOP;
  const bandHeight = height - s * BAND_TOP - s * (SRC_H - BAND_BOTTOM);
  if (bandHeight <= s * len) {
    // Page no taller than the drawing: no stretch needed.
    return [{ srcTop: 0, srcBottom: SRC_H, top: 0, height: s * SRC_H }];
  }
  // Output height per source row is s + A·sin²(π·u) across the band, which integrates to bandHeight.
  const A = (2 * (bandHeight - s * len)) / len;
  const integral = (y: number) => {
    const d = y - BAND_TOP;
    return s * d + A * (d / 2 - (len / (4 * Math.PI)) * Math.sin((2 * Math.PI * d) / len));
  };

  const strips: Strip[] = [{ srcTop: 0, srcBottom: BAND_TOP, top: 0, height: s * BAND_TOP }];
  let top = s * BAND_TOP;
  for (let i = 0; i < STRIPS; i++) {
    const a = BAND_TOP + (len * i) / STRIPS;
    const b = BAND_TOP + (len * (i + 1)) / STRIPS;
    const h = integral(b) - integral(a);
    strips.push({ srcTop: a, srcBottom: b, top, height: h });
    top += h;
  }
  strips.push({ srcTop: BAND_BOTTOM, srcBottom: SRC_H, top, height: s * (SRC_H - BAND_BOTTOM) });
  return strips;
}

export default function RainbowBackdrop() {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      onLayout={(e) => setSize(e.nativeEvent.layout)}
    >
      {size
        ? layoutStrips(size.width, size.height).map((strip) => {
            const k = strip.height / (strip.srcBottom - strip.srcTop);
            // Each strip is a window onto the full image, scaled so only its rows show.
            // Overlap by 1px to avoid hairline gaps from rounding.
            return (
              <View
                key={strip.srcTop}
                style={[
                  styles.strip,
                  { top: Math.floor(strip.top), height: Math.ceil(strip.height) + 1 },
                ]}
              >
                <Image
                  source={RAINBOW}
                  contentFit="fill"
                  style={{
                    position: 'absolute',
                    left: 0,
                    width: size.width,
                    top: strip.top - Math.floor(strip.top) - strip.srcTop * k,
                    height: SRC_H * k,
                  }}
                />
              </View>
            );
          })
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    position: 'absolute',
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
});
