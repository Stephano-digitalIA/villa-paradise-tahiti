import type { Metadata } from 'next'
import { ReviewForm } from '../ReviewForm'

export const metadata: Metadata = { title: 'Ajouter un avis — Admin' }

export default function NewReviewPage() {
  return <ReviewForm />
}
