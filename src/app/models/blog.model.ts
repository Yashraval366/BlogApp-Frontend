export interface ICreateBlog {
  title: string
  description: string
  categoryId: number
  blogVisibility: string
}

export interface IUpdateBlog {
  title: string
  description: string
  categoryId: number
  blogVisibility: string
}

export interface IBlog {
  id: number
  title: string
  description: string
  blogVisibility: number
  categoryId: number
  categoryName: string
  authorId: number
  authorName: string
  createdAt: string
  lastUpdatedAt: any
}
