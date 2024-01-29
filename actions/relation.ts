import { z } from "zod";
import { createMongoClient } from "../lib/mongodb";
import { MongoClient, MongoClientOptions } from "mongodb";
import { WeakDict } from "../lib/types";

export type AssertRelationType<T extends WeakDict, R extends WeakDict> = {};
export type AssertRelationConfig<T extends Record<string, unknown>, R extends Record<string, unknown>> = {
    db: string;
    client?: MongoClient
    mainCollection: string;
    mainSchema: z.ZodSchema<T>;
    relationCollection: string;
    relationSchema: z.ZodSchema<R>;
    relations: {
        [key in keyof T]?: keyof R;
    }
} & ({
    connectionDetails?: undefined
    client?: MongoClient
} | {
    connectionDetails: {
        url: string;
        options: MongoClientOptions;
    }
})

export class AssertRelation<T extends Record<string, unknown>, R extends Record<string, unknown>> {
    config: AssertRelationConfig<T, R>;

    constructor(config: AssertRelationConfig<T, R>) {
        this.config = config;
    }

    static async check<T extends Record<string, unknown>, R extends Record<string, unknown>>(config: AssertRelationConfig<T, R>) {
        const controller = new AssertRelation(config);
        return await controller.check();
    }

    async check() {
        try {
            let client: MongoClient | undefined = this.config.client;

            if (!client && this.config.connectionDetails?.url)
                client = await createMongoClient(this.config.connectionDetails.url, this.config.connectionDetails?.options);

            if (!client) return;

            const db = client.db(this.config.db);
            const collection = db.collection(this.config.mainCollection);
            const relationCollection = db.collection(this.config.relationCollection);

            const relationResults = await relationCollection.find().toArray();
            const validatedRelationResults = this.config.relationSchema.array().parse(relationResults);

            const mainResults = await collection.find().toArray();
            const validatedMainResults = this.config.mainSchema.array().parse(mainResults);

            let i = 0;

            for (const item of validatedMainResults) {
                i++;
                for (const key in this.config.relations) {
                    const value = this.config.relations[key as keyof T] as keyof R;
                    const relation = item[key as keyof T];
                    const options = new Set<R[keyof R]>();

                    Object.values(this.config.relations).forEach((value) => {
                        validatedRelationResults.forEach((item) => options.add(item[value as keyof R]))
                    });

                    if (!options.has(relation as unknown as R[keyof R])) {
                        throw new Error(`Encountered invalid relation in ${this.config.mainCollection}.${key}: ${relation}`);
                    }
                }
            }

            return i;
        } catch(e) {
            console.log(e);
            return;
        }
    }
}
