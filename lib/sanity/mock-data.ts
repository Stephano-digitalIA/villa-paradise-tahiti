/**
 * Mock data — Villa Paradise Tahiti.
 *
 * Used whenever `NEXT_PUBLIC_SANITY_PROJECT_ID` is absent or equals `"mock"`.
 * Phase C will build out the public pages against these fixtures so the
 * site can be shipped before any real Sanity project exists.
 *
 * Conventions:
 *  - Every image uses a stable Unsplash URL with a query-string-encoded
 *    transformation list. Replace later by Sanity uploads.
 *  - Slugs and IDs follow the same shape Sanity will return so swapping is
 *    transparent for downstream code.
 *  - Long-form text fields (description, body, answer, policy) are plain
 *    Markdown strings, rendered via ReactMarkdown / PortableTextRenderer.
 */

import type {
  FAQ,
  Experience,
  Post,
  Review,
  Settings,
  Villa,
} from './types'

/* ---------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------- */

/** Build a Sanity-shaped image stub with an embedded URL for mock mode. */
function img(url: string, alt: string, caption?: string) {
  return {
    _type: 'image' as const,
    alt,
    caption,
    asset: { _type: 'reference' as const, _ref: `image-mock-${alt.slice(0, 8)}`, url },
    url,
  }
}

/** Build a Markdown heading or paragraph string. */
function block(text: string, style: 'normal' | 'h2' | 'h3' | 'blockquote' = 'normal'): string {
  switch (style) {
    case 'h2': return `## ${text}`
    case 'h3': return `### ${text}`
    case 'blockquote': return `> ${text}`
    default: return text
  }
}

/* ---------------------------------------------------------------------------
 * Villa
 * ------------------------------------------------------------------------- */

