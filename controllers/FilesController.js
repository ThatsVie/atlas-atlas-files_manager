import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';
import { promises as fs } from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';
import mime from 'mime-types';
import Queue from 'bull';

const fileQueue = new Queue('fileQueue');

class FilesController {

    static async postUpload(req, res) {
        const token = req.headers['x-token'];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { name, type, parentId = 0, isPublic = false, data } = req.body;
        if (!name) return res.status(400).json({ error: 'Missing name' });
        if (!['folder', 'file', 'image'].includes(type)) return res.status(400).json({ error: 'Missing type' });
        if (!data && type !== 'folder') return res.status(400).json({ error: 'Missing data' });

        let parentFile = null;
        if (parentId !== 0) {
            if (!ObjectId.isValid(parentId)) return res.status(400).json({ error: 'Invalid parentId' });
            parentFile = await dbClient.db.collection('files').findOne({ _id: new ObjectId(parentId) });
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

        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';

        if (type === 'folder') {
            const result = await dbClient.db.collection('files').insertOne(newFile);
            return res.status(201).json({ id: result.insertedId, ...newFile });
        }

        await fs.mkdir(folderPath, { recursive: true });
        const localPath = path.join(folderPath, uuidv4());
        await fs.writeFile(localPath, Buffer.from(data, 'base64'));

        newFile.localPath = localPath;
        const result = await dbClient.db.collection('files').insertOne(newFile);

        if (type === 'image') {
            await fileQueue.add({ userId, fileId: result.insertedId });
        }

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

    static async putPublish(req, res) {
        const token = req.headers['x-token'];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { id } = req.params;
        if (!ObjectId.isValid(id)) return res.status(404).json({ error: 'Not found' });

        const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(id), userId });
        if (!file) return res.status(404).json({ error: 'Not found' });

        await dbClient.db.collection('files').updateOne({ _id: new ObjectId(id) }, { $set: { isPublic: true } });
        const updatedFile = await dbClient.db.collection('files').findOne({ _id: new ObjectId(id) });

        return res.status(200).json(updatedFile);
    }

    static async putUnpublish(req, res) {
        const token = req.headers['x-token'];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { id } = req.params;
        if (!ObjectId.isValid(id)) return res.status(404).json({ error: 'Not found' });

        const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(id), userId });
        if (!file) return res.status(404).json({ error: 'Not found' });

        await dbClient.db.collection('files').updateOne({ _id: new ObjectId(id) }, { $set: { isPublic: false } });
        const updatedFile = await dbClient.db.collection('files').findOne({ _id: new ObjectId(id) });

        return res.status(200).json(updatedFile);
    }

    static async getFile(req, res) {
        const { id } = req.params;
        const { size } = req.query;
        const token = req.headers['x-token'] || null;

        if (!ObjectId.isValid(id)) return res.status(404).json({ error: 'Not found' });
        const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(id) });
        if (!file) return res.status(404).json({ error: 'Not found' });

        if (!file.isPublic) {
            if (!token) return res.status(404).json({ error: 'Not found' });
            const userId = await redisClient.get(`auth_${token}`);
            if (!userId || userId !== file.userId.toString()) return res.status(404).json({ error: 'Not found' });
        }

        if (file.type === 'folder') return res.status(400).json({ error: "A folder doesn't have content" });

        let filePath = file.localPath;
        if (size) {
            const thumbnailPath = `${file.localPath}_${size}`;
            if (await fs.access(thumbnailPath).then(() => true).catch(() => false)) {
                filePath = thumbnailPath;
            } else {
                return res.status(404).json({ error: 'Not found' });
            }
        }

        try {
            const content = await fs.readFile(filePath);
            const mimeType = mime.lookup(file.name) || 'application/octet-stream';
            res.setHeader('Content-Type', mimeType);
            return res.status(200).send(content);
        } catch (error) {
            return res.status(404).json({ error: 'Not found' });
        }
    }
}

export default FilesController;
