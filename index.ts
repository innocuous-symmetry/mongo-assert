import dotenv from 'dotenv';
import { MusicCollection, MusicEntry } from './lib/schema';
import { AssertUnique } from './actions/unique';
import { AssertRelation } from './actions/relation';
import { createMongoClient } from './lib/mongoClient';

dotenv.config();

async function main() {
    try {
        const client = await createMongoClient();
        if (!client) return null;

        const mdotdev = client.db('mikayladotdev');
        const music = mdotdev.collection('music');

        const musicData = await music.find().toArray();
        const collectionData = await mdotdev.collection('music-collection').find().toArray();

        // validate against internal schema
        const MusicEntries = AssertUnique(MusicEntry, {
            slug: { unique: true }
        });

        const MusicCollections = AssertUnique(MusicCollection, {
            collectionslug: { unique: true }
        });

        const result = AssertRelation.check({
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
            MusicEntries.parseAsync(musicData),
            MusicCollections.parseAsync(collectionData),
            result
        ]).then((results) => {
            results.forEach((result) => {
                if (result.status === 'rejected') {
                    console.log(result.reason);
                }
            })
        }).catch(console.error)
        .finally(() => client.close());

    } catch(e) {
        console.log(e);
    }
}

main().catch(console.error);
