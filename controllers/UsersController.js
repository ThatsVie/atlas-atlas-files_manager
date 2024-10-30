import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';
import sha1 from 'crypto-js/sha1';
import { ObjectId } from 'mongodb';

class UsersController {
    static async postNew(req, res) {
        const { email, password } = req.body;

        // Validate email and password
        if (!email) {
            return res.status(400).json({ error: 'Missing email' });
        }
        if (!password) {
            return res.status(400).json({ error: 'Missing password' });
        }

        const existingUser = await dbClient.db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Already exist' });
        }

        // Hash the password and create the new user.
        const hashedPassword = sha1(password).toString();
        const result = await dbClient.db.collection('users').insertOne({
            email,
            password: hashedPassword,
        });

        return res.status(201).json({ id: result.insertedId, email });
    }

    static async getMe(req, res) {
        const token = req.headers['x-token'];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Retrieve the user ID from Redis using the token
        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Fetch user details from MongoDB using ObjectId
        const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        return res.status(200).json({ id: user._id, email: user.email });
    }
}

export default UsersController;
