import { Image } from 'expo-image';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

// Pebble 2 with its pupils painted out (assets/pebble-2-eyeless.png, made from
// design_assets/Pebble 2.png). The pupils are drawn on top and turn towards the mouse (web).
const BODY = require('../../assets/pebble-2-eyeless.png');
// Hand-drawn pupil (cropped tight to the ink, 51×53).
const PUPIL = require('../../assets/pupil.png');
const SRC_W = 330;
const SRC_H = 507;

// Eye sockets in source px: centre and the inner radius of the white eyeball.
// `r` is the pupil radius.
const EYES = [
  { cx: 111, cy: 94, rx: 32, ry: 39, r: 31 },
  { cx: 224, cy: 96, rx: 37, ry: 37, r: 34 },
];
// Pupils nearly fill the eye, like the original drawing: the white shows as a thin crescent
// on the side facing away from the mouse. They may slide a little under the black outline.
const OVERLAP = 6;
// How far (in screen px) the mouse must be before the pupils reach the edge of the eye.
const REACH = 180;

type Offset = { x: number; y: number };
const CENTRED: Offset[] = EYES.map(() => ({ x: 0, y: 0 }));

export default function WatchingPebble({ width }: { width: number }) {
  const ref = useRef<ComponentRef<typeof View>>(null);
  const [look, setLook] = useState<Offset[]>(CENTRED);
  const k = width / SRC_W;

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    let mouse: { x: number; y: number } | null = null;
    let frame = 0;

    const update = () => {
      frame = 0;
      // react-native-web hands back the DOM node as the ref.
      const el = ref.current as unknown as HTMLElement | null;
      if (!el || !mouse) return;
      const box = el.getBoundingClientRect();
      const scale = box.width / SRC_W;
      setLook(
        EYES.map((eye) => {
          const dx = mouse!.x - (box.left + eye.cx * scale);
          const dy = mouse!.y - (box.top + eye.cy * scale);
          const dist = Math.hypot(dx, dy) || 1;
          const pull = Math.min(1, dist / REACH);
          return {
            x: (dx / dist) * pull * (eye.rx - eye.r + OVERLAP),
            y: (dy / dist) * pull * (eye.ry - eye.r + OVERLAP),
          };
        }),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onMove = (e: MouseEvent) => {
      mouse = { x: e.clientX, y: e.clientY };
      schedule();
    };

    window.addEventListener('mousemove', onMove);
    // The page scrolls inside a ScrollView, not the window; capture catches that scroll too,
    // so the eyes keep tracking a still mouse while the pebble moves under it.
    window.addEventListener('scroll', schedule, true);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', schedule, true);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <View ref={ref} style={{ width, height: (width * SRC_H) / SRC_W }} pointerEvents="none">
      <Image source={BODY} style={StyleSheet.absoluteFill} contentFit="fill" />
      {EYES.map((eye, i) => {
        const x = (eye.cx + look[i].x) * k;
        const y = (eye.cy + look[i].y) * k;
        return (
          <Image
            key={i}
            source={PUPIL}
            contentFit="fill"
            style={[
              styles.pupil,
              { left: x - eye.r * k, top: y - eye.r * k, width: eye.r * 2 * k, height: eye.r * 2 * k },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pupil: {
    position: 'absolute',
  },
});
