import { defineType, defineField } from 'sanity'

export const author = defineType({
  name: 'author',
  title: 'Tác giả',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Tên tác giả',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Ảnh đại diện',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'bio',
      title: 'Giới thiệu',
      type: 'text',
    }),
  ],
})
