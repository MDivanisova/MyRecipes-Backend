import z from "zod"

const idSchema = z.object({
    _id: z.hex().min(24, "user must be 24 characters").max(24)
})
export {
    idSchema
}