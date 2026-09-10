import z from "zod"

const reviewSchema = z.object({
    reviewer: z.hex().min(24, "reviewer id must be 24 characters").max(24),
    reviewed: z.hex().min(24, "reviewed id must be 24 characters").max(24),
    text: z.string().min(4, "text must be at least 10 characters").max(5000, "text must be max 5000 characters"),
});

const editReviewSchema = z.object({
    _id: z.hex().min(24, "review id must be 24 characters").max(24),
    text: z.string().min(4, "text must be at least 10 characters").max(5000, "text must be max 5000 characters")
})

export {
    reviewSchema,
    editReviewSchema
}