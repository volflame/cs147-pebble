import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';

const NATIVE = Platform.OS !== 'web';
// Lighter blue strokes on the pond, sampled from the app's splash screen.
export const RIPPLE_COLOR = '#7FD0F7';

/**
 * Rings that keep spreading out from a point, like water around a resting stone.
 * Rendered centred on (x, y) inside a positioned parent. Rings are ellipses (the pond is seen
 * at an angle), `width` × `height` at the start of their trip.
 */
export function PondRipples({
  x,
  y,
  width,
  height,
  count = 4,
  period = 5200,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  count?: number;
  period?: number;
}) {
  const [t] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(t, { toValue: 1, duration: period, easing: Easing.linear, useNativeDriver: NATIVE }),
    );
    loop.start();
    return () => loop.stop();
  }, [t, period]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: count }, (_, i) => {
        // Each ring is the same loop shifted in time, so they leave the stone one after another.
        const p = Animated.modulo(Animated.add(t, i / count), 1);
        return (
          <Animated.View
            key={i}
            style={[
              styles.ring,
              {
                left: x - width / 2,
                top: y - height / 2,
                width,
                height,
                opacity: p.interpolate({ inputRange: [0, 0.12, 1], outputRange: [0, 0.9, 0] }),
                transform: [{ scale: p.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] }) }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

/** A single ripple that spreads out from a tap and then removes itself. */
export function TapRipple({ x, y, onDone }: { x: number; y: number; onDone: () => void }) {
  const [p] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(p, {
      toValue: 1,
      duration: 1600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: NATIVE,
    }).start(onDone);
    // onDone is a fresh closure each render; the ripple only ever runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {[0, 0.25].map((lag) => (
        <Animated.View
          key={lag}
          style={[
            styles.ring,
            styles.tapRing,
            {
              left: x - TAP_W / 2,
              top: y - TAP_H / 2,
              opacity: p.interpolate({
                inputRange: [0, lag, lag + 0.1, 1],
                outputRange: [0, 0, 1, 0],
                extrapolate: 'clamp',
              }),
              transform: [
                {
                  scale: p.interpolate({
                    inputRange: [0, lag, 1],
                    outputRange: [0.2, 0.2, 3.2 - lag * 4],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const TAP_W = 120;
const TAP_H = 48;

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    borderRadius: '50%',
    borderWidth: 4,
    borderColor: RIPPLE_COLOR,
  },
  tapRing: {
    width: TAP_W,
    height: TAP_H,
    borderWidth: 3,
  },
});
