import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

export default defineConfig({
  name: 'default',
  title: 'Leanity Studio',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'stl56mhh',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

  basePath: '/studio',

  plugins: [structureTool()],

  schema: {
    types: [],
  },
})
