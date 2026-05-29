import { defineType, defineField } from 'sanity'

export const post = defineType({
  name: 'post',
  title: 'Bài viết',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tiêu đề',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Đường dẫn (Slug)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Phụ đề',
      type: 'string',
    }),
    defineField({
      name: 'summary',
      title: 'Tóm tắt',
      type: 'text',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Ngày xuất bản',
      type: 'datetime',
    }),
    defineField({
      name: 'readTime',
      title: 'Thời gian đọc (ví dụ: 5 phút)',
      type: 'string',
    }),
    defineField({
      name: 'category',
      title: 'Danh mục',
      type: 'reference',
      to: [{ type: 'category' }],
    }),
    defineField({
      name: 'author',
      title: 'Tác giả',
      type: 'reference',
      to: [{ type: 'author' }],
    }),
    defineField({
      name: 'mainImage',
      title: 'Ảnh đại diện',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'tags',
      title: 'Thẻ (Tags)',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'body',
      title: 'Nội dung',
      type: 'array',
      of: [
        {
          type: 'block',
        },
        {
          type: 'image',
          options: { hotspot: true },
        },
      ],
    }),
  ],
})
