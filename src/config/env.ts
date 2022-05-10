import path from 'path';
import dotenv from "dotenv";

export const loadServerEnvironment = () => {
    try {
        dotenv.config({
            path: path.join(process.cwd(), 'env', '.env'),
        });
    } catch (err) {
        throw err;
    }
};
