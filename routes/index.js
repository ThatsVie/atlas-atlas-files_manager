import express from 'express';
import AppController from '../controllers/AppController.js';
import UsersController from '../controllers/UsersController.js';
import AuthController from '../controllers/AuthController.js';
import FilesController from '../controllers/FilesController.js';

const router = express.Router();

// GET /status => Returns Redis and MongoDB status
router.get('/status', AppController.getStatus);

// GET /stats => Returns statistics for users and files stored
router.get('/stats', AppController.getStats);

// POST /users => Registers a new user with email and password
router.post('/users', UsersController.postNew);

// GET /connect => Authenticates the user and returns a session token
router.get('/connect', AuthController.getConnect);

// GET /disconnect => Logs out the user by invalidating their session token
router.get('/disconnect', AuthController.getDisconnect);

// GET /users/me => Retrieves the authenticated user's profile details
router.get('/users/me', UsersController.getMe);

// POST /files => Uploads a new file or creates a new folder in the system
router.post('/files', FilesController.postUpload);

// GET /files/:id => Retrieves details of a specific file by ID
router.get('/files/:id', FilesController.getShow);

// GET /files => Lists files based on parentId with pagination
router.get('/files', FilesController.getIndex);

export default router;
