import type { Metadata } from 'next'
import { ProviderForm } from '../ProviderForm'

export const metadata: Metadata = { title: 'Nouveau prestataire — Admin' }

export default function NewProviderPage() {
  return <ProviderForm />
}
