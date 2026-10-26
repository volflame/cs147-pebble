import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, Text, View } from 'react-native';

import type { MediaItem } from '../media';

type Props = {
  item: MediaItem;
  autoPlay?: boolean;
};

export default function MediaTile({ item, autoPlay = false }: Props) {
  return (
    <View>
      <View style={styles.frame}>
        {item.source == null ? (
          <Placeholder type={item.type} />
        ) : item.type === 'image' ? (
          <Image source={item.source} style={styles.fill} contentFit="cover" />
        ) : (
          <Video source={item.source} autoPlay={autoPlay} />
        )}
      </View>
      {item.caption ? <Text style={styles.caption}>{item.caption}</Text> : null}
    </View>
  );
}

function Video({ source, autoPlay }: { source: number | string; autoPlay: boolean }) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = autoPlay;
    if (autoPlay) p.play();
  });

  return (
    <VideoView
      player={player}
      style={styles.fill}
      contentFit="cover"
      nativeControls={!autoPlay}
    />
  );
}

function Placeholder({ type }: { type: MediaItem['type'] }) {
  return (
    <View style={[styles.fill, styles.placeholder]}>
      <Text style={styles.placeholderText}>{type === 'video' ? '▶ video' : 'image'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f2f2f2',
  },
  fill: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontFamily: 'Arial',
    fontSize: 14,
    color: '#999',
    letterSpacing: 1,
  },
  caption: {
    fontFamily: 'Arial',
    fontSize: 14,
    color: '#555',
    marginTop: 8,
  },
});
