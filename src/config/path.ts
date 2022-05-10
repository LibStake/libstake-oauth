import path from 'path';
const PROJECT_ROOT = path.normalize(process.cwd());
const CERT_PATH = path.normalize(path.join(PROJECT_ROOT, '/cert/'));
const PUBLIC_PATH = path.normalize(path.join(PROJECT_ROOT, '/public/'));
export {
    PROJECT_ROOT,
    CERT_PATH,
    PUBLIC_PATH,
}
