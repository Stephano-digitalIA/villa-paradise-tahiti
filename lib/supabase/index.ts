// ─────────────────────────────────────────────────────────────────────────────
// lib/supabase — Barrel export
// Import everything from this file rather than from individual modules.
// ─────────────────────────────────────────────────────────────────────────────

// Clients
export { createClient } from './client'
export { createServerSupabaseClient } from './server'
export { adminClient } from './admin'

// Types
export type {
  Database,
  Settings,
  Villa,
  GalleryCategory,
  GalleryItem,
  ExcursionProvider,
  ExperienceCategory,
  PriceUnit,
  Experience,
  ExperienceGalleryItem,
  ReviewRating,
  ReviewSource,
  Review,
  Post,
  FaqCategory,
  FAQ,
  AdminRole,
  AdminUser,
  Customer,
  PaymentStatus,
  PaymentMethod,
  SelectedExperienceSnapshot,
  Reservation,
  PaymentEvent,
  BlockedDateSource,
  BlockedDate,
  EmailLogStatus,
  EmailLog,
  ContactInquiry,
} from './types'

// Query functions
export {
  getSettings,
  getVilla,
  getGalleryItems,
  getExperiences,
  getExperienceBySlug,
  getRelatedExperiences,
  getReviews,
  getPosts,
  getPostBySlug,
  getFAQs,
  getBlockedDates,
} from './queries'

export type {
  GetExperiencesOptions,
  GetReviewsOptions,
  GetPostsOptions,
} from './queries'

// Storage
export { getPublicUrl, uploadFile, deleteFile, storage } from './storage'
export type { StorageRef } from './storage'

// Adapters — Supabase (snake_case) → component-compatible (camelCase)
export {
  adaptVilla,
  adaptExperience,
  adaptReview,
  adaptPost,
  adaptFAQ,
  adaptSettings,
  adaptGalleryItem,
} from './adapters'

export type {
  AdaptedVilla,
  AdaptedExperience,
  AdaptedReview,
  AdaptedPost,
  AdaptedFAQ,
  AdaptedSettings,
  AdaptedGalleryItem,
} from './adapters'
