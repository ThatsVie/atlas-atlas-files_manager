import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';
import { promises as fs } from 'fs';
import path from 'path';

class FilesController {
    static async postUpload(req, res) {
        const token = req.headers['x-token'];
        const { name, type, parentId = 0, isPublic = false, data } = req.body;

        if (!token) return res.status(401).json({ error: 'Unauthorized' });
        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        
        if (!name) return res.status(400).json({ error: 'Missing name' });
        if (!['folder', 'file', 'image'].includes(type)) return res.status(400).json({ error: 'Missing type' });
        if (!data && type !== 'folder') return res.status(400).json({ error: 'Missing data' });

        let parentFile = null;
        if (parentId) {
            parentFile = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
            if (!parentFile) return res.status(400).json({ error: 'Parent not found' });
            if (parentFile.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
        }

        const newFile = {
            userId,
            name,
            type,
            isPublic,
            parentId,
        };

        if (type === 'folder') {
            const result = await dbClient.db.collection('files').insertOne(newFile);
            return res.status(201).json({ id: result.insertedId, ...newFile });
        }

        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
        await fs.mkdir(folderPath, { recursive: true });
        const localPath = path.join(folderPath, uuidv4());
        await fs.writeFile(localPath, Buffer.from(data, 'base64'));
        
        newFile.localPath = localPath;
        const result = await dbClient.db.collection('files').insertOne(newFile);
        return res.status(201).json({ id: result.insertedId, ...newFile });
    }
}

export default FilesController;
