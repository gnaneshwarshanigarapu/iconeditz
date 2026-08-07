import multer from 'multer';
import { storageService } from '../lib/storage/StorageService.js';
import { authorizeAdmin } from '../lib/auth.js';
import { withApi } from '../lib/handler.js';

const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/zip',
    'application/pdf'
];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, videos, PDFs, and zip files are allowed.'), false);
        }
    }
});

export const config = { api: { bodyParser: false } };

export default withApi(['POST', 'DELETE', 'GET'], async (req, res) => {
    if (req.method === 'GET') {
        const folder = req.query.folder || 'uploads';
        const items = await storageService.list({ folder });
        return res.status(200).json({ success: true, data: items });
    }

    await authorizeAdmin(req);

    if (req.method === 'DELETE') {
        const key = req.body?.key || req.query.key;
        if (!key) {
            return res.status(400).json({ success: false, message: 'Key parameter is required for deletion' });
        }
        await storageService.delete({ key });
        return res.status(200).json({ success: true, message: 'File deleted successfully' });
    }

    await new Promise((resolve, reject) => {
        upload.single('file')(req, res, (error) => {
            if (error) {
                if (error instanceof multer.MulterError) {
                    return reject(Object.assign(new Error(error.message), { status: 400 }));
                }
                return reject(Object.assign(error, { status: 400 }));
            }
            resolve();
        });
    });

    if (!req.file) {
        throw Object.assign(new Error('File is required'), { status: 400 });
    }

    const folder = req.body?.folder || 'uploads';
    const uploadResult = await storageService.upload({ file: req.file, folder });

    const payload = {
        key: uploadResult.key,
        r2_object_key: uploadResult.key,
        url: uploadResult.url,
        name: uploadResult.name,
        original_filename: uploadResult.name,
        size: uploadResult.size,
        file_size: uploadResult.size,
        type: uploadResult.type,
        content_type: uploadResult.type,
        storage_provider: process.env.STORAGE_PROVIDER || 'supabase',
    };

    console.log('[R2 Upload Success]', {
        key: payload.key,
        bucket: process.env.R2_BUCKET || process.env.SUPABASE_STORAGE_BUCKET || 'uploads',
        url: payload.url,
        name: payload.name,
        size: payload.size,
        type: payload.type,
    });

    return res.status(201).json({ success: true, data: payload });
});
