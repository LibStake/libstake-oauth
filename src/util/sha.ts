import { v4 } from 'uuid';
import { Hash, createHash } from 'crypto';

export const randomSHA256 = () => {
    const hash: Hash = createHash('sha256');
    hash.update(v4());
    return hash.digest();
};
export const randomSHA512 = () => {
    const hash: Hash = createHash('sha512');
    hash.update(v4());
    return hash.digest();
};

export const toSHA256 = (message: string) => {
    const hash: Hash = createHash('sha256');
    hash.update(message);
    return hash.digest();
};
export const toSHA512 = (message: string) => {
    const hash: Hash = createHash('sha512');
    hash.update(message);
    return hash.digest();
};
