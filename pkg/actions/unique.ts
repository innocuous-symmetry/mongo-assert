import type { z } from 'zod';

export type AssertUniqueType<T extends Record<string, unknown>> = z.ZodEffects<z.ZodArray<z.ZodType<T>>, T[], unknown>;

export class AssertUnique<T extends Record<string, unknown>> {
    itemSchema: z.ZodSchema<T>;
    uniqueValues?: (keyof T)[];

    constructor(itemSchema: z.ZodSchema<T>, uniqueValues?: (keyof T)[]) {
        this.itemSchema = itemSchema;
        this.uniqueValues = uniqueValues;
    }

    fromSchema() {
        return AssertUnique.fromSchema(this.itemSchema, this.uniqueValues) satisfies AssertUniqueType<T>;
    }

    static fromSchema<T extends Record<string, unknown>>(
        itemSchema: z.ZodSchema<T>, uniqueValues?: (keyof T)[]
    ) {
        return itemSchema.array().refine((val) => {
            for (const key of uniqueValues ?? []) {
                const values = val.map((item) => item[key as keyof T]);
                return values.length === new Set(values).size;
            }
        }, {
            message: "Encountered duplicate values in unique field"
        }) satisfies AssertUniqueType<T>;
    }
}
