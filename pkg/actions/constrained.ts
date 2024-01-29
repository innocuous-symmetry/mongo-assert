import { z } from 'zod';

export class AssertConstrained<T extends Record<string, unknown>> {
    itemSchema: z.ZodSchema<T>;

    constructor(itemSchema: z.ZodSchema<T>) {
        this.itemSchema = itemSchema;
    }

    check(item: unknown): item is T {
        return this.itemSchema.safeParse(item).success;
    }

    checkArray(arr: unknown[]): arr is T[] {
        return this.itemSchema.array().safeParse(arr).success;
    }
}
