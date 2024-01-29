# Mongo Assert

Stronger, more intuitive type checking and assertions for MongoDB.

Mongo Assert extends the functionality of Zod, integrated with the MongoDB Node.js driver, to provide a more intuitive and powerful way to validate and assert MongoDB documents.

Some of its features include:

- Validation of unique fields
- Validation of the integrity of references to other collections
- Adherence to a Zod schema

## But why?

Mongo Assert is something I put together out of frustration with existing, heavy handed solutions for MongoDB schema management. Mongo Assert is intended to have a minimal footprint, add on to  existing validation infrastructure, and plug in seamlessly to build-time integrity checks.

## Usage

Mongo Assert is available as an NPM package. To install it, run:

```bash
npm install mongo-assert
pnpm install mongo-assert
yarn add mongo-assert
bun install mongo-assert
```

Mongo Assert supports Zod schemas out of the box, so any schemas you may already have defined can be used
with any MongoDB instance.

## Examples

### Getting started

For all of the examples below, we'll be using the following schema:

```ts
import { z } from 'zod';
import { ObjectId } from "mongo-assert/lib/mongodb"

export const userSchema = z.object({
    _id: ObjectId,
    name: z.string(),
    email: z.string().email(),
});

export type User = z.infer<typeof userSchema>;
```

### Unique field validation

Mongo Assert extends Zod schemas to check that your documents match the desired schema. For example:

```ts
import MongoAssert, { type AssertUniqueType } from 'mongo-assert';
import { userSchema, type User } from "./schemas";

export const UserEmailsUniqueValidator: AssertUniqueType<User> = MongoAssert.unique.fromSchema(userSchema, ["email"]);
```

The returned object is a Zod schema that can be directly invoked to validate a result from MongoDB. This object
is of the type:

```ts
type AssertUniqueType<T> = z.ZodEffects<z.ZodArray<z.ZodType<T>>, T[], unknown>;
```

And you can use it like this:

```ts
import { createMongoClient } from "./your-mongo-client";
import { UserEmailsUniqueValidator } from "./schemas";

const client = await createMongoClient(url, options);

async function main() {
    const users: WithId<Document>[] = await client.db("db").collection("users").find().toArray();

    try {
        return UserEmailsUniqueValidator.parse(users) satisfies User[];
    } catch (e) {
        console.error(e);
        return;
    }
}
```

### Reference validation

Mongo Assert also supports validation of references to other collections.

For example, suppose we have a collection of `Store`s that must be associated to an existing `User`. Let's define our schema first:

```ts
import { z } from 'zod';

export const storeSchema = z.object({
    _id: ObjectId,
    name: z.string(),
    owner: z.string(),
    ownerEmail: z.string().email(),
});

export type Store = z.infer<typeof storeSchema>;
```

Now, we can define a reference validator between these two collections:

```ts
import MongoAssert from 'mongo-assert';

const StoresHaveOwnersValidator = new MongoAssert.relation({
    db: "your-db",
    mainCollection: "users",
    relationCollection: "stores",
    mainSchema: userSchema,
    relationSchema: storeSchema,
    relations: {
        "email": "ownerEmail"
    }
});
```

And then we can use it like this:

```ts
import { createMongoClient } from "./your-mongo-client";
import { StoresHaveOwnersValidator } from "./schemas";

const client = await createMongoClient(url, options);

async function main() {
    const stores: WithId<Document>[] = await client.db("db").collection("stores").find().toArray();

    try {
        return StoresHaveOwnersValidator.parse(stores) satisfies Store[];
    } catch (e) {
        console.error(e);
        return;
    }
}
```
