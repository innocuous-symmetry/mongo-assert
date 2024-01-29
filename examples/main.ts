import { z } from 'zod';
import MongoAssert from '..';
import dotenv from 'dotenv';
import path from 'path';
import { createMongoClient, ObjectId } from '../lib/mongodb';

dotenv.config();

const MusicEntry = z.object({
    _id: ObjectId,
    name: z.string(),
    shortdescription: z.string(),
    longdescription: z.string().optional(),
    artist: z.string().optional(),
    compositiondate: z.string().optional(),
    pathtoentry: z.string(),
    collection: z.string(),
    slug: z.string(),
})

const MusicCollection = z.object({
    _id: ObjectId,
    name: z.string(),
    description: z.string().optional(),
    collectionslug: z.string(),
})

type MusicEntryType = z.infer<typeof MusicEntry>;
type MusicCollectionType = z.infer<typeof MusicCollection>;

async function main() {
    try {
        const url = process.env.MONGO_URL;
        const cert = process.env.MONGO_CERT;

        if (!url || !cert) {
            throw new Error('Missing environment variables');
        }

        const client = await createMongoClient(url, {
            tlsCertificateKeyFile: path.resolve(__dirname, '..', cert)
        });

        if (!client) return null;

        const mdotdev = client.db('mikayladotdev');
        const music = mdotdev.collection('music');

        const musicData = await music.find().toArray();
        const collectionData = await mdotdev.collection('music-collection').find().toArray();

        type AssertUniqueType<T extends Record<string, unknown>> = z.ZodEffects<z.ZodArray<z.ZodType<T>>, T[], unknown>;

        // validate against internal schema
        const MusicEntryValidator = MongoAssert.unique.fromSchema(MusicEntry, ["slug"]) satisfies AssertUniqueType<MusicEntryType>;
        const MusicCollections = MongoAssert.unique.fromSchema(MusicCollection, ["collectionslug"]);

        const result: Promise<number | undefined> = MongoAssert.relation.check({
            db: "mikayladotdev",
            mainCollection: "music",
            relationCollection: "music-collection",
            mainSchema: MusicEntry,
            relationSchema: MusicCollection,
            relations: {
                "collection": "collectionslug"
            }
        });

        await Promise.allSettled([
            MusicEntryValidator.parseAsync(musicData) satisfies Promise<MusicEntryType[]>,
            MusicCollections.parseAsync(collectionData) satisfies Promise<MusicCollectionType[]>,
            result
        ]).then((results) => {
            results.forEach((result) => {
                if (result.status === 'rejected') {
                    console.log(result.reason);
                }
            })
        })
        .catch(console.error)
        .finally(() => client.close());

    } catch(e) {
        console.log(e);
    }
}

main().catch(console.error);
