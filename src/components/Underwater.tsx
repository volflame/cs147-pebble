import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, Platform, StyleSheet, View, type ViewStyle } from 'react-native';

const NATIVE = Platform.OS !== 'web';

/** Gently bobs and sways its children, as if suspended in water. `seed` varies the rhythm. */
export function Floating({ seed, children, style }: { seed: number; children: ReactNode; style?: ViewStyle }) {
  const [t] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const half = 2400 + ((seed * 617) % 1300);
    const ease = Easing.inOut(Easing.sin);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: half, easing: ease, useNativeDriver: NATIVE }),
        Animated.timing(t, { toValue: 0, duration: half, easing: ease, useNativeDriver: NATIVE }),
      ]),
    );
    // Stagger the start so neighbours don't move in lockstep.
    const timer = setTimeout(() => loop.start(), (seed * 433) % 1600);
    return () => {
      clearTimeout(timer);
      loop.stop();
    };
  }, [t, seed]);

  const tilt = seed % 2 ? 2 : -2;
  return (
    <Animated.View
      style={[
        style,
        {
          transform: [
            { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [-9, 9] }) },
            { rotate: t.interpolate({ inputRange: [0, 1], outputRange: [`${-tilt}deg`, `${tilt}deg`] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

// [left %, size px, seconds to rise, start delay ms]
const BUBBLES: [number, number, number, number][] = [
  [8, 10, 9, 0],
  [14, 6, 7, 2600],
  [31, 8, 11, 1200],
  [52, 12, 10, 4000],
  [67, 7, 8, 600],
  [74, 10, 12, 3100],
  [86, 6, 9, 1800],
  [93, 9, 10, 4800],
];

/** Small bubbles drifting up through a positioned parent. */
export function Bubbles({ height }: { height: number }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {BUBBLES.map(([left, size, secs, delay], i) => (
        <Bubble key={i} left={left} size={size} duration={secs * 1000} delay={delay} height={height} />
      ))}
    </View>
  );
}

function Bubble({
  left,
  size,
  duration,
  delay,
  height,
}: {
  left: number;
  size: number;
  duration: number;
  delay: number;
  height: number;
}) {
  const [p] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(p, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: NATIVE }),
    );
    const timer = setTimeout(() => loop.start(), delay);
    return () => {
      clearTimeout(timer);
      loop.stop();
    };
  }, [p, duration, delay]);

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          left: `${left}%`,
          width: size,
          height: size,
          opacity: p.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 0.8, 0.8, 0] }),
          transform: [
            { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [0, -height] }) },
            { translateX: p.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, 6, 0, -6, 0] }) },
          ],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    bottom: 0,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
});
