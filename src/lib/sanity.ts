import { createClient } from 'next-sanity'
import { createImageUrlBuilder } from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'stl56mhh',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  useCdn: process.env.NODE_ENV === 'production', // use CDN cache in production for speed
})

const builder = createImageUrlBuilder(client)

export function urlFor(source: any) {
  if (!source || !source.asset) return ''
  try {
    return builder.image(source).url()
  } catch (err) {
    console.error('Error building Sanity image URL:', err)
    return ''
  }
}
