import z from "zod"

const ratingSchema = z.object({
    rating: z.number().positive("rating must be positive"),
    rater: z.hex().min(24, "rater must be 24 characters").max(24),
    rated: z.hex().min(24, "rated must be 24 characters").max(24)
});

const editRatingSchema = z.object({
    ratingId: z.hex().min(24, "rated must be 24 characters").max(24),
    rating: z.number().positive("rating must be positive")
})

export {
    ratingSchema,
    editRatingSchema
}