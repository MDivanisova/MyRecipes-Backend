import z from "zod"

const createBookmarkSchema = z.object({
    user: z.hex().min(24, "user must be 24 characters").max(24),
    recepie: z.hex().min(24, "recepie must be 24 characters").max(24)
});

export {
    createBookmarkSchema
};