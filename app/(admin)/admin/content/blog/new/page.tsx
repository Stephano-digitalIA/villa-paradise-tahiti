import type { Metadata } from 'next'
import { PostForm } from '../PostForm'

export const metadata: Metadata = { title: 'Nouvel article — Admin' }

export default function NewPostPage() {
  return <PostForm />
}
