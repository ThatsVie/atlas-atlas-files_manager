import Queue from 'bull';
import { ObjectId } from 'mongodb';
import dbClient from './utils/db.js';
import imageThumbnail from 'image-thumbnail';
import { promises as fs } from 'fs';
import path from 'path';

const fileQueue = new Queue('fileQueue');

fileQueue.process(async (job) => {
    const { userId, fileId } = job.data;

    if (!fileId) throw new Error('Missing fileId');
    if (!userId) throw new Error('Missing userId');

    const file = await dbClient.db.collection('files').findOne({
        _id: new ObjectId(fileId),
        userId,
    });

    if (!file) throw new Error('File not found');
    if (file.type !== 'image') throw new Error('Only images can have thumbnails');

    const sizes = [500, 250, 100];
    for (const size of sizes) {
        try {
            const thumbnail = await imageThumbnail(file.localPath, { width: size });
            const thumbnailPath = `${file.localPath}_${size}`;
            await fs.writeFile(thumbnailPath, thumbnail);
        } catch (error) {
            console.error(`Failed to generate thumbnail of size ${size}`, error);
        }
    }
});
