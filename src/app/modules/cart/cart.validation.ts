import z from "zod";

export const createCartZodSchema = z.object({
  product: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "ProductId required and must be ObjectId"),
  quantity: z
    .number("Quantity required and must be number.")
    .nonnegative("Quantity can't be negative number")
    .default(1),
});

export const updateCartZodSchema = z.object({
  quantity: z.number("Quantity required and must be number.").optional(),
});
