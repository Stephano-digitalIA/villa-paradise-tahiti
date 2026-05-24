import type { Metadata } from 'next'
import { PostForm } from '../PostForm'

export const metadata: Metadata = { title: 'New Post — Admin' }

export default function NewPostPage() {
  return <PostForm />
}
