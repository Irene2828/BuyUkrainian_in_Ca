import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../server/app';

export default function handler(req: VercelRequest, res: VercelResponse) {
    // Vercel serverless function entry point
    // Passes the request/response to the Express app
    return app(req, res);
}
