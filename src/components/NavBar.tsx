import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TITLE_FONT } from '../fonts';

export const NAV_HEIGHT = 56;

export type SectionKey = 'home' | 'about' | 'process' | 'team';
const LINKS: SectionKey[] = ['home', 'about', 'process', 'team'];

/** Fixed bar across the top: "pebble." on the left, section links on the right. */
export default function NavBar({ narrow, onNavigate }: { narrow: boolean; onNavigate: (to: SectionKey) => void }) {
  return (
    <View style={[styles.bar, narrow && styles.barNarrow]}>
      <Pressable onPress={() => onNavigate('home')} accessibilityRole="link" accessibilityLabel="pebble home">
        <Text style={styles.logo}>pebble.</Text>
      </Pressable>
      <View style={[styles.links, narrow && styles.linksNarrow]}>
        {LINKS.map((key) => (
          <NavLink key={key} label={key} narrow={narrow} onPress={() => onNavigate(key)} />
        ))}
      </View>
    </View>
  );
}

function NavLink({ label, narrow, onPress }: { label: string; narrow: boolean; onPress: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="link"
    >
      <Text style={[styles.link, narrow && styles.linkNarrow, hovered && styles.linkHovered]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: NAV_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#111',
  },
  barNarrow: {
    paddingHorizontal: 16,
  },
  logo: {
    fontFamily: TITLE_FONT,
    fontSize: 22,
    color: '#111',
    letterSpacing: -0.5,
  },
  links: {
    flexDirection: 'row',
    gap: 28,
  },
  linksNarrow: {
    gap: 14,
  },
  link: {
    fontFamily: TITLE_FONT,
    fontSize: 15,
    color: '#111',
  },
  linkNarrow: {
    fontSize: 13,
  },
  linkHovered: {
    textDecorationLine: 'underline',
  },
});