export const mockVilla: Villa = {
  _id: 'villa-paradise',
  _type: 'villa',
  name: 'Villa Paradise Tahiti',
  tagline: 'Your private paradise in the heart of French Polynesia.',
  description: [
    'Perched high above Tahiti on a peaceful mountainside at nearly 1,640 feet above sea level, Villa Paradise overlooks the vast Pacific Ocean in an atmosphere of rare calm and serenity. Here, the air feels fresher, purer, carried by the trade winds and the scent of tropical vegetation. From the very first light of day, the ocean\'s glow wraps the villa in an almost dreamlike softness.',
    'The infinity pool appears to merge seamlessly with the turquoise lagoon and the endless horizon of the Pacific, creating the illusion that the villa\'s waters and the ocean itself are one. From the terrace, the eye drifts effortlessly between the deep blue sky, Tahiti\'s lush mountain landscapes, and the ever-changing reflections of the sea.',
    'Inside, four light-filled bedrooms unfold around a spacious open-plan living area dressed in pale wood, woven rattan, and natural linen. Expansive floor-to-ceiling openings blur the boundaries between indoors and outdoors, welcoming natural light, cool mountain breezes, and uninterrupted ocean views into every space.',
    'Despite its feeling of secluded elevation, the lagoon and coastline remain only a few minutes away by car from the villa. This unique location offers the perfect balance between privacy, the refreshing climate of the mountains, and immediate access to the sea.',
    'Beyond the villa, our concierge curates the experiences that turn a stay into a memory: a sunset sail beyond the reef, a private chef preparing poisson cru on the terrace, or a guided dive through coral gardens. We handle every detail so you can simply be here.',
  ].join('\n\n'),
  heroVideoUrl: '/images/villa/hero.mp4',
  heroImage: img(
    '/images/villa/hero-villa.png',
    'Panoramic view of the deck and infinity pool at Villa Paradise Tahiti',
  ),
  gallery: [
    {
      ...img(
        '/images/villa/pool-aerial.jpg',
        'Piscine à débordement de Villa Paradise Tahiti vue du ciel',
        'La piscine à débordement se fond dans le lagon au coucher du soleil.',
      ),
      category: 'pool',
    },
    {
      ...img(
        '/images/villa/interior-dining.jpg',
        'Salle à manger ouverte sur le jardin tropical',
        "La salle à manger s'ouvre entièrement sur le jardin.",
      ),
      category: 'interior',
    },
    {
      ...img(
        '/images/villa/bedroom-master.jpg',
        'Chambre parentale avec lit king size à Villa Paradise Tahiti',
        'Se réveiller face au lagon chaque matin.',
      ),
      category: 'bedrooms',
    },
    {
      ...img(
        '/images/villa/exterior-terrace.png',
        'Terrasse lumineuse de la villa avec vue sur le lagon',
        'La terrasse enveloppe la villa de lumière naturelle.',
      ),
      category: 'exterior',
    },
    {
      ...img(
        '/images/villa/lagoon-moorea.png',
        'Vue sur Moorea depuis la Villa Paradise Tahiti',
        'Accès direct au lagon depuis la terrasse.',
      ),
      category: 'lagoon',
    },
    {
      ...img(
        '/images/villa/pool-night.avif',
        'Villa Paradise Tahiti illuminée au crépuscule',
        'La villa doucement éclairée après le coucher du soleil.',
      ),
      category: 'night',
    },
  ],
  specs: {
    bedrooms: 4,
    bathrooms: 4,
    maxGuests: 8,
    sizeSqm: 404,
    sizeSqft: 4349,
    hasPool: true,
    hasJacuzzi: true,
    hasAC: true,
    hasWifi: true,
    hasParking: true,
  },
  amenities: [
    'Private infinity pool',
    'High-speed Wi-Fi',
    'Air conditioning throughout',
    'Fully equipped chef kitchen',
    'Smart TV with streaming',
    'Outdoor dining terrace',
    'Tropical garden',
    'Beach & lagoon access',
    'Two kayaks included',
    'Snorkeling gear',
    'Private parking',
    'Daily housekeeping (on request)',
    'Welcome tropical basket',
    'Concierge service',
  ],
  location: {
    address: 'Punaauia Coast Road',
    city: 'Punaauia, Tahiti',
    country: 'French Polynesia',
    lat: -17.6373,
    lng: -149.6014,
  },
  seo: {
    metaTitle: 'Villa Paradise Tahiti — Luxury Beachfront Villa Rental',
    metaDescription:
      'A private 4-bedroom beachfront villa with infinity pool and lagoon views in Tahiti. Direct booking, best rate guaranteed.',
    ogImage: img(
      '/images/villa/hero-aerial.jpg',
      'Villa Paradise Tahiti',
    ),
  },
}

/* ---------------------------------------------------------------------------
 * Experiences (10)
 * ------------------------------------------------------------------------- */

const exp = (
  id: string,
  title: string,
  slug: string,
  category: Experience['category'],
  shortDescription: string,
  longDescription: string,
  duration: string,
  priceUSD: number,
  options: Partial<Omit<Experience, '_id' | '_type' | 'title' | 'slug' | 'category' | 'shortDescription' | 'description' | 'coverImage' | 'duration' | 'priceUSD'>> & {
    coverImageUrl: string
    coverImageAlt: string
  },
): Experience => ({
  _id: id,
  _type: 'experience',
  title,
  slug: { _type: 'slug', current: slug },
  category,
  shortDescription,
  description: longDescription,
  coverImage: img(options.coverImageUrl, options.coverImageAlt),
  duration,
  priceUSD,
  priceUnit: options.priceUnit ?? 'per_person',
  minGuests: options.minGuests,
  maxGuests: options.maxGuests,
  seasonal: options.seasonal ?? false,
  seasonStart: options.seasonStart,
  seasonEnd: options.seasonEnd,
  provider: options.provider,
  highlights: options.highlights,
  meetingPoint: options.meetingPoint,
  popularity: options.popularity ?? 50,
  featured: options.featured ?? false,
  active: options.active ?? true,
  seo: options.seo,
})

