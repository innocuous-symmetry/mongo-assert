import { MongoClient } from "mongodb";
import path from "path";

export async function createMongoClient() {
    const url = process.env.MONGO_URL;
    const cert = process.env.MONGO_CERT;

    if (!url || !cert) {
        throw new Error('Missing environment variables');
    }

    const pathToCert = path.resolve(__dirname, '..', cert);

    try {
        const client = new MongoClient(url, {
            tlsCertificateKeyFile: pathToCert
        });

        return client;
    } catch(e) {
        console.log(e);
        return null;
    }
}
