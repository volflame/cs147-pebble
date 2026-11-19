import { Image, type ImageStyle } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View, type StyleProp, type ViewStyle } from 'react-native';

// The "Div Container" drawing (a box with eyes peeking over the top), cut into a 9-slice so it
// can wrap content of any size: corners and eyes keep their size, edges stretch only along
// their length so the hand-drawn line keeps its thickness. Pieces live in assets/frame/ and
// were cropped from assets/media/design_assets/Div Container.png.
const PIECES = {
  tl: require('../../assets/frame/tl.png'),
  tr: require('../../assets/frame/tr.png'),
  bl: require('../../assets/frame/bl.png'),
  br: require('../../assets/frame/br.png'),
  topLeft: require('../../assets/frame/top-left.png'),
  topRight: require('../../assets/frame/top-right.png'),
  eyes: require('../../assets/frame/eyes.png'),
  bottom: require('../../assets/frame/bottom.png'),
  left: require('../../assets/frame/left.png'),
  right: require('../../assets/frame/right.png'),
};

// Source sizes in px: corners/edges are 60 thick, the eyes piece is 445×150.
const SCALE = 0.6;
const EDGE = 60 * SCALE;
const EYES_W = 445 * SCALE;
const EYES_H = 150 * SCALE;
// Space between the drawn line and the content; tighter on phones.
const PADDING = 32;
const PADDING_NARROW = 8;

export default function HandDrawnFrame({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const pad = useWindowDimensions().width >= 600 ? PADDING : PADDING_NARROW;
  return (
    <View
      style={[
        { paddingTop: EYES_H + pad, paddingBottom: EDGE + pad, paddingHorizontal: EDGE + pad },
        style,
      ]}
    >
      {/* Solid white inside the drawn line, so the frame reads as a card over the rainbow. */}
      <View style={styles.fill} pointerEvents="none" />
      <View style={styles.topRow} pointerEvents="none">
        <Piece source={PIECES.tl} style={styles.corner} />
        <Piece source={PIECES.topLeft} style={styles.hEdge} />
        <Piece source={PIECES.eyes} style={styles.eyes} />
        <Piece source={PIECES.topRight} style={styles.hEdge} />
        <Piece source={PIECES.tr} style={styles.corner} />
      </View>
      <Piece source={PIECES.left} style={[styles.vEdge, { left: 0 }]} />
      <Piece source={PIECES.right} style={[styles.vEdge, { right: 0 }]} />
      <View style={styles.bottomRow} pointerEvents="none">
        <Piece source={PIECES.bl} style={styles.corner} />
        <Piece source={PIECES.bottom} style={styles.hEdge} />
        <Piece source={PIECES.br} style={styles.corner} />
      </View>
      {children}
    </View>
  );
}

function Piece({ source, style }: { source: number; style: StyleProp<ImageStyle> }) {
  return <Image source={source} style={style} contentFit="fill" pointerEvents="none" />;
}

const styles = StyleSheet.create({
  // Insets keep the fill just inside the drawn line on each side (measured from the pieces).
  fill: {
    position: 'absolute',
    top: EYES_H - EDGE * 0.4,
    bottom: EDGE * 0.6,
    left: EDGE * 0.6,
    right: EDGE * 0.45,
    backgroundColor: '#fff',
  },
  topRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: EYES_H,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bottomRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: EDGE,
    flexDirection: 'row',
  },
  corner: {
    width: EDGE,
    height: EDGE,
  },
  hEdge: {
    flex: 1,
    height: EDGE,
  },
  eyes: {
    width: EYES_W,
    height: EYES_H,
  },
  vEdge: {
    position: 'absolute',
    top: EYES_H,
    bottom: EDGE,
    width: EDGE,
  },
});
