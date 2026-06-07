-- ============================================================
-- seed.sql — Villa Paradise Tahiti
-- Données initiales extraites de lib/sanity/mock-data.ts
-- Toutes les images : URLs Unsplash placeholder
--   → remplacer par les URLs Supabase Storage après upload
-- ============================================================

-- ============================================================
-- SEED : settings
-- ============================================================
INSERT INTO settings (
  site_name,
  site_description,
  contact_email,
  contact_phone,
  whatsapp_number,
  social_instagram,
  social_facebook,
  social_pinterest,
  social_tiktok,
  default_min_nights,
  default_deposit_percent,
  default_nightly_rate_usd,
  cleaning_fee_usd,
  cancellation_policy,
  booking_terms_url,
  response_time_hours
) VALUES (
  'Villa Paradise Tahiti',
  'A private oceanfront villa in Tahiti, French Polynesia. Direct booking, lagoon views, curated experiences.',
  'hello@villaparadisetahiti.com',
  '+689 87 12 34 56',
  '68987123456',
  'https://instagram.com/villaparadisetahiti',
  'https://facebook.com/villaparadisetahiti',
  'https://pinterest.com/villaparadisetahiti',
  NULL,
  5,
  30.00,
  690.00,
  150.00,
  'Full refund if cancelled more than 60 days before check-in. 50% refund between 30 and 60 days. No refund inside 30 days. Travel insurance strongly recommended.',
  '/legal/terms',
  4
) ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED : villa
-- ============================================================
INSERT INTO villa (
  name,
  tagline,
  description,
  bedrooms,
  bathrooms,
  max_guests,
  size_sqm,
  size_sqft,
  has_pool,
  has_jacuzzi,
  has_ac,
  has_wifi,
  has_parking,
  amenities,
  address,
  city,
  country,
  latitude,
  longitude,
  hero_video_url,
  hero_image_url,
  hero_image_alt,
  seo_title,
  seo_description,
  og_image_url
) VALUES (
  'Villa Paradise Tahiti',
  'Your private paradise in the heart of French Polynesia.',
  'Set on a quiet stretch of black-sand coast, Villa Paradise opens directly onto the turquoise lagoon of Tahiti. Days begin with the soft hush of the reef, drift through hours under the bougainvilleas, and end with a Pacific sunset bleeding into the horizon.

Inside, four light-filled bedrooms unfold around an open-plan living space dressed in pale wood. Floor-to-ceiling windows pivot open onto the terrace, blurring the line between the villa and the garden beyond.

The infinity pool sits flush with the lagoon, framed by tropical palms and the silhouette of Moorea on the horizon. A private path winds through the garden down to the water, where kayaks and snorkeling gear wait under a thatched fare.

Beyond the villa, our concierge curates the experiences that turn a stay into a memory: a sunset sail past the reef, a private chef preparing poisson cru on the terrace, a guided dive through coral gardens. We handle every detail so you can simply be here.',
  4,
  3,
  8,
  320.00,
  3445.00,
  true,
  true,
  true,
  true,
  true,
  ARRAY[
    'High-speed Wi-Fi',
    'Air conditioning in all bedrooms',
    'Fully equipped chef''s kitchen',
    'Smart TV with streaming',
    'Private infinity pool',
    'Outdoor dining terrace',
    'Tropical garden',
    'Beach and lagoon access 10 min by car',
    'Two kayaks included',
    'Snorkelling equipment',
    'Free private parking',
    'Daily housekeeping (on request)',
    'Tropical welcome basket',
    'Concierge service'
  ],
  'Punaauia Coast Road',
  'Punaauia, Tahiti',
  'French Polynesia',
  -17.637300,
  -149.601400,
  'https://cdn.coverr.co/videos/coverr-tropical-beach-aerial-2606/1080p.mp4',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=2400&q=80',
  'Aerial view of Villa Paradise overlooking the turquoise lagoon of Tahiti',
  'Villa Paradise Tahiti — Luxury Beachfront Villa Rental',
  'A private 4-bedroom beachfront villa with infinity pool and lagoon views in Tahiti. Direct booking, best rate guaranteed.',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80'
) ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED : gallery_items
-- ============================================================
INSERT INTO gallery_items (image_url, alt, caption, category, sort_order, active) VALUES
  (
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600&q=80',
    'Infinity pool with lagoon view',
    'The infinity pool meets the lagoon at sunset.',
    'pool',
    1,
    true
  ),
  (
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80',
    'Open-plan living room with garden view',
    'The living room opens fully onto the tropical garden.',
    'interior',
    2,
    true
  ),
  (
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600&q=80',
    'Master bedroom with king bed and lagoon view',
    'Wake up to the lagoon every morning.',
    'bedrooms',
    3,
    true
  ),
  (
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&q=80',
    'Tropical garden and outdoor terrace',
    'The garden wraps around the villa in every direction.',
    'exterior',
    4,
    true
  ),
  (
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80',
    'View of the lagoon from the villa terrace',
    'Direct lagoon access from the terrace.',
    'lagoon',
    5,
    true
  ),
  (
    'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1600&q=80',
    'Villa at night with warm lighting',
    'The villa softly lit after sunset.',
    'night',
    6,
    true
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED : experiences
-- ============================================================
INSERT INTO experiences (
  slug, title, category, short_description, description,
  cover_image_url, cover_image_alt,
  price_usd, price_unit, min_guests, max_guests,
  duration, meeting_point, seasonal, season_start, season_end,
  highlights, popularity, featured, active, sort_order
) VALUES

  -- 1. Lagoon Snorkeling Tour
  (
    'lagoon-snorkeling-tour',
    'Lagoon Snorkeling Tour',
    'excursion',
    'Half-day guided snorkeling in crystal-clear lagoon waters with a marine biologist.',
    'Spend the morning gliding over coral gardens just minutes from the villa. Our marine biologist guide spots reef sharks, eagle rays and shoals of tropical fish, and shares the story of Tahiti''s reef ecosystem along the way.',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1600&q=80',
    'Snorkeler swimming above coral reef in turquoise lagoon',
    150.00, 'per_person', 2, 8,
    '4 hours', 'Departs from villa', false, NULL, NULL,
    ARRAY['Equipment included', 'Marine biologist guide', 'Reef-safe sunscreen provided'],
    95, true, true, 1
  ),

  -- 2. 4x4 Island Discovery Tour
  (
    '4x4-island-discovery',
    '4x4 Island Discovery Tour',
    'adventure',
    'Full-day off-road adventure across Tahiti''s highlands, waterfalls and hidden valleys.',
    'Climb the spine of Tahiti Nui with an expert local guide. Hidden waterfalls, archaeological sites and panoramic lookouts — plus a Polynesian lunch deep in the valley.',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80',
    'Tropical waterfall in mountain rainforest',
    195.00, 'per_person', 2, 6,
    'Full day', 'Pickup at villa', false, NULL, NULL,
    ARRAY['Lunch included', 'English-speaking guide', 'Waterfall swimming stop'],
    80, true, true, 2
  ),

  -- 3. Sunset Sailing Cruise
  (
    'sunset-sailing-cruise',
    'Sunset Sailing Cruise',
    'evening',
    'Two-hour champagne sunset sail along the west coast of Tahiti.',
    'Set sail aboard a 40-foot catamaran as the sun dips toward Moorea. Champagne, canapés, and a soundtrack of trade winds — the most photographed two hours of your trip.',
    'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1600&q=80',
    'Catamaran sailing into a Tahitian sunset',
    175.00, 'per_person', 2, 12,
    '2 hours', 'Marina Taina, departs 5:30 PM', false, NULL, NULL,
    ARRAY['Champagne included', 'Canapés', 'Photographer on board (optional)'],
    90, true, true, 3
  ),

  -- 4. Private Lagoon Dinner
  (
    'private-lagoon-dinner',
    'Private Lagoon Dinner',
    'dining',
    'Candlelit dinner served on a private platform floating in the lagoon.',
    'Five courses, two of you, the sound of the lagoon. Our chef cooks Polynesian-French fusion at a private table set on a wooden pontoon, lit by hurricane lamps and the stars.',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80',
    'Romantic candlelit dinner table on a lagoon pontoon',
    320.00, 'per_person', 2, 4,
    '3 hours', 'At villa, available Tue/Thu/Sat', false, NULL, NULL,
    ARRAY['Private chef', '5 courses', 'Wine pairing available'],
    85, true, true, 4
  ),

  -- 5. Whale Watching Expedition (seasonal)
  (
    'whale-watching',
    'Whale Watching Expedition',
    'excursion',
    'Three-hour boat trip to swim alongside migrating humpback whales (seasonal).',
    'From July to October, humpback whales migrate through French Polynesian waters to give birth. Join an eco-certified operator for a respectful, distanced encounter with these gentle giants — a moment most travelers never forget.',
    'https://images.unsplash.com/photo-1567880905822-56f8e06fe630?w=1600&q=80',
    'Humpback whale breaching in clear ocean water',
    250.00, 'per_person', 2, 8,
    '3 hours', 'Marina Papeete', true, '2026-07-01', '2026-10-31',
    ARRAY['Eco-certified operator', 'Marine biologist on board', 'Snorkeling allowed (in season)'],
    88, false, true, 5
  ),

  -- 6. Polynesian BBQ Evening
  (
    'polynesian-bbq',
    'Polynesian BBQ Evening',
    'dining',
    'Traditional Tahitian feast prepared by a private chef on the villa terrace.',
    'Poisson cru, grilled mahi-mahi, taro, breadfruit, fresh fruit — the classics of Polynesian cuisine, cooked over the open fire on your terrace by a local chef who shares the stories behind every dish.',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=1600&q=80',
    'Polynesian grilled fish on a banana leaf',
    150.00, 'per_person', 4, 8,
    '3 hours', 'At villa', false, NULL, NULL,
    ARRAY['Local chef included', 'All ingredients sourced locally', 'Traditional menu'],
    75, false, true, 6
  ),

  -- 7. Stargazing & Astronomy
  (
    'stargazing-astronomy',
    'Stargazing & Astronomy',
    'cultural',
    'Night-sky session with a local guide and a telescope — Polynesian celestial navigation.',
    'Far from city lights, Tahiti''s night sky is staggering. A local astronomer brings a high-power telescope and tells the story of how Polynesians once crossed the Pacific by reading the stars.',
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1600&q=80',
    'Milky Way over a tropical beach',
    120.00, 'per_person', 2, 8,
    '2 hours', 'At villa, available all year', false, NULL, NULL,
    ARRAY['Telescope provided', 'Local astronomer guide', 'Hot chocolate served'],
    65, false, true, 7
  ),

  -- 8. Cultural Village Visit
  (
    'cultural-village-visit',
    'Cultural Village Visit',
    'cultural',
    'Half-day guided tour of a traditional Polynesian village with artisan demonstrations.',
    'Step into a living museum of Polynesian culture: tapa-making, traditional dance, weaving, and a meal cooked in an ahimaa (underground oven). A deeply human experience, far from the resort circuit.',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1600&q=80',
    'Polynesian dancer in traditional dress',
    140.00, 'per_person', 2, 10,
    '4 hours', 'Hotel pickup', false, NULL, NULL,
    ARRAY['English-speaking guide', 'Traditional lunch included', 'Hands-on demonstrations'],
    70, false, true, 8
  ),

  -- 9. Welcome Tropical Basket
  (
    'welcome-tropical-basket',
    'Welcome Tropical Basket',
    'dining',
    'Fresh tropical fruits, local jams, juices and pastries — delivered on arrival.',
    'Start the trip the right way: a basket of papaya, mango, passionfruit, fresh-baked croissants, local honey, vanilla coffee and a chilled bottle of pineapple juice waiting on the kitchen counter when you arrive.',
    'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=1600&q=80',
    'Tropical fruit basket on a marble counter',
    95.00, 'flat', NULL, NULL,
    'Arrival day', 'Delivered to villa', false, NULL, NULL,
    ARRAY['100% local produce', 'Vegetarian-friendly', 'Allergen-friendly options'],
    55, false, true, 9
  ),

  -- 10. In-Villa Spa & Massage
  (
    'in-villa-spa-massage',
    'In-Villa Spa & Massage',
    'wellness',
    'Polynesian taurumi massage with monoï oil, performed on the villa terrace.',
    'Taurumi is the traditional Polynesian massage — slow, grounded, rhythmic — performed with warm Tahitian monoï oil. We bring the spa to the terrace so you never have to leave the villa.',
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1600&q=80',
    'Spa massage with tropical flowers and oil',
    165.00, 'per_person', NULL, 4,
    '90 minutes', 'At villa', false, NULL, NULL,
    ARRAY['Certified therapist', 'Monoï oil included', 'Couples option available'],
    78, false, true, 10
  )

ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED : reviews
-- ============================================================
INSERT INTO reviews (
  author_name, author_location, rating, title, body,
  stay_from, stay_to, verified, source, featured, published_at
) VALUES

  (
    'Sarah & Michael K.',
    'Seattle, WA',
    5,
    'The most magical week of our lives',
    'We spent eight days at Villa Paradise for our 10-year anniversary and it exceeded every expectation. The lagoon view from the master bedroom is something I still think about every morning. The owner arranged a private chef dinner that ended up being the meal of our lives. We''ll be back.',
    '2025-09-12', '2025-09-20',
    true, 'airbnb', true,
    '2025-09-25T10:00:00Z'
  ),

  (
    'Jennifer L.',
    'Austin, TX',
    5,
    'Better than the resorts — by a mile',
    'We had previously stayed at one of the big overwater bungalow resorts in Bora Bora. Villa Paradise was honestly a better experience. Private, peaceful, and the host was incredibly responsive on WhatsApp. The snorkeling tour they arranged was a highlight of the whole trip.',
    '2025-07-04', '2025-07-11',
    true, 'direct', true,
    '2025-07-18T14:30:00Z'
  ),

  (
    'David & Emily R.',
    'Brooklyn, NY',
    5,
    'An unforgettable honeymoon',
    'From the welcome basket to the sunset sail, every detail was thought through. The villa is even more beautiful in person than in the photos. The infinity pool at sunset is unreal. We booked the private lagoon dinner for our last night and it was the perfect end to our honeymoon.',
    '2025-06-08', '2025-06-16',
    true, 'airbnb', true,
    '2025-06-22T09:15:00Z'
  ),

  (
    'The Patel Family',
    'Mountain View, CA',
    5,
    'Family-friendly luxury',
    'Traveled with our two kids (8 and 11) and they LOVED it. The kayaks kept them busy for hours. The villa is spacious enough that everyone has their own space, and the kitchen was fully equipped for the few meals we cooked in. Highly recommend for families looking for a real escape.',
    '2025-08-15', '2025-08-22',
    true, 'vrbo', true,
    '2025-08-29T16:45:00Z'
  ),

  (
    'Robert M.',
    'Chicago, IL',
    4,
    'Beautiful villa, attentive owner',
    'Villa is exactly as described. The location is quieter than I expected, which was perfect for us. Knock off one star for some minor wear on the outdoor furniture, but honestly nothing that affected our stay. The owner was reachable any time we needed.',
    '2025-05-10', '2025-05-15',
    true, 'google', false,
    '2025-05-20T11:00:00Z'
  ),

  (
    'Christina & Mark H.',
    'Portland, OR',
    5,
    'Worth every dollar',
    'We compared this villa to two Bora Bora resorts and we''re so glad we picked Villa Paradise. Booking directly with the owner saved us a meaningful amount, and the experience was more personal than any hotel. The whale-watching trip in August was the most memorable thing I''ve ever done.',
    '2025-08-01', '2025-08-09',
    false, 'direct', true,
    '2025-08-15T08:30:00Z'
  )

ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED : posts
-- ============================================================
INSERT INTO posts (
  slug, title, excerpt, body,
  cover_image_url, cover_image_alt,
  author_name, author_bio,
  tags, reading_time_min, published_at,
  seo_title, seo_description
) VALUES

  (
    'tahiti-vs-bora-bora',
    'Tahiti vs Bora Bora: Which Island Is Right for You?',
    'Both islands sit in French Polynesia, but the experience is wildly different. A practical comparison from someone who lives here.',
    '## Tahiti vs Bora Bora — the question we get more than any other.

If you''re planning a trip to French Polynesia, you''ve probably gone down the rabbit hole of comparing islands. We get this question every week, so we wrote it all down.

### Tahiti is the gateway island

Every international flight lands in Tahiti, so most travelers spend at least a night here. But Tahiti is much more than a stopover — it''s the cultural heart of French Polynesia, with the most diverse landscape and the most authentic local experiences.

### Bora Bora is the postcard

Bora Bora is what shows up when you Google ''overwater bungalow.'' It''s stunning, but it''s also a 50-minute flight further, more expensive, and almost entirely a resort island. If you want service and seclusion, Bora Bora delivers. If you want culture and adventure, Tahiti wins.',
    'https://images.unsplash.com/photo-1542259009477-d625272157b7?w=1600&q=80',
    'Aerial view of a Polynesian island and lagoon',
    'Léa Tahirua',
    'Local concierge and lifelong Tahiti resident.',
    ARRAY['Tahiti', 'Bora Bora', 'Travel Guides'],
    7,
    '2025-10-01T10:00:00Z',
    'Tahiti vs Bora Bora: A Practical Comparison (2026)',
    'Which French Polynesian island should you visit? A local''s honest comparison of Tahiti and Bora Bora — cost, vibe, activities and more.'
  ),

  (
    '5-things-before-visiting-french-polynesia',
    '5 Things to Know Before Visiting French Polynesia',
    'Visas, currency, jet lag, weather, and the one thing every first-time visitor wishes they had known earlier.',
    'After hosting hundreds of guests from the US over the past three years, the same five questions come up before nearly every stay. Here''s everything you need to know.

### 1. US citizens do not need a visa

If you hold a US passport, you can enter French Polynesia for up to 90 days without a visa. You will need a valid Electronic Travel Authorisation (ETA) — apply online at least 72 hours before departure.

### 2. The currency is the CFP Franc — but USD works in many places

Officially the currency is the XPF (French Pacific Franc). Most hotels, restaurants and tour operators accept USD or credit cards. We accept USD for villa payments via Stripe or PayPal.

### 3. Jet lag is real, but in your favor

Tahiti is in UTC-10, two hours behind Los Angeles. Flights from LAX land in the early morning — you''ll arrive feeling like it''s still yesterday, which means you have a full first day to enjoy.',
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80',
    'Aerial view of Pacific island chain',
    'Léa Tahirua',
    'Local concierge and lifelong Tahiti resident.',
    ARRAY['Travel Tips', 'Practical', 'First Visit'],
    9,
    '2025-09-15T10:00:00Z',
    '5 Things to Know Before Visiting French Polynesia',
    'Visas, currency, weather, jet lag and insider tips for first-time visitors to Tahiti and French Polynesia.'
  ),

  (
    'private-villa-vs-resort-tahiti',
    'Why Choose a Private Villa Over a Resort',
    'Resorts are easy. Villas are unforgettable. Here''s the honest case for why couples and families are increasingly choosing private rentals in Tahiti.',
    'If you''ve never booked a private villa, the appeal might not be obvious. After all, resorts have everything — restaurants, spa, beach service. So why are more and more travelers choosing villas instead?

### The math: 15% less for the same week

When you book directly with the owner of a private villa, you cut out the booking platform commissions (Airbnb takes around 15%). For a week-long stay, that often means $700-$1,500 in savings — money that goes much further on a sunset sail or a private chef dinner than on a hotel concierge.

### The privacy nobody talks about

A villa is genuinely yours for the week. No shared pool. No restaurant queues. No hotel staff knocking. Just you, your travel partners, and the lagoon.

### The experiences a resort can''t replicate

Most resorts hand you a brochure of pre-packaged activities. A villa owner with a local network can arrange the things that make a trip: a chef cooking on your terrace, a private boat with the same captain your owner uses, a guide who''ll show you waterfalls no tour bus reaches.',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80',
    'Luxury villa living room with ocean view',
    'Léa Tahirua',
    'Local concierge and lifelong Tahiti resident.',
    ARRAY['Villa', 'Comparison', 'Travel Tips'],
    6,
    '2025-08-20T10:00:00Z',
    'Why Choose a Private Villa Over a Resort in Tahiti',
    'The honest case for booking a private villa rental in Tahiti instead of a resort — cost, privacy and the experiences that matter.'
  )

ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED : faqs
-- ============================================================
INSERT INTO faqs (question, answer, category, sort_order, active) VALUES

  -- Tahiti category
  (
    'Do US citizens need a visa to visit French Polynesia?',
    'No visa is required for US passport holders staying up to 90 days. However, you do need to apply online for an Electronic Travel Authorisation (ETA) at least 72 hours before departure.',
    'tahiti', 10, true
  ),
  (
    'When is the best time of year to visit Tahiti?',
    'May through October is the dry season — slightly cooler and the most popular. November through April is warmer and wetter, but also greener and less crowded. Whale watching season runs July through October.',
    'tahiti', 20, true
  ),
  (
    'How do I get from Faaa Airport to the villa?',
    'We can arrange a private transfer for you (around $80 each way for up to 4 guests). Taxis are also available at the airport — the ride to the villa takes about 25 minutes.',
    'tahiti', 30, true
  ),

  -- Villa category
  (
    'What is the maximum occupancy of the villa?',
    'The villa comfortably sleeps 8 guests across 4 bedrooms. We can accommodate additional guests with prior arrangement — please contact us before booking.',
    'villa', 10, true
  ),
  (
    'Is the pool private?',
    'Yes — the infinity pool is for the exclusive use of villa guests. It is not shared with any other property.',
    'villa', 20, true
  ),
  (
    'Is there air conditioning in all rooms?',
    'Yes, all four bedrooms and the main living room have individually controlled air conditioning. The villa is also designed for cross-breeze ventilation.',
    'villa', 30, true
  ),

  -- Booking category
  (
    'How far in advance can I book?',
    'We accept bookings up to 18 months in advance. We recommend booking 4-6 months ahead for peak season (June-September and December-January).',
    'booking', 10, true
  ),
  (
    'What is the minimum stay?',
    'The default minimum stay is 5 nights. During peak season (June-September), a 7-night minimum applies. Reach out for shorter stays — we sometimes accommodate.',
    'booking', 20, true
  ),

  -- Payment category
  (
    'What payment methods are accepted?',
    'We accept credit/debit cards via Stripe (Visa, Mastercard, American Express) and PayPal. Both options charge in USD.',
    'payment', 10, true
  ),
  (
    'Is the 30% deposit refundable?',
    'Yes, the deposit is fully refundable if you cancel more than 60 days before check-in. Between 30 and 60 days the deposit is non-refundable. Inside 30 days, the full amount is non-refundable. Travel insurance is strongly recommended.',
    'payment', 20, true
  ),

  -- Experiences category
  (
    'Do I have to book experiences in advance?',
    'We strongly recommend booking experiences at the same time as the villa — especially sunset sailing, private dinners and whale watching, which sell out 2-3 weeks ahead in peak season.',
    'experiences', 10, true
  ),
  (
    'What happens if weather cancels an outdoor experience?',
    'If the operator cancels for safety reasons (rough seas, storms), you receive a full refund or a free reschedule for another day of your stay. We handle the entire process for you.',
    'experiences', 20, true
  )

ON CONFLICT DO NOTHING;
