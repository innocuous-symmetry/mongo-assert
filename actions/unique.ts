import type { z } from 'zod';

export type CollectionParameters<T> = Partial<Record<keyof T, { unique?: boolean }>>

export const AssertUnique = <T>(itemSchema: z.ZodSchema<T>, parameters?: CollectionParameters<T>) =>
    itemSchema.array().refine((val) => {
        for (const key in parameters) {
            const value = parameters[key as keyof CollectionParameters<T>];
            const unique = value?.unique ?? false;

            if (unique) {
                const values = val.map((item) => item[key as keyof T]);
                return values.length === new Set(values).size;
            }
        }
    }, {
        message: "Encountered duplicate values in unique field"
    }
);