export const mockExperiences: Experience[] = [
  exp(
    'exp-lagoon-snorkeling',
    'Lagoon Snorkeling Tour',
    'lagoon-snorkeling-tour',
    'excursion',
    'Half-day guided snorkeling in crystal-clear lagoon waters with a marine biologist.',
    "Spend the morning gliding over coral gardens just minutes from the villa. Our marine biologist guide spots reef sharks, eagle rays and shoals of tropical fish, and shares the story of Tahiti's reef ecosystem along the way.",
    '4 hours',
    150,
    {
      coverImageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1600&q=80',
      coverImageAlt: 'Snorkeler swimming above coral reef in turquoise lagoon',
      minGuests: 2,
      maxGuests: 8,
      meetingPoint: 'Departs from villa',
      highlights: ['Equipment included', 'Marine biologist guide', 'Reef-safe sunscreen provided'],
      popularity: 95,
      featured: true,
    },
  ),
  exp(
    'exp-4x4-island',
    '4x4 Island Discovery Tour',
    '4x4-island-discovery',
    'adventure',
    "Full-day off-road adventure across Tahiti's highlands, waterfalls and hidden valleys.",
    "Climb the spine of Tahiti Nui with an expert local guide. Hidden waterfalls, archaeological sites and panoramic lookouts — plus a Polynesian lunch deep in the valley.",
    'Full day',
    195,
    {
      coverImageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80',
      coverImageAlt: 'Tropical waterfall in mountain rainforest',
      minGuests: 2,
      maxGuests: 6,
      meetingPoint: 'Pickup at villa',
      highlights: ['Lunch included', 'English-speaking guide', 'Waterfall swimming stop'],
      popularity: 80,
      featured: true,
    },
  ),
  exp(
    'exp-sunset-sailing',
    'Sunset Sailing Cruise',
    'sunset-sailing-cruise',
    'evening',
    'Two-hour champagne sunset sail along the west coast of Tahiti.',
    "Set sail aboard a 40-foot catamaran as the sun dips toward Moorea. Champagne, canapés, and a soundtrack of trade winds — the most photographed two hours of your trip.",
    '2 hours',
    175,
    {
      coverImageUrl: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1600&q=80',
      coverImageAlt: 'Catamaran sailing into a Tahitian sunset',
      minGuests: 2,
      maxGuests: 12,
      meetingPoint: 'Marina Taina, departs 5:30 PM',
      highlights: ['Champagne included', 'Canapés', 'Photographer on board (optional)'],
      popularity: 90,
      featured: true,
    },
  ),
  exp(
    'exp-private-dinner',
    'Private Lagoon Dinner',
    'private-lagoon-dinner',
    'dining',
    'Candlelit dinner served on a private platform floating in the lagoon.',
    "Five courses, two of you, the sound of the lagoon. Our chef cooks Polynesian-French fusion at a private table set on a wooden pontoon, lit by hurricane lamps and the stars.",
    '3 hours',
    320,
    {
      coverImageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80',
      coverImageAlt: 'Romantic candlelit dinner table on a lagoon pontoon',
      minGuests: 2,
      maxGuests: 4,
      meetingPoint: 'At villa, available Tue/Thu/Sat',
      highlights: ['Private chef', '5 courses', 'Wine pairing available'],
      popularity: 85,
      featured: true,
    },
  ),
  exp(
    'exp-whale-watching',
    'Whale Watching Expedition',
    'whale-watching',
    'excursion',
    'Three-hour boat trip to swim alongside migrating humpback whales (seasonal).',
    "From July to October, humpback whales migrate through French Polynesian waters to give birth. Join an eco-certified operator for a respectful, distanced encounter with these gentle giants — a moment most travelers never forget.",
    '3 hours',
    250,
    {
      coverImageUrl: 'https://images.unsplash.com/photo-1567880905822-56f8e06fe630?w=1600&q=80',
      coverImageAlt: 'Humpback whale breaching in clear ocean water',
      minGuests: 2,
      maxGuests: 8,
      seasonal: true,
      seasonStart: '2026-07-01',
      seasonEnd: '2026-10-31',
      meetingPoint: 'Marina Papeete',
      highlights: ['Eco-certified operator', 'Marine biologist on board', 'Snorkeling allowed (in season)'],
      popularity: 88,
    },
  ),
  exp(
    'exp-polynesian-bbq',
    'Polynesian BBQ Evening',
    'polynesian-bbq',
    'dining',
    'Traditional Tahitian feast prepared by a private chef on the villa terrace.',
    "Poisson cru, grilled mahi-mahi, taro, breadfruit, fresh fruit — the classics of Polynesian cuisine, cooked over the open fire on your terrace by a local chef who shares the stories behind every dish.",
    '3 hours',
    150,
    {
      coverImageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1600&q=80',
      coverImageAlt: 'Polynesian grilled fish on a banana leaf',
      minGuests: 4,
      maxGuests: 8,
      meetingPoint: 'At villa',
      highlights: ['Local chef included', 'All ingredients sourced locally', 'Traditional menu'],
      popularity: 75,
    },
  ),
  exp(
    'exp-stargazing',
    'Stargazing & Astronomy',
    'stargazing-astronomy',
    'cultural',
    'Night-sky session with a local guide and a telescope — Polynesian celestial navigation.',
    "Far from city lights, Tahiti's night sky is staggering. A local astronomer brings a high-power telescope and tells the story of how Polynesians once crossed the Pacific by reading the stars.",
    '2 hours',
    120,
    {
      coverImageUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1600&q=80',
      coverImageAlt: 'Milky Way over a tropical beach',
      minGuests: 2,
      maxGuests: 8,
      meetingPoint: 'At villa, available all year',
      highlights: ['Telescope provided', 'Local astronomer guide', 'Hot chocolate served'],
      popularity: 65,
    },
  ),
  exp(
    'exp-cultural-village',
    'Cultural Village Visit',
    'cultural-village-visit',
    'cultural',
    'Half-day guided tour of a traditional Polynesian village with artisan demonstrations.',
    "Step into a living museum of Polynesian culture: tapa-making, traditional dance, weaving, and a meal cooked in an ahimaa (underground oven). A deeply human experience, far from the resort circuit.",
    '4 hours',
    140,
    {
      coverImageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1600&q=80',
      coverImageAlt: 'Polynesian dancer in traditional dress',
      minGuests: 2,
      maxGuests: 10,
      meetingPoint: 'Hotel pickup',
      highlights: ['English-speaking guide', 'Traditional lunch included', 'Hands-on demonstrations'],
      popularity: 70,
    },
  ),
  exp(
    'exp-welcome-basket',
    'Welcome Tropical Basket',
    'welcome-tropical-basket',
    'dining',
    'Fresh tropical fruits, local jams, juices and pastries — delivered on arrival.',
    "Start the trip the right way: a basket of papaya, mango, passionfruit, fresh-baked croissants, local honey, vanilla coffee and a chilled bottle of pineapple juice waiting on the kitchen counter when you arrive.",
    'Arrival day',
    95,
    {
      coverImageUrl: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=1600&q=80',
      coverImageAlt: 'Tropical fruit basket on a marble counter',
      priceUnit: 'flat',
      meetingPoint: 'Delivered to villa',
      highlights: ['100% local produce', 'Vegetarian-friendly', 'Allergen-friendly options'],
      popularity: 55,
    },
  ),
  exp(
    'exp-spa-massage',
    'In-Villa Spa & Massage',
    'in-villa-spa-massage',
    'wellness',
    'Polynesian taurumi massage with monoï oil, performed on the villa terrace.',
    "Taurumi is the traditional Polynesian massage — slow, grounded, rhythmic — performed with warm Tahitian monoï oil. We bring the spa to the terrace so you never have to leave the villa.",
    '90 minutes',
    165,
    {
      coverImageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1600&q=80',
      coverImageAlt: 'Spa massage with tropical flowers and oil',
      maxGuests: 4,
      meetingPoint: 'At villa',
      highlights: ['Certified therapist', 'Monoï oil included', 'Couples option available'],
      popularity: 78,
    },
  ),
]

