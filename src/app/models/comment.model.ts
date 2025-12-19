export interface IComment
{
    id: number
    blogId: number
    content: string
    userId: number
    userName: string
    parentCommentId: number | null
    createdAt: string
    lastUpdatedAt: string | null
    isOptimistic: boolean | null
}

export interface CommentNode extends IComment {
  replies: CommentNode[];
}