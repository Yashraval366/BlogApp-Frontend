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
  likeCounts: number 
  dislikeCounts: number
  userReaction: ReactionType
}


export enum ReactionType {
  Liked = 0,
  Disliked = 1,
  Null = 2
}
