import type { ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';

/**
 * A white "highlighter" behind text that sits on the sky/rainbow background.
 * Must be nested inside a <Text>: nested Text renders inline, so the white follows each line
 * of words instead of filling the whole block.
 */
export default function Highlight({ children }: { children: ReactNode }) {
  return <Text style={styles.highlight}>{children}</Text>;
}

const styles = StyleSheet.create({
  highlight: {
    backgroundColor: '#fff',
  },
});
