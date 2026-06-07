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
    url: '/images/villa/pool-aerial.webp',
    alt: 'Aerial view of Villa Paradise Tahiti with infinity pool and tropical garden',
    category: 'exterior',
    width: 1400,
    height: 1050,
    caption: 'Aerial view — the infinity pool, the garden, and the lagoon in the background.',
  },
  {
    id: 'gal-ext-2',
    url: '/images/villa/exterior-terrace.webp',
    alt: 'Villa Paradise terrace with pool and lagoon view at golden hour',
    category: 'exterior',
    width: 1400,
    height: 788,
    caption: 'The sun-filled terrace — made for long Polynesian mornings.',
  },
  {
    id: 'gal-ext-3',
    url: '/images/villa/exterior-terrace-pool.webp',
    alt: 'Terrace and pool overlooking the lagoon with Moorea silhouette',
    category: 'exterior',
    width: 1400,
    height: 788,
    caption: 'Terrace and pool — the lagoon stretching to the horizon.',
  },
  {
    id: 'gal-ext-4',
    url: '/images/villa/exterior-terrace-deck.webp',
    alt: 'Outdoor deck with loungers and tropical garden',
    category: 'exterior',
    width: 1400,
    height: 788,
    caption: 'The outdoor deck — shaded and open to the tropical garden.',
  },

  // ── Interior ────────────────────────────────────────────────────────────
  {
    id: 'gal-int-1',
    url: '/images/villa/interior-kitchen.webp',
    alt: 'Fully equipped open kitchen of Villa Paradise Tahiti',
    category: 'interior',
    width: 1050,
    height: 1400,
    caption: 'The open kitchen — fully equipped for a private chef or your own creations.',
  },
  {
    id: 'gal-int-2',
    url: '/images/villa/interior-bar.webp',
    alt: 'Tropical cocktails at sunset over the lagoon',
    category: 'sunset',
    width: 1400,
    height: 1050,
    caption: 'The bar corner — perfect for sunset aperitifs.',
  },
  {
    id: 'gal-int-4',
    url: '/images/villa/interior-lounge.webp',
    alt: 'TV lounge with comfortable sofas and satellite TV',
    category: 'interior',
    width: 1050,
    height: 1400,
    caption: 'Cozy breakfast area.',
  },
  {
    id: 'gal-int-5',
    url: '/images/villa/interior-bathroom.webp',
    alt: 'Master bathroom shower at Villa Paradise Tahiti',
    category: 'interior',
    width: 1400,
    height: 1050,
    caption: 'The master bathroom — soaking tub and walk-in shower.',
  },
  {
    id: 'gal-int-7',
    url: '/images/villa/interior-dining-drone.webp',
    alt: 'Aerial view of the open-plan dining and living area at Villa Paradise Tahiti',
    category: 'interior',
    width: 1400,
    height: 788,
    caption: 'The dining and living area — open to the tropical garden.',
  },
  {
    id: 'gal-int-8',
    url: '/images/villa/interior-bedroom-desk.webp',
    alt: 'Master bedroom desk with tiaré blossoms at Villa Paradise Tahiti',
    category: 'interior',
    width: 1400,
    height: 1050,
    caption: 'The master bedroom desk — tiaré blossoms and morning light.',
  },
  {
    id: 'gal-int-9',
    url: '/images/villa/interior-bedroom-master.webp',
    alt: 'Master bedroom at Villa Paradise Tahiti',
    category: 'interior',
    width: 1400,
    height: 1050,
    caption: 'The master bedroom — pale wood and ocean light.',
  },
  {
    id: 'gal-int-10',
    url: '/images/villa/interior-bar-framed.webp',
    alt: 'Bar corner at Villa Paradise Tahiti',
    category: 'interior',
    width: 1400,
    height: 942,
    caption: 'The bar corner — crafted for long, leisurely evenings.',
  },
  {
    id: 'gal-int-11',
    url: '/images/villa/interior-bar-drone.webp',
    alt: 'Bar and living area open to the garden at Villa Paradise Tahiti',
    category: 'interior',
    width: 1400,
    height: 788,
    caption: 'Bar and living area — fully open to the tropical garden.',
  },
  {
    id: 'gal-int-12',
    url: '/images/villa/interior-dining2.webp',
    alt: 'Dining table set at Villa Paradise Tahiti',
    category: 'interior',
    width: 1050,
    height: 1400,
    caption: 'The dining table — set for long Polynesian evenings.',
  },
  {
    id: 'gal-int-13',
    url: '/images/villa/img-1212.webp',
    alt: 'Interior detail at Villa Paradise Tahiti',
    category: 'interior',
    width: 1050,
    height: 1400,
    caption: 'Villa Paradise Tahiti — every detail crafted for comfort.',
  },
  {
    id: 'gal-int-14',
    url: '/images/villa/img-3089.webp',
    alt: 'Interior detail at Villa Paradise Tahiti',
    category: 'interior',
    width: 1050,
    height: 1400,
    caption: 'Villa Paradise Tahiti — light, space, and Polynesian warmth.',
  },
  {
    id: 'gal-int-15',
    url: '/images/villa/interior-kitchen2.webp',
    alt: 'Kitchen detail at Villa Paradise Tahiti',
    category: 'interior',
    width: 914,
    height: 1920,
    caption: 'The kitchen — fully equipped for a private chef or your own creations.',
  },

  // ── Pool & garden ───────────────────────────────────────────────────────
  {
    id: 'gal-pool-1',
    url: '/images/villa/pool-panoramic.webp',
    alt: 'Panoramic view of the infinity pool deck at Villa Paradise Tahiti',
    category: 'pool',
    width: 1400,
    height: 394,
    caption: 'The pool deck — panoramic view over the lagoon.',
  },
  {
    id: 'gal-pool-2',
    url: '/images/villa/pool-aerial.webp',
    alt: 'Aerial drone view of the pool and villa at golden hour',
    category: 'pool',
    width: 1400,
    height: 1050,
    caption: 'Drone view — the infinity pool nestled in its tropical setting.',
  },
  {
    id: 'gal-pool-3',
    url: '/images/villa/pool-drone.webp',
    alt: 'Drone shot of pool with lagoon and Moorea in background',
    category: 'pool',
    width: 1400,
    height: 1050,
    caption: 'The pool with Moorea silhouetted on the horizon.',
  },
  {
    id: 'gal-pool-4',
    url: '/images/villa/pool-ground.webp',
    alt: 'View from the terrace towards the horizon at sunset',
    category: 'sunset',
    width: 1050,
    height: 1400,
    caption: 'From the terrace to the horizon at sunset.',
  },

  // ── Lagoon ──────────────────────────────────────────────────────────────
  {
    id: 'gal-lag-1',
    url: '/images/villa/lagoon-moorea.webp',
    alt: 'Moorea island seen from Tahiti across the lagoon at golden hour',
    category: 'lagoon',
    width: 1400,
    height: 933,
    caption: 'Moorea — the sister island 17 km away, visible from the villa.',
  },
  {
    id: 'gal-lag-2',
    url: '/images/villa/lagoon-aerial.webp',
    alt: 'Pool with turquoise waters and tropical surroundings',
    category: 'pool',
    width: 1400,
    height: 1050,
    caption: 'A pool with turquoise waters.',
  },
  {
    id: 'gal-lag-3',
    url: '/images/villa/lagoon-aerial2.webp',
    alt: "Bird's-eye drone view over the infinity pool",
    category: 'pool',
    width: 1400,
    height: 1050,
    caption: "Bird's-eye view over the pool.",
  },
  {
    id: 'gal-lag-4',
    url: '/images/villa/lagoon-pool.webp',
    alt: 'Champagne bucket beside the infinity pool with lagoon view',
    category: 'pool',
    width: 1050,
    height: 1400,
    caption: 'Champagne to enhance a swim in the pool.',
  },

  // ── Sunset ──────────────────────────────────────────────────────────────
  {
    id: 'gal-sun-1',
    url: '/images/villa/sunset-aerial.webp',
    alt: 'Aerial view of the pool surrounded by tropical vegetation and the lagoon',
    category: 'pool',
    width: 1400,
    height: 1050,
    caption: 'Between the pool, tropical vegetation, and the lagoon.',
  },
  {
    id: 'gal-sun-2',
    url: '/images/villa/sunset-terrace.webp',
    alt: 'Spacious open-plan dining room with tropical garden view',
    category: 'interior',
    width: 1400,
    height: 1050,
    caption: 'Spacious dining room.',
  },
  {
    id: 'gal-sun-3',
    url: '/images/villa/sunset-terrace2.webp',
    alt: 'Panoramic sunset from the villa terrace over the Pacific ocean',
    category: 'sunset',
    width: 1400,
    height: 1050,
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
  {
    id: 'gal-exp-5',
    url: '/images/villa/car.webp',
    alt: 'Private car included with your stay at Villa Paradise Tahiti',
    category: 'experiences',
    width: 1400,
    height: 1050,
    caption: 'Your private car — included throughout your stay to explore Tahiti at your own pace.',
  },
]

/** Convenience selector — used by chip filters in the gallery page. */
export function filterGalleryImages(
  category: GalleryCategory | 'all',
): GalleryImage[] {
  if (category === 'all') return galleryImages
  return galleryImages.filter((img) => img.category === category)
}
