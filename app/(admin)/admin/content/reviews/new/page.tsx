import type { Metadata } from 'next'
import { ReviewForm } from '../ReviewForm'

export const metadata: Metadata = { title: 'Add Review — Admin' }

export default function NewReviewPage() {
  return <ReviewForm />
}
