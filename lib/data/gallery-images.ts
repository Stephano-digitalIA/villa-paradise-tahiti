/**
 * Gallery image fixtures — Villa Paradise Tahiti.
 *
 * Real client photography stored in public/images/villa/.
 * Shape is data-source agnostic — can be swapped for a Supabase feed
 * without touching the GalleryGrid component.
 */

export type GalleryCategory =
  | 'interior'
  | 'exterior'
  | 'pool'
  | 'lagoon'
  | 'sunset'
  | 'experiences'

export interface GalleryImage {
  id: string
  url: string
  alt: string
  category: GalleryCategory
  width: number
  height: number
  caption?: string
}

export const galleryCategories: { value: GalleryCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'exterior', label: 'Exterior' },
  { value: 'interior', label: 'Interior' },
  { value: 'pool', label: 'Pool & Garden' },
  { value: 'lagoon', label: 'Lagoon' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'experiences', label: 'Experiences' },
]

export const galleryImages: GalleryImage[] = [
  // ── Exterior ────────────────────────────────────────────────────────────
  {
    id: 'gal-ext-1',
    url: '/images/villa/hero-aerial.jpg',
    alt: 'Aerial view of Villa Paradise Tahiti with lagoon and tropical garden',
    category: 'exterior',
    width: 4032,
    height: 3024,
    caption: 'Aerial view — the villa, the garden, and the lagoon in the background.',
  },
  {
    id: 'gal-ext-2',
    url: '/images/villa/exterior-terrace.png',
    alt: 'Villa Paradise terrace with pool and lagoon view at golden hour',
    category: 'exterior',
    width: 1920,
    height: 1080,
    caption: 'The sun-filled terrace — made for long Polynesian mornings.',
  },
  {
    id: 'gal-ext-3',
    url: '/images/villa/exterior-terrace-pool.png',
    alt: 'Terrace and pool overlooking the lagoon with Moorea silhouette',
    category: 'exterior',
    width: 1920,
    height: 1080,
    caption: 'Terrace and pool — the lagoon stretching to the horizon.',
  },
  {
    id: 'gal-ext-4',
    url: '/images/villa/exterior-terrace-deck.png',
    alt: 'Outdoor deck with loungers and tropical garden',
    category: 'exterior',
    width: 1920,
    height: 1080,
    caption: 'The outdoor deck — shaded and open to the tropical garden.',
  },

  // ── Interior ────────────────────────────────────────────────────────────
  {
    id: 'gal-int-1',
    url: '/images/villa/interior-kitchen.jpg',
    alt: 'Fully equipped open kitchen of Villa Paradise Tahiti',
    category: 'interior',
    width: 3024,
    height: 4032,
    caption: 'The open kitchen — fully equipped for a private chef or your own creations.',
  },
  {
    id: 'gal-int-2',
    url: '/images/villa/interior-bar.jpg',
    alt: 'Indoor bar area with tropical decor',
    category: 'interior',
    width: 1600,
    height: 1200,
    caption: 'The bar corner — perfect for sunset aperitifs.',
  },
  {
    id: 'gal-int-3',
    url: '/images/villa/interior-dining.jpg',
    alt: 'Dining room with large table and garden view at Villa Paradise',
    category: 'interior',
    width: 3024,
    height: 4032,
    caption: 'The dining room — fully open onto the tropical garden.',
  },
  {
    id: 'gal-int-4',
    url: '/images/villa/interior-lounge.jpg',
    alt: 'TV lounge with comfortable sofas and satellite TV',
    category: 'interior',
    width: 3024,
    height: 4032,
    caption: 'The TV lounge — DVD, satellite channels, and streaming.',
  },
  {
    id: 'gal-int-5',
    url: '/images/villa/interior-bathroom.jpg',
    alt: 'Master bathroom with soaking tub at Villa Paradise Tahiti',
    category: 'interior',
    width: 3024,
    height: 4032,
    caption: 'The master bathroom — soaking tub and walk-in shower.',
  },
  {
    id: 'gal-int-6',
    url: '/images/villa/interior-bathroom-outdoor.jpg',
    alt: 'Outdoor bathroom with tropical plants and hibiscus decor',
    category: 'interior',
    width: 1600,
    height: 1200,
    caption: 'Outdoor bathroom — surrounded by tropical plants under an open sky.',
  },

  // ── Pool & garden ───────────────────────────────────────────────────────
  {
    id: 'gal-pool-1',
    url: '/images/villa/pool-panoramic.png',
    alt: 'Panoramic view of the infinity pool deck at Villa Paradise Tahiti',
    category: 'pool',
    width: 3840,
    height: 1080,
    caption: 'The pool deck — panoramic view over the lagoon.',
  },
  {
    id: 'gal-pool-2',
    url: '/images/villa/pool-aerial.jpg',
    alt: 'Aerial drone view of the pool and villa at golden hour',
    category: 'pool',
    width: 4032,
    height: 3024,
    caption: 'Drone view — the infinity pool nestled in its tropical setting.',
  },
  {
    id: 'gal-pool-3',
    url: '/images/villa/pool-drone.jpg',
    alt: 'Drone shot of pool with lagoon and Moorea in background',
    category: 'pool',
    width: 4032,
    height: 3024,
    caption: 'The pool with Moorea silhouetted on the horizon.',
  },
  {
    id: 'gal-pool-4',
    url: '/images/villa/pool-ground.jpg',
    alt: 'Pool level view with clear turquoise water and tropical garden',
    category: 'pool',
    width: 3024,
    height: 4032,
    caption: 'Crystal-clear turquoise water — at garden level.',
  },

  // ── Lagoon ──────────────────────────────────────────────────────────────
  {
    id: 'gal-lag-1',
    url: '/images/villa/lagoon-moorea.png',
    alt: 'Moorea island seen from Tahiti across the lagoon at golden hour',
    category: 'lagoon',
    width: 2400,
    height: 1600,
    caption: 'Moorea — the sister island 17 km away, visible from the villa.',
  },
  {
    id: 'gal-lag-2',
    url: '/images/villa/lagoon-aerial.jpg',
    alt: 'Aerial view of the turquoise lagoon of Tahiti from above',
    category: 'lagoon',
    width: 4032,
    height: 3024,
    caption: 'The lagoon from above — fifty shades of blue.',
  },
  {
    id: 'gal-lag-3',
    url: '/images/villa/lagoon-aerial2.jpg',
    alt: 'Drone photo of Tahiti lagoon at sunset with reef and deep blue ocean',
    category: 'lagoon',
    width: 4032,
    height: 3024,
    caption: 'The reef pass — where the lagoon meets the Pacific Ocean.',
  },
  {
    id: 'gal-lag-4',
    url: '/images/villa/lagoon-pool.jpg',
    alt: 'Pool and lagoon blending at the horizon at Villa Paradise',
    category: 'lagoon',
    width: 3024,
    height: 4032,
    caption: 'Pool and lagoon — an endless horizon.',
  },

  // ── Sunset ──────────────────────────────────────────────────────────────
  {
    id: 'gal-sun-1',
    url: '/images/villa/sunset-aerial.jpg',
    alt: 'Aerial sunset over Tahiti lagoon with warm orange sky',
    category: 'sunset',
    width: 4032,
    height: 3024,
    caption: 'Sunset over Tahiti — a daily ritual.',
  },
  {
    id: 'gal-sun-2',
    url: '/images/villa/sunset-terrace.jpg',
    alt: 'Villa Paradise terrace and dining area at twilight',
    category: 'sunset',
    width: 4032,
    height: 3024,
    caption: 'The terrace lit at dusk — golden hour.',
  },
  {
    id: 'gal-sun-3',
    url: '/images/villa/sunset-terrace2.jpg',
    alt: 'Panoramic sunset from the villa terrace over the Pacific ocean',
    category: 'sunset',
    width: 4032,
    height: 3024,
    caption: 'The sun setting over the Pacific — from your own terrace.',
  },

  // ── Experiences ────────────────────────────────────────────────────────
  {
    id: 'gal-exp-1',
    url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80',
    alt: 'Romantic candlelit dinner table on a lagoon pontoon',
    category: 'experiences',
    width: 1600,
    height: 1100,
    caption: 'Private dinner on the lagoon — five courses over the water.',
  },
  {
    id: 'gal-exp-2',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80',
    alt: 'Polynesian grilled fish served on banana leaves',
    category: 'experiences',
    width: 1600,
    height: 1100,
    caption: 'Polynesian BBQ on the terrace — lagoon fish and local produce.',
  },
  {
    id: 'gal-exp-3',
    url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=80',
    alt: 'Spa massage with tropical flowers and monoï oil',
    category: 'experiences',
    width: 1600,
    height: 2000,
    caption: 'Taurumi — traditional Polynesian massage in the comfort of the villa.',
  },
  {
    id: 'gal-exp-4',
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80',
    alt: 'Tropical waterfall deep in a Tahitian valley',
    category: 'experiences',
    width: 1600,
    height: 1100,
    caption: '4x4 island tour — hidden waterfalls deep in the valleys of Tahiti.',
  },
]

/** Convenience selector — used by chip filters in the gallery page. */
export function filterGalleryImages(
  category: GalleryCategory | 'all',
): GalleryImage[] {
  if (category === 'all') return galleryImages
  return galleryImages.filter((img) => img.category === category)
}
