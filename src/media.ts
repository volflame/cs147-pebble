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
  /** Video only: still shown over the player until it's played. */
  poster?: number;
  caption?: string;
  links?: MediaLink[];
};

export const hero: MediaItem = {
  type: 'video',
  source: require('../assets/media/pebble-concept-video.mp4'),
  // Poster frame from 0:55 of the video.
  poster: require('../assets/media/thumbs/pebble-concept-video.jpg'),
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

const FIGMA_MID_FI =
  'https://www.figma.com/design/DzMXSPHI1qqDT2KwgDkvJE/Mid-Fi--Copy-?node-id=2157-29&t=n0a85OmrLEG5ujnc-1';

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
  {
    ...slides(
      'a6-mid-fi-prototype',
      'A6: Mid-Fi Prototype',
      require('../assets/media/thumbs/a6-mid-fi-prototype.jpg'),
      require('../assets/media/a6-mid-fi-prototype.pdf'),
    ),
    links: [
      { label: 'View slides', href: require('../assets/media/a6-mid-fi-prototype.pdf') },
      { label: 'Figma prototype', href: FIGMA_MID_FI },
      { label: 'README', href: require('../assets/media/a6-readme.pdf') },
      {
        label: 'Download PDF',
        href: require('../assets/media/a6-mid-fi-prototype.pdf'),
        download: 'a6-mid-fi-prototype.pdf',
      },
    ],
  },
  {
    type: 'slides',
    source: require('../assets/media/thumbs/heuristic-evaluation-synthesis.jpg'),
    href: require('../assets/media/heuristic-evaluation-synthesis.pdf'),
    caption: 'Heuristic Evaluation Synthesis',
    links: [
      { label: 'View PDF', href: require('../assets/media/heuristic-evaluation-synthesis.pdf') },
      {
        label: 'Download PDF',
        href: require('../assets/media/heuristic-evaluation-synthesis.pdf'),
        download: 'heuristic-evaluation-synthesis.pdf',
      },
      {
        label: 'Download spreadsheet (.xlsx)',
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- xlsx isn't a typed asset
        href: require('../assets/media/heuristic-evaluation-synthesis.xlsx'),
        download: 'heuristic-evaluation-synthesis.xlsx',
      },
    ],
  },
  // Not done yet: these flip over to a "coming soon" card. Give one a thumbnail `source`, an
  // `href` and `links` (see slides() above) once it's ready.
  { type: 'slides', source: null, caption: 'A8: High-Fi Prototype & README (coming soon)' },
  { type: 'slides', source: null, caption: 'A10: Poster, Pitch Slide & Script, Demo Video (coming soon)' },
  { type: 'slides', source: null, caption: 'A11: Final Report & Presentation Slides (coming soon)' },
];

// Shown under the concept video until it's ready. Set `source` to the video file (and add
// download/Vimeo links like `hero` has) to turn it into a player.
export const demo: MediaItem = {
  type: 'video',
  source: null,
  caption: 'Demo video: coming soon',
};

export type TeamMember = {
  name: string;
  role: string;
  details: string;
  photo: number;
};

export const team: TeamMember[] = [
  { name: 'Cherie C.', role: 'Design Lead', details: 'DataSci ’27', photo: require('../assets/media/headshots/cherie-c.png') },
  { name: 'Ryan L.', role: 'Programming Lead', details: 'CS ’28', photo: require('../assets/media/headshots/ryan-l.png') },
  { name: 'Brian L.', role: 'Product Lead', details: 'BioE ’26, CS ’27', photo: require('../assets/media/headshots/brian-l.png') },
];
