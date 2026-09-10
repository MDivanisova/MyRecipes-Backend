import z from "zod";
import { gender } from "./enum.js";

const loginScehama = z.object({
    email: z.email(),
    password: z.string().min(7, "the password must be 7 characters")
})

const registerSchema = z.object({
    name: z.string().min(3,"name must be at least 3 characters").max(50,"name can't be more than 50 characters"),
    password: z.string().min(7, "password must be at least 7 characters"),
    email: z.email(),
    gender: z.enum([gender.FEMALE, gender.MALE]).optional()
})

 const verifySchema = z.object({
    code: z.string().min(6).max(6),
    email: z.email()
 })

const resendCodeSchema = z.object({
    email: z.email()
})

const editUserSchema = z.object({
    _id: z.string().min(24,"userId must be 24 characters").max(24, "userId must be 24 characters"),
    name: z.string().min(3,"name must be at least 3 characters").max(50,"name can't be more than 50 characters"),
    email: z.email(),
    gender: z.enum([gender.FEMALE, gender.MALE, ""]).optional(),
    age: z.number().positive().optional(),
    description: z.string().max(255, "description can't be longer than 255 characters").optional()
})
export {
    loginScehama,
    registerSchema,
    resendCodeSchema,
    verifySchema,
    editUserSchema
}