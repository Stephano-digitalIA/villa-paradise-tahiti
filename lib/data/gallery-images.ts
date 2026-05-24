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
    caption: 'Vue aérienne — la villa, le jardin et le lagon en arrière-plan.',
  },
  {
    id: 'gal-ext-2',
    url: '/images/villa/exterior-terrace.png',
    alt: 'Villa Paradise terrace with pool and lagoon view at golden hour',
    category: 'exterior',
    width: 1920,
    height: 1080,
    caption: 'La terrasse lumineuse — conçue pour les longues matinées polynésiennes.',
  },
  {
    id: 'gal-ext-3',
    url: '/images/villa/exterior-terrace-pool.png',
    alt: 'Terrace and pool overlooking the lagoon with Moorea silhouette',
    category: 'exterior',
    width: 1920,
    height: 1080,
    caption: 'Terrasse et piscine — le lagon à perte de vue.',
  },
  {
    id: 'gal-ext-4',
    url: '/images/villa/exterior-terrace-deck.png',
    alt: 'Outdoor deck with loungers and tropical garden',
    category: 'exterior',
    width: 1920,
    height: 1080,
    caption: 'Le deck extérieur — ombragé et ouvert sur la nature.',
  },

  // ── Interior ────────────────────────────────────────────────────────────
  {
    id: 'gal-int-1',
    url: '/images/villa/interior-kitchen.jpg',
    alt: 'Fully equipped open kitchen of Villa Paradise Tahiti',
    category: 'interior',
    width: 3024,
    height: 4032,
    caption: 'La cuisine ouverte — équipée pour un chef privé ou vos propres créations.',
  },
  {
    id: 'gal-int-2',
    url: '/images/villa/interior-bar.jpg',
    alt: 'Indoor bar area with tropical decor',
    category: 'interior',
    width: 1600,
    height: 1200,
    caption: 'Le coin bar — pour les apéritifs avant le coucher du soleil.',
  },
  {
    id: 'gal-int-3',
    url: '/images/villa/interior-dining.jpg',
    alt: 'Dining room with large table and garden view at Villa Paradise',
    category: 'interior',
    width: 3024,
    height: 4032,
    caption: 'La salle à manger — ouverture totale sur le jardin tropical.',
  },
  {
    id: 'gal-int-4',
    url: '/images/villa/interior-lounge.jpg',
    alt: 'TV lounge with comfortable sofas and satellite TV',
    category: 'interior',
    width: 3024,
    height: 4032,
    caption: 'Le salon TV — DVD, chaînes satellite et streaming.',
  },
  {
    id: 'gal-int-5',
    url: '/images/villa/interior-bathroom.jpg',
    alt: 'Master bathroom with soaking tub at Villa Paradise Tahiti',
    category: 'interior',
    width: 3024,
    height: 4032,
    caption: "La salle de bain parentale — baignoire et douche à l'italienne.",
  },
  {
    id: 'gal-int-6',
    url: '/images/villa/interior-bathroom-outdoor.jpg',
    alt: 'Outdoor bathroom with tropical plants and hibiscus decor',
    category: 'interior',
    width: 1600,
    height: 1200,
    caption: 'Salle de bain extérieure — entre jardin et ciel ouvert.',
  },

  // ── Pool & garden ───────────────────────────────────────────────────────
  {
    id: 'gal-pool-1',
    url: '/images/villa/pool-panoramic.png',
    alt: 'Panoramic view of the infinity pool deck at Villa Paradise Tahiti',
    category: 'pool',
    width: 3840,
    height: 1080,
    caption: 'Le deck piscine — vue panoramique sur le lagon.',
  },
  {
    id: 'gal-pool-2',
    url: '/images/villa/pool-aerial.jpg',
    alt: 'Aerial drone view of the pool and villa at golden hour',
    category: 'pool',
    width: 4032,
    height: 3024,
    caption: 'Vue drone — la piscine à débordement dans son écrin tropical.',
  },
  {
    id: 'gal-pool-3',
    url: '/images/villa/pool-drone.jpg',
    alt: 'Drone shot of pool with lagoon and Moorea in background',
    category: 'pool',
    width: 4032,
    height: 3024,
    caption: "La piscine avec Moorea en silhouette à l'horizon.",
  },
  {
    id: 'gal-pool-4',
    url: '/images/villa/pool-ground.jpg',
    alt: 'Pool level view with clear turquoise water and tropical garden',
    category: 'pool',
    width: 3024,
    height: 4032,
    caption: "L'eau turquoise de la piscine — au niveau du jardin.",
  },

  // ── Lagoon ──────────────────────────────────────────────────────────────
  {
    id: 'gal-lag-1',
    url: '/images/villa/lagoon-moorea.png',
    alt: 'Moorea island seen from Tahiti across the lagoon at golden hour',
    category: 'lagoon',
    width: 2400,
    height: 1600,
    caption: "Moorea — l'île sœur à 17km, visible depuis la villa.",
  },
  {
    id: 'gal-lag-2',
    url: '/images/villa/lagoon-aerial.jpg',
    alt: 'Aerial view of the turquoise lagoon of Tahiti from above',
    category: 'lagoon',
    width: 4032,
    height: 3024,
    caption: 'Le lagon vu du ciel — 50 nuances de bleu.',
  },
  {
    id: 'gal-lag-3',
    url: '/images/villa/lagoon-aerial2.jpg',
    alt: 'Drone photo of Tahiti lagoon at sunset with reef and deep blue ocean',
    category: 'lagoon',
    width: 4032,
    height: 3024,
    caption: 'La passe du récif — entre lagon et océan Pacifique.',
  },
  {
    id: 'gal-lag-4',
    url: '/images/villa/lagoon-pool.jpg',
    alt: 'Pool and lagoon blending at the horizon at Villa Paradise',
    category: 'lagoon',
    width: 3024,
    height: 4032,
    caption: "Piscine et lagon — une ligne d'horizon sans fin.",
  },

  // ── Sunset ──────────────────────────────────────────────────────────────
  {
    id: 'gal-sun-1',
    url: '/images/villa/sunset-aerial.jpg',
    alt: 'Aerial sunset over Tahiti lagoon with warm orange sky',
    category: 'sunset',
    width: 4032,
    height: 3024,
    caption: 'Le coucher de soleil sur Tahiti — un rituel quotidien.',
  },
  {
    id: 'gal-sun-2',
    url: '/images/villa/sunset-terrace.jpg',
    alt: 'Villa Paradise terrace and dining area at twilight',
    category: 'sunset',
    width: 4032,
    height: 3024,
    caption: 'La terrasse éclairée au crépuscule — heure dorée.',
  },
  {
    id: 'gal-sun-3',
    url: '/images/villa/sunset-terrace2.jpg',
    alt: 'Panoramic sunset from the villa terrace over the Pacific ocean',
    category: 'sunset',
    width: 4032,
    height: 3024,
    caption: 'Le soleil se couche sur le Pacifique — depuis votre terrasse.',
  },

  // ── Experiences ────────────────────────────────────────────────────────
  {
    id: 'gal-exp-1',
    url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80',
    alt: 'Romantic candlelit dinner table on a lagoon pontoon',
    category: 'experiences',
    width: 1600,
    height: 1100,
    caption: "Dîner privé sur le lagon — cinq services sur l'eau.",
  },
  {
    id: 'gal-exp-2',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80',
    alt: 'Polynesian grilled fish served on banana leaves',
    category: 'experiences',
    width: 1600,
    height: 1100,
    caption: 'BBQ polynésien sur la terrasse — poisson du lagon et fruits locaux.',
  },
  {
    id: 'gal-exp-3',
    url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=80',
    alt: 'Spa massage with tropical flowers and monoï oil',
    category: 'experiences',
    width: 1600,
    height: 2000,
    caption: 'Taurumi — le massage traditionnel polynésien à domicile.',
  },
  {
    id: 'gal-exp-4',
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80',
    alt: 'Tropical waterfall deep in a Tahitian valley',
    category: 'experiences',
    width: 1600,
    height: 1100,
    caption: 'Tour 4x4 — cascades cachées dans les vallées de Tahiti.',
  },
]

/** Convenience selector — used by chip filters in the gallery page. */
export function filterGalleryImages(
  category: GalleryCategory | 'all',
): GalleryImage[] {
  if (category === 'all') return galleryImages
  return galleryImages.filter((img) => img.category === category)
}
