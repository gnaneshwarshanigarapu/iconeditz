import multer from 'multer';
import { uploadToR2 } from './lib/r2.js';
import { authorizeAdmin } from './lib/auth.js';
import { withApi } from './lib/handler.js';

const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/zip'
];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, videos, and zip files are allowed.'), false);
        }
    }
});

export const config = { api: { bodyParser: false } };

export default withApi(['POST'], async (req, res) => {
    authorizeAdmin(req);
    
    await new Promise((resolve, reject) => {
        upload.single('file')(req, res, (error) => {
            if (error) {
                // Make multer errors more specific
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

    const uploadResult = await uploadToR2(req.file, req.body.folder || 'uploads');
    
    res.status(201).json({ data: uploadResult });
});

