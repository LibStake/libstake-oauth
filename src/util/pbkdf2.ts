// TODO: Change digest to HMAC-SHA-512
import { randomBytes, pbkdf2Sync } from 'crypto';
import server_logger from '../config/server_logger';

const HASH_BYTE_LENGTH: number = parseInt(process.env.PBKDF2_HASH_BYTE_LENGTH || '0') || 0;
const SALT_BYTE_LENGTH: number = parseInt(process.env.PBKDF2_SALT_BYTE_LENGTH || '0') || 0;
const HASH_ITERATION: number = parseInt(process.env.PBKDF2_HASH_ITERATION || '0') || 0;
if (!HASH_BYTE_LENGTH || HASH_BYTE_LENGTH <= 0
    || !SALT_BYTE_LENGTH || HASH_BYTE_LENGTH <= 0
    || !HASH_ITERATION || HASH_ITERATION <= 0)
    throw new Error(`Essential PBKDF2 config missing. Check your server config.`);

/**
 * Create pbkdf2 digest of message
 * @param message Message to hash - Usually, password
 * @return Hex format hash digest
 */
export const hashPbkdf2 = async (message: string): Promise<string> => {
    try {
        const salt: Buffer = await new Promise<Buffer>((resolve, reject) => {
            randomBytes(SALT_BYTE_LENGTH, (err, salt) => err?reject(err):resolve(salt));
        });
        const hash: Buffer = pbkdf2Sync(message, salt, HASH_ITERATION, HASH_BYTE_LENGTH, 'sha512');
        let combined: Buffer = new Buffer(HASH_BYTE_LENGTH + SALT_BYTE_LENGTH + 8);
        combined.writeUInt32BE(salt.length, 0);
        combined.writeUInt32BE(HASH_ITERATION, 4);
        salt.copy(combined, 8);
        hash.copy(combined, salt.length + 8);
        server_logger.debug(`Password hashing config\n` +
            `HASH_BYTE_LENGTH = ${HASH_BYTE_LENGTH}\n` +
            `SALT_BYTE_LENGTH = ${SALT_BYTE_LENGTH}\n` +
            `HASH_ITERATION = ${HASH_ITERATION}`);
        server_logger.debug(`Generated pbkdf2 key '${combined.toString('hex')}'`);
        return combined.toString('hex');
    } catch (err) {
        throw err;
    }
};

/**
 * Verify incoming password with prepared digest
 * @param password Plain text password to verify
 * @param digest Prepared hash digest to compare
 * @return True if password is verified else False
 */
export const verifyPbkdf2 = (password: string, digest: Buffer): boolean => {
    try {
        const salt_length: number = digest.readUInt32BE(0);
        const hash_length: number = digest.length - salt_length - 8;
        const num_iteration: number = digest.readUInt32BE(4);
        const digest_salt: Buffer = digest.slice(8, salt_length + 8);
        const digest_hash: string = digest.toString('binary', salt_length + 8);
        const password_digest: Buffer = pbkdf2Sync(password, digest_salt, num_iteration, hash_length, 'sha512');
        return password_digest.toString('hex') === digest_hash;
    } catch (err) {
        throw err;
    }
}
