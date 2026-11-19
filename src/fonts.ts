import { MadimiOne_400Regular } from '@expo-google-fonts/madimi-one';
import { PoetsenOne_400Regular } from '@expo-google-fonts/poetsen-one';
import { useFonts } from 'expo-font';

/** Titles, headings, names, links and buttons. */
export const TITLE_FONT = 'MadimiOne_400Regular';
/** Body copy, captions and notes. */
export const BODY_FONT = 'PoetsenOne_400Regular';

/** True once both fonts are ready to draw. */
export function usePebbleFonts() {
  const [loaded] = useFonts({ MadimiOne_400Regular, PoetsenOne_400Regular });
  return loaded;
}
