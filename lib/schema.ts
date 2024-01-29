import { z } from 'zod';

// mongodb ObjectId as zod schema (we'll settle on our definition later)
export const ObjectId = z.any();

export const MusicEntry = z.object({
    _id: ObjectId,
    name: z.string(),
    shortdescription: z.string(),
    longdescription: z.string().optional(),
    artist: z.string().optional().default("Mikayla Dobson"),
    compositiondate: z.string().optional(),
    pathtoentry: z.string(),
    collection: z.string(),
    slug: z.string(),
})

export const MusicCollection = z.object({
    _id: ObjectId,
    name: z.string(),
    description: z.string().optional(),
    collectionslug: z.string(),
})


export type MusicEntry = z.infer<typeof MusicEntry>;
export type MusicCollection = z.infer<typeof MusicCollection>;