/* ---------------------------------------------------------------------------
 * Reviews (6)
 * ------------------------------------------------------------------------- */

export const mockReviews: Review[] = [
  {
    _id: 'review-1',
    _type: 'review',
    authorName: 'Sarah & Michael K.',
    authorLocation: 'Seattle, WA',
    rating: 5,
    title: 'The most magical week of our lives',
    body:
      "We spent eight days at Villa Paradise for our 10-year anniversary and it exceeded every expectation. The lagoon view from the master bedroom is something I still think about every morning. The owner arranged a private chef dinner that ended up being the meal of our lives. We'll be back.",
    stayDates: { from: '2025-09-12', to: '2025-09-20' },
    verified: true,
    source: 'airbnb',
    featured: true,
    publishedAt: '2025-09-25T10:00:00Z',
  },
  {
    _id: 'review-2',
    _type: 'review',
    authorName: 'Jennifer L.',
    authorLocation: 'Austin, TX',
    rating: 5,
    title: 'Better than the resorts — by a mile',
    body:
      "We had previously stayed at one of the big overwater bungalow resorts in Bora Bora. Villa Paradise was honestly a better experience. Private, peaceful, and the host was incredibly responsive on WhatsApp. The snorkeling tour they arranged was a highlight of the whole trip.",
    stayDates: { from: '2025-07-04', to: '2025-07-11' },
    verified: true,
    source: 'direct',
    featured: true,
    publishedAt: '2025-07-18T14:30:00Z',
  },
  {
    _id: 'review-3',
    _type: 'review',
    authorName: 'David & Emily R.',
    authorLocation: 'Brooklyn, NY',
    rating: 5,
    title: 'An unforgettable honeymoon',
    body:
      "From the welcome basket to the sunset sail, every detail was thought through. The villa is even more beautiful in person than in the photos. The infinity pool at sunset is unreal. We booked the private lagoon dinner for our last night and it was the perfect end to our honeymoon.",
    stayDates: { from: '2025-06-08', to: '2025-06-16' },
    verified: true,
    source: 'airbnb',
    featured: true,
    publishedAt: '2025-06-22T09:15:00Z',
  },
  {
    _id: 'review-4',
    _type: 'review',
    authorName: 'The Patel Family',
    authorLocation: 'Mountain View, CA',
    rating: 5,
    title: 'Family-friendly luxury',
    body:
      "Traveled with our two kids (8 and 11) and they LOVED it. The kayaks kept them busy for hours. The villa is spacious enough that everyone has their own space, and the kitchen was fully equipped for the few meals we cooked in. Highly recommend for families looking for a real escape.",
    stayDates: { from: '2025-08-15', to: '2025-08-22' },
    verified: true,
    source: 'vrbo',
    featured: true,
    publishedAt: '2025-08-29T16:45:00Z',
  },
  {
    _id: 'review-5',
    _type: 'review',
    authorName: 'Robert M.',
    authorLocation: 'Chicago, IL',
    rating: 4,
    title: 'Beautiful villa, attentive owner',
    body:
      "Villa is exactly as described. The location is quieter than I expected, which was perfect for us. Knock off one star for some minor wear on the outdoor furniture, but honestly nothing that affected our stay. The owner was reachable any time we needed.",
    stayDates: { from: '2025-05-10', to: '2025-05-15' },
    verified: true,
    source: 'google',
    featured: false,
    publishedAt: '2025-05-20T11:00:00Z',
  },
  {
    _id: 'review-6',
    _type: 'review',
    authorName: 'Christina & Mark H.',
    authorLocation: 'Portland, OR',
    rating: 5,
    title: 'Worth every dollar',
    body:
      "We compared this villa to two Bora Bora resorts and we're so glad we picked Villa Paradise. Booking directly with the owner saved us a meaningful amount, and the experience was more personal than any hotel. The whale-watching trip in August was the most memorable thing I've ever done.",
    stayDates: { from: '2025-08-01', to: '2025-08-09' },
    verified: false,
    source: 'direct',
    featured: true,
    publishedAt: '2025-08-15T08:30:00Z',
  },
]

