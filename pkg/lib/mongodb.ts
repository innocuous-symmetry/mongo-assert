import { MongoClient, type MongoClientOptions } from "mongodb";
import { z } from "zod";

// mongodb ObjectId as zod schema (we'll settle on our definition later)
export const ObjectId = z.any();

export async function createMongoClient(url: string, options?: MongoClientOptions) {
    try {
        return new MongoClient(url, options);
    } catch(e) {
        console.log(e);
        return;
    }
}
