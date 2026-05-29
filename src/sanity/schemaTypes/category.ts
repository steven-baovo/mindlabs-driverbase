import { defineType, defineField } from 'sanity'

export const category = defineType({
  name: 'category',
  title: 'Danh mục',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tiêu đề',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Mô tả',
      type: 'text',
    }),
  ],
})
