/**
 * GROQ queries.
 *
 * Pure string constants — easy to read, easy to test, easy to copy/paste
 * into Sanity Vision. Each query mirrors the shape declared in `./types.ts`
 * so callers can type the response strictly.
 */

/* ---------- Villa (singleton) ----------------------------------------- */

export const villaQuery = /* groq */ `
  *[_type == "villa"][0]{
    _id,
    _type,
    name,
    tagline,
    description,
    heroVideoUrl,
    heroImage{ ..., asset->{_id, url} },
    "gallery": gallery[]{ ..., asset->{_id, url} },
    specs,
    amenities,
    location,
    seo{
      metaTitle,
      metaDescription,
      ogImage{ ..., asset->{_id, url} }
    }
  }
`

/* ---------- Experiences ---------------------------------------------- */

export const experiencesQuery = /* groq */ `
  *[_type == "experience" && active == true]
    | order(popularity desc){
      _id,
      _type,
      title,
      slug,
      category,
      shortDescription,
      coverImage{ ..., asset->{_id, url} },
      duration,
      priceUSD,
      priceUnit,
      minGuests,
      maxGuests,
      seasonal,
      seasonStart,
      seasonEnd,
      provider->{ _id, name, website },
      highlights,
      meetingPoint,
      popularity,
      featured,
      active
    }
`

export const experiencesByCategoryQuery = /* groq */ `
  *[_type == "experience" && active == true && category == $category]
    | order(popularity desc){
      _id,
      title,
      slug,
      category,
      shortDescription,
      coverImage{ ..., asset->{_id, url} },
      duration,
      priceUSD,
      priceUnit,
      featured
    }
`

export const featuredExperiencesQuery = /* groq */ `
  *[_type == "experience" && active == true && featured == true]
    | order(popularity desc)[0...6]{
      _id,
      title,
      slug,
      category,
      shortDescription,
      coverImage{ ..., asset->{_id, url} },
      priceUSD,
      priceUnit
    }
`

export const experienceBySlugQuery = /* groq */ `
  *[_type == "experience" && slug.current == $slug][0]{
    _id,
    _type,
    title,
    slug,
    category,
    shortDescription,
    description,
    coverImage{ ..., asset->{_id, url} },
    "gallery": gallery[]{ ..., asset->{_id, url} },
    duration,
    priceUSD,
    priceUnit,
    minGuests,
    maxGuests,
    seasonal,
    seasonStart,
    seasonEnd,
    provider->{ _id, name, website },
    highlights,
    meetingPoint,
    popularity,
    featured,
    active,
    seo
  }
`

/* ---------- Reviews -------------------------------------------------- */

export const reviewsQuery = /* groq */ `
  *[_type == "review"]
    | order(featured desc, publishedAt desc){
      _id,
      _type,
      authorName,
      authorLocation,
      authorPhoto{ ..., asset->{_id, url} },
      rating,
      title,
      body,
      stayDates,
      verified,
      source,
      featured,
      publishedAt
    }
`

export const featuredReviewsQuery = /* groq */ `
  *[_type == "review" && featured == true]
    | order(publishedAt desc)[0...8]{
      _id,
      authorName,
      authorLocation,
      authorPhoto{ ..., asset->{_id, url} },
      rating,
      title,
      body,
      source,
      verified,
      publishedAt
    }
`

/* ---------- Blog posts ---------------------------------------------- */

export const postsQuery = /* groq */ `
  *[_type == "post" && defined(publishedAt) && publishedAt <= now()]
    | order(publishedAt desc){
      _id,
      _type,
      title,
      slug,
      excerpt,
      coverImage{ ..., asset->{_id, url} },
      author,
      tags,
      publishedAt,
      readingTimeMin
    }
`

export const postBySlugQuery = /* groq */ `
  *[_type == "post" && slug.current == $slug][0]{
    _id,
    _type,
    title,
    slug,
    excerpt,
    coverImage{ ..., asset->{_id, url} },
    body,
    author{ name, photo{ ..., asset->{_id, url} }, bio },
    tags,
    publishedAt,
    readingTimeMin,
    seo
  }
`

/* ---------- FAQ ----------------------------------------------------- */

export const faqsQuery = /* groq */ `
  *[_type == "faq"] | order(category asc, order asc){
    _id,
    _type,
    question,
    answer,
    category,
    order
  }
`

/* ---------- Settings (singleton) ------------------------------------- */

export const settingsQuery = /* groq */ `
  *[_type == "settings"][0]{
    _id,
    _type,
    siteName,
    siteDescription,
    contactEmail,
    contactPhone,
    whatsappNumber,
    socialLinks,
    defaultCancellationPolicy,
    defaultMinNights,
    defaultDepositPercent,
    defaultNightlyRateUSD,
    cleaningFeeUSD,
    bookingTermsUrl
  }
`
