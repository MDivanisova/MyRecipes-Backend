import z from "zod";
import { role } from "./enum.js";

const roleEditSchema = z.object({
    _id: z.hex().min(24, "review id must be 24 characters").max(24),
    role: z.hex().min(24, "review id must be 24 characters").max(24)
})

export {
   roleEditSchema
}