import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';
import { promises as fs } from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';

class FilesController {

    static async postUpload(req, res) {
        // check authorization
        const token = req.headers['x-token'];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        // verify user session token
        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // extraction and validation of parameters
        const { name, type, parentId = 0, isPublic = false, data } = req.body;
        if (!name) return res.status(400).json({ error: 'Missing name' });
        if (!['folder', 'file', 'image'].includes(type)) return res.status(400).json({ error: 'Missing type' });
        if (!data && type !== 'folder') return res.status(400).json({ error: 'Missing data' });

        // Parent folder validation if parentId is provided
        let parentFile = null;
        if (parentId !== 0) {
            if (!ObjectId.isValid(parentId)) return res.status(400).json({ error: 'Invalid parentId' });
            parentFile = await dbClient.db.collection('files').findOne({ _id: new ObjectId(parentId) });
            if (!parentFile) return res.status(400).json({ error: 'Parent not found' });
            if (parentFile.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
        }

        // Creating file object for the database
        const newFile = {
            userId,
            name,
            type,
            isPublic,
            parentId,
        };

        // Insert folder type directly into the database
        if (type === 'folder') {
            const result = await dbClient.db.collection('files').insertOne(newFile);
            return res.status(201).json({ id: result.insertedId, ...newFile });
        }

        // Decode and store file locally for files or images
        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
        await fs.mkdir(folderPath, { recursive: true });
        const localPath = path.join(folderPath, uuidv4());
        await fs.writeFile(localPath, Buffer.from(data, 'base64'));

        // Update file object and insert into the database
        newFile.localPath = localPath;
        const result = await dbClient.db.collection('files').insertOne(newFile);
        return res.status(201).json({ id: result.insertedId, ...newFile });
    }

    static async getShow(req, res) {
        const token = req.headers['x-token'];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { id } = req.params;
        if (!ObjectId.isValid(id)) return res.status(404).json({ error: 'Not found' });

        const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(id), userId });
        if (!file) return res.status(404).json({ error: 'Not found' });

        return res.status(200).json(file);
    }

    static async getIndex(req, res) {
        const token = req.headers['x-token'];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { parentId = '0', page = 0 } = req.query;
        let parentQuery;

        // Check if parentId is 0 (root) or a valid ObjectId for a specific parent
        if (parentId === '0') {
            parentQuery = { parentId: 0 };
        } else if (ObjectId.isValid(parentId)) {
            parentQuery = { parentId: new ObjectId(parentId) };
        } else {
            return res.status(400).json({ error: 'Invalid parentId' });
        }

        const files = await dbClient.db.collection('files')
            .find({ userId, ...parentQuery })
            .skip(parseInt(page, 10) * 20)
            .limit(20)
            .toArray();

        return res.status(200).json(files);
    }
}

export default FilesController;