/* ---------------------------------------------------------------------------
 * Blog Posts (3)
 * ------------------------------------------------------------------------- */

export const mockPosts: Post[] = [
  {
    _id: 'post-1',
    _type: 'post',
    title: 'Tahiti vs Bora Bora: Which Island Is Right for You?',
    slug: { _type: 'slug', current: 'tahiti-vs-bora-bora' },
    excerpt:
      'Both islands sit in French Polynesia, but the experience is wildly different. A practical comparison from someone who lives here.',
    coverImage: img(
      'https://images.unsplash.com/photo-1589197331516-4d84b72ebde3?auto=format&fit=crop&w=1600&q=80',
      'Aerial view of Bora Bora island and its turquoise lagoon, French Polynesia',
    ),
    body: [
      block('Tahiti vs Bora Bora — the question we get more than any other.', 'h2'),
      block(
        "If you're planning a trip to French Polynesia, you've probably gone down the rabbit hole of comparing islands. We get this question every week, so we wrote it all down.",
      ),
      block('Tahiti is the gateway island', 'h3'),
      block(
        "Every international flight lands in Tahiti, so most travelers spend at least a night here. But Tahiti is much more than a stopover — it's the cultural heart of French Polynesia, with the most diverse landscape and the most authentic local experiences.",
      ),
      block('Bora Bora is the postcard', 'h3'),
      block(
        "Bora Bora is what shows up when you Google 'overwater bungalow.' It's stunning, but it's also a 50-minute flight further, more expensive, and almost entirely a resort island. If you want service and seclusion, Bora Bora delivers. If you want culture and adventure, Tahiti wins.",
      ),
    ].join('\n\n'),
    author: {
      name: 'Léa Tahirua',
      bio: 'Local concierge and lifelong Tahiti resident.',
    },
    tags: ['Tahiti', 'Bora Bora', 'Travel Guides'],
    publishedAt: '2025-10-01T10:00:00Z',
    readingTimeMin: 7,
    seo: {
      metaTitle: 'Tahiti vs Bora Bora: A Practical Comparison (2026)',
      metaDescription:
        "Which French Polynesian island should you visit? A local's honest comparison of Tahiti and Bora Bora — cost, vibe, activities and more.",
    },
  },
  {
    _id: 'post-2',
    _type: 'post',
    title: '5 Things to Know Before Visiting French Polynesia',
    slug: { _type: 'slug', current: '5-things-before-visiting-french-polynesia' },
    excerpt:
      'Visas, currency, jet lag, weather, and the one thing every first-time visitor wishes they had known earlier.',
    coverImage: img(
      '/images/villa/lagoon-aerial.jpg',
      'Aerial drone view of the Tahiti lagoon and reef',
    ),
    body: [
      block(
        "After hosting hundreds of guests from the US over the past three years, the same five questions come up before nearly every stay. Here's everything you need to know.",
      ),
      block('1. US citizens do not need a visa', 'h3'),
      block(
        "If you hold a US passport, you can enter French Polynesia for up to 90 days without a visa. You will need a valid Electronic Travel Authorisation (ETA) — apply online at least 72 hours before departure.",
      ),
      block('2. The currency is the CFP Franc — but USD works in many places', 'h3'),
      block(
        "Officially the currency is the XPF (French Pacific Franc). Most hotels, restaurants and tour operators accept USD or credit cards. We accept USD for villa payments via Stripe or PayPal.",
      ),
      block('3. Jet lag is real, but in your favor', 'h3'),
      block(
        "Tahiti is in UTC-10, two hours behind Los Angeles. Flights from LAX land in the early morning — you'll arrive feeling like it's still yesterday, which means you have a full first day to enjoy.",
      ),
    ].join('\n\n'),
    author: {
      name: 'Léa Tahirua',
      bio: 'Local concierge and lifelong Tahiti resident.',
    },
    tags: ['Travel Tips', 'Practical', 'First Visit'],
    publishedAt: '2025-09-15T10:00:00Z',
    readingTimeMin: 9,
    seo: {
      metaTitle: '5 Things to Know Before Visiting French Polynesia',
      metaDescription:
        'Visas, currency, weather, jet lag and insider tips for first-time visitors to Tahiti and French Polynesia.',
    },
  },
  {
    _id: 'post-3',
    _type: 'post',
    title: 'Why Choose a Private Villa Over a Resort',
    slug: { _type: 'slug', current: 'private-villa-vs-resort-tahiti' },
    excerpt:
      "Resorts are easy. Villas are unforgettable. Here's the honest case for why couples and families are increasingly choosing private rentals in Tahiti.",
    coverImage: img(
      '/images/villa/exterior-terrace.png',
      'Villa Paradise Tahiti terrace with pool and lagoon view',
    ),
    body: [
      block(
        "If you've never booked a private villa, the appeal might not be obvious. After all, resorts have everything — restaurants, spa, beach service. So why are more and more travelers choosing villas instead?",
      ),
      block('The math: 15% less for the same week', 'h3'),
      block(
        "When you book directly with the owner of a private villa, you cut out the booking platform commissions (Airbnb takes around 15%). For a week-long stay, that often means $700-$1,500 in savings — money that goes much further on a sunset sail or a private chef dinner than on a hotel concierge.",
      ),
      block('The privacy nobody talks about', 'h3'),
      block(
        "A villa is genuinely yours for the week. No shared pool. No restaurant queues. No hotel staff knocking. Just you, your travel partners, and the lagoon.",
      ),
      block('The experiences a resort can\'t replicate', 'h3'),
      block(
        "Most resorts hand you a brochure of pre-packaged activities. A villa owner with a local network can arrange the things that make a trip: a chef cooking on your terrace, a private boat with the same captain your owner uses, a guide who'll show you waterfalls no tour bus reaches.",
      ),
    ].join('\n\n'),
    author: {
      name: 'Léa Tahirua',
      bio: 'Local concierge and lifelong Tahiti resident.',
    },
    tags: ['Villa', 'Comparison', 'Travel Tips'],
    publishedAt: '2025-08-20T10:00:00Z',
    readingTimeMin: 6,
    seo: {
      metaTitle: 'Why Choose a Private Villa Over a Resort in Tahiti',
      metaDescription:
        "The honest case for booking a private villa rental in Tahiti instead of a resort — cost, privacy and the experiences that matter.",
    },
  },
]

