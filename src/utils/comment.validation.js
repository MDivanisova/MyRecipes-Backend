import z from "zod"

const commentSchema = z.object({
    user: z.hex().min(24, "commenter id must be 24 characters").max(24),
    review: z.hex().min(24, "commentFor id must be 24 characters").max(24),
    text: z.string().min(10, "text must be at least 10 characters").max(5000, "text must be max 5000 characters")
});

const editCommentSchema = z.object({
    _id: z.hex().min(24, "commenter id must be 24 characters").max(24),
    text: z.string().min(10, "text must be at least 10 characters").max(5000, "text must be max 5000 characters")
})

export {
    commentSchema,
    editCommentSchema
}