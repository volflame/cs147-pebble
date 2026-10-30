import { Asset } from 'expo-asset';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import type { MediaItem, MediaLink } from '../media';

type Props = {
  item: MediaItem;
  autoPlay?: boolean;
};

export default function MediaTile({ item, autoPlay = false }: Props) {
  const frame = (
    <View style={styles.frame}>
      {item.source == null ? (
        <Placeholder />
      ) : item.type === 'video' ? (
        <Video source={item.source} autoPlay={autoPlay} />
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
      {item.caption ? <Text style={styles.caption}>{item.caption}</Text> : null}
      {item.links?.length ? (
        <View style={styles.links}>
          {item.links.map((link) => (
            <LinkText key={link.label} link={link} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

// Bundled assets (require()) resolve to a URL that already includes the web baseUrl.
function resolveHref(href: number | string) {
  return typeof href === 'string' ? href : Asset.fromModule(href).uri;
}

function LinkText({ link }: { link: MediaLink }) {
  const href = resolveHref(link.href);

  if (Platform.OS !== 'web') {
    return (
      <Text style={styles.link} onPress={() => Linking.openURL(href)}>
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
    <Text style={styles.link} {...webProps}>
      {link.label}
    </Text>
  );
}

function Video({ source, autoPlay }: { source: number | string; autoPlay: boolean }) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = autoPlay;
    if (autoPlay) p.play();
  });

  return <VideoView player={player} style={styles.fill} contentFit="contain" nativeControls />;
}

function Placeholder() {
  return (
    <View style={[styles.fill, styles.placeholder]}>
      <Text style={styles.placeholderText}>work in progress</Text>
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
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 6,
  },
  link: {
    fontFamily: 'Arial',
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    textDecorationLine: 'underline',
  },
});