/* ---------------------------------------------------------------------------
 * FAQs (12)
 * ------------------------------------------------------------------------- */

export const mockFaqs: FAQ[] = [
  {
    _id: 'faq-1',
    _type: 'faq',
    category: 'tahiti',
    order: 10,
    question: 'Do US citizens need a visa to visit French Polynesia?',
    answer: 'No visa is required for US passport holders staying up to 90 days. However, you do need to apply online for an Electronic Travel Authorisation (ETA) at least 72 hours before departure.',
  },
  {
    _id: 'faq-2',
    _type: 'faq',
    category: 'tahiti',
    order: 20,
    question: 'When is the best time of year to visit Tahiti?',
    answer: 'May through October is the dry season — slightly cooler and the most popular. November through April is warmer and wetter, but also greener and less crowded. Whale watching season runs July through October.',
  },
  {
    _id: 'faq-3',
    _type: 'faq',
    category: 'tahiti',
    order: 30,
    question: 'How do I get from Faaa Airport to the villa?',
    answer: 'A complimentary airport transfer is included with your stay, provided by our partner taxi service. The ride from Faaʻa International Airport (PPT) to the villa takes approximately 25 minutes. We coordinate everything — just share your flight details and your driver will be waiting.',
  },
  {
    _id: 'faq-4',
    _type: 'faq',
    category: 'villa',
    order: 10,
    question: 'What is the maximum occupancy of the villa?',
    answer: 'The villa sleeps up to 8 guests across 4 bedrooms, each with a king-size bed. For larger groups, a studio annex is available on request (contact us before booking). A 5th bedroom option with its own bathroom and king bed is also available for a supplement — inquire for pricing.',
  },
  {
    _id: 'faq-5',
    _type: 'faq',
    category: 'villa',
    order: 20,
    question: 'Is the pool private?',
    answer: 'Yes — the infinity pool is for the exclusive use of villa guests. It is not shared with any other property.',
  },
  {
    _id: 'faq-6',
    _type: 'faq',
    category: 'villa',
    order: 30,
    question: 'Is there air conditioning in all rooms?',
    answer: 'Yes, all four bedrooms and the main living room have individually controlled air conditioning. The villa is also designed for cross-breeze ventilation.',
  },
  {
    _id: 'faq-7',
    _type: 'faq',
    category: 'booking',
    order: 10,
    question: 'How far in advance can I book?',
    answer: 'We accept bookings up to 18 months in advance. We recommend booking 4-6 months ahead for peak season (June-September and December-January).',
  },
  {
    _id: 'faq-8',
    _type: 'faq',
    category: 'booking',
    order: 20,
    question: 'What is the minimum stay?',
    answer: 'The default minimum stay is 5 nights. During peak season (June-September), a 7-night minimum applies. Reach out for shorter stays — we sometimes accommodate.',
  },
  {
    _id: 'faq-9',
    _type: 'faq',
    category: 'payment',
    order: 10,
    question: 'What payment methods are accepted?',
    answer: 'We accept credit/debit cards via Stripe (Visa, Mastercard, American Express) and PayPal. Both options charge in USD.',
  },
  {
    _id: 'faq-10',
    _type: 'faq',
    category: 'payment',
    order: 20,
    question: 'Is the 30% deposit refundable?',
    answer: 'If you cancel more than 60 days before check-in, 50% of the deposit is refunded. Between 30 and 60 days — and inside 30 days — the full amount is non-refundable. We strongly recommend travel insurance to cover unexpected cancellations.',
  },
  {
    _id: 'faq-11',
    _type: 'faq',
    category: 'experiences',
    order: 10,
    question: 'Do I have to book experiences in advance?',
    answer: 'We strongly recommend booking experiences at the same time as the villa — especially sunset sailing, private dinners and whale watching, which sell out 2-3 weeks ahead in peak season.',
  },
  {
    _id: 'faq-12',
    _type: 'faq',
    category: 'experiences',
    order: 20,
    question: 'What happens if weather cancels an outdoor experience?',
    answer: 'If the operator cancels for safety reasons (rough seas, storms), you receive a full refund or a free reschedule for another day of your stay. We handle the entire process for you.',
  },
  {
    _id: 'faq-13',
    _type: 'faq',
    category: 'booking',
    order: 30,
    question: 'Are check-in and check-out times flexible?',
    answer: 'Yes — we offer fully flexible check-in and check-out, 24 hours a day. We regularly welcome guests arriving on overnight flights at 3–5 AM and accommodate early departures just as easily. Simply share your flight details and we will coordinate everything.',
  },
  {
    _id: 'faq-14',
    _type: 'faq',
    category: 'villa',
    order: 40,
    question: 'What amenities does the villa have?',
    answer: 'The villa features a private heated infinity pool, 2 private jacuzzis, a very large terrace with panoramic views over the valley, ocean, and waterfall (in season). All 4 bedrooms have individually controlled air conditioning. A fully equipped chef kitchen, kayaks, snorkeling gear and a compact island car are also included.',
  },
]

/* ---------------------------------------------------------------------------
 * Settings (singleton)
 * ------------------------------------------------------------------------- */

export const mockSettings: Settings = {
  _id: 'settings',
  _type: 'settings',
  siteName: 'Villa Paradise Tahiti',
  siteDescription:
    'A private oceanfront villa in Tahiti, French Polynesia. Direct booking, lagoon views, curated experiences.',
  contactEmail: 'villaparadisetahiti@gmail.com',
  contactPhone: '+689 89 21 00 53',
  whatsappNumber: '68989210053',
  socialLinks: {
    instagram: 'https://instagram.com/villaparadisetahiti',
    facebook: 'https://facebook.com/villaparadisetahiti',
    pinterest: 'https://pinterest.com/villaparadisetahiti',
    youtube: '',
    tiktok: '',
  },
  defaultCancellationPolicy: 'Full refund if cancelled more than 60 days before check-in. 50% refund between 30 and 60 days. No refund inside 30 days. Travel insurance strongly recommended.',
  defaultMinNights: 5,
  defaultDepositPercent: 30,
  defaultNightlyRateUSD: 690,
  cleaningFeeUSD: 150,
  bookingTermsUrl: '/legal/terms',
}
