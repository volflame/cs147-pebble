// Drop product photos/videos/slides into assets/media/ and reference them here.
// A `source` of null renders a "work in progress" placeholder tile.
//
//   { type: 'image', source: require('../assets/media/hero.jpg'), caption: '...' }
//   { type: 'video', source: require('../assets/media/demo.mp4'), caption: '...' }
//   { type: 'video', source: 'https://example.com/demo.mp4', caption: '...' }
//   { type: 'slides', source: require('../assets/media/thumbs/deck.jpg'),
//     href: require('../assets/media/deck.pdf'), caption: '...' }
//
// `href` makes the tile open that file/URL when tapped. `links` adds a row of
// links under the caption; `download` sets the saved filename.

export type MediaLink = {
  label: string;
  href: number | string;
  download?: string;
};

export type MediaItem = {
  type: 'image' | 'video' | 'slides';
  source: number | string | null;
  href?: number | string;
  caption?: string;
  links?: MediaLink[];
};

export const hero: MediaItem = {
  type: 'video',
  source: require('../assets/media/pebble-concept-video.mp4'),
  caption: 'Concept video',
  links: [
    {
      label: 'Download video',
      href: require('../assets/media/pebble-concept-video.mp4'),
      download: 'pebble-concept-video.mp4',
    },
    { label: 'Watch on Vimeo', href: 'https://vimeo.com/1236655488' },
  ],
};

function slides(name: string, caption: string, thumb: number, pdf: number): MediaItem {
  return {
    type: 'slides',
    source: thumb,
    href: pdf,
    caption,
    links: [{ label: 'View slides', href: pdf }, { label: 'Download PDF', href: pdf, download: `${name}.pdf` }],
  };
}

export const gallery: MediaItem[] = [
  slides(
    'a1-needfinding',
    'A1: Needfinding',
    require('../assets/media/thumbs/a1-needfinding.jpg'),
    require('../assets/media/a1-needfinding.pdf'),
  ),
  slides(
    'a2-povs-hmws',
    'A2: POVs, HMWs & Experience Prototypes',
    require('../assets/media/thumbs/a2-povs-hmws.jpg'),
    require('../assets/media/a2-povs-hmws.pdf'),
  ),
  slides(
    'a4-concept-video',
    'A4: Concept Video',
    require('../assets/media/thumbs/a4-concept-video.jpg'),
    require('../assets/media/a4-concept-video.pdf'),
  ),
  slides(
    'a5-prototype-testing',
    'A5: Prototype Testing',
    require('../assets/media/thumbs/a5-prototype-testing.jpg'),
    require('../assets/media/a5-prototype-testing.pdf'),
  ),
  { type: 'image', source: null, caption: 'Coming soon' },
  { type: 'image', source: null, caption: 'Coming soon' },
];
