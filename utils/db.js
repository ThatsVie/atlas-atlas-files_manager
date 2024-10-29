import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

class DBClient {
    constructor() {
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || '27017';
        const database = process.env.DB_DATABASE || 'files_manager';
        const uri = `mongodb://${host}:${port}`;

        this.client = new MongoClient(uri, { useUnifiedTopology: true });
        this.db = null;

        this.client.connect()
            .then(() => {
                this.db = this.client.db(database);
                console.log('Connected to MongoDB');
            })
            .catch((error) => console.error('MongoDB Connection Error:', error));
    }

    isAlive() {
        return this.client && this.client.isConnected();
    }

    async nbUsers() {
        return this.db ? await this.db.collection('users').countDocuments() : 0;
    }

    async nbFiles() {
        return this.db ? await this.db.collection('files').countDocuments() : 0;
    }
}

const dbClient = new DBClient();
export default dbClient;
