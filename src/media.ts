// Drop product photos/videos into assets/media/ and reference them here.
// A `source` of null renders a labeled placeholder tile.
//
//   { type: 'image', source: require('../assets/media/hero.jpg'), caption: '...' }
//   { type: 'video', source: require('../assets/media/demo.mp4'), caption: '...' }
//   { type: 'video', source: 'https://example.com/demo.mp4', caption: '...' }

export type MediaItem = {
  type: 'image' | 'video';
  source: number | string | null;
  caption?: string;
};

export const hero: MediaItem = {
  type: 'video',
  source: null,
  caption: 'Product demo',
};

export const gallery: MediaItem[] = [
  { type: 'image', source: null, caption: 'Front view' },
  { type: 'image', source: null, caption: 'In hand' },
  { type: 'video', source: null, caption: 'Setup walkthrough' },
  { type: 'image', source: null, caption: 'Detail' },
  { type: 'image', source: null, caption: 'Packaging' },
  { type: 'video', source: null, caption: 'Everyday use' },
];
