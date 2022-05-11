import Schema, { Type, string } from 'computed-types';
import { WebURLRegex } from '../regex';

const AccessCodeGrantQuerySchema = Schema({
    client_id: string.min(1),
    redirect_uri: WebURLRegex,
    state: string.min(1).strictOptional(), // TODO: Implement anti-csrf
}, { strict: true });
export type AccessCodeGrantQuery = Type<typeof AccessCodeGrantQuerySchema>;
export const AccessCodeGrantValidator = AccessCodeGrantQuerySchema.destruct();

const GetTokenBodySchema = Schema.either(
        Schema({
            // Token via code
            type: string.equals('grant_code'),
            client_id: string.min(1),
            code: string.min(1),
            client_secret: string.min(1).strictOptional(),
        }, { strict: true }),
        Schema({
            // Token via refresh token
            type: string.equals('refresh_token'),
            client_id: string.min(1),
            refresh_token: string.min(1),
            client_secret: string.min(1).strictOptional(),
        }, { strict: true }),
);
export type GetTokenBody = Type<typeof GetTokenBodySchema>;
export const GetTokenBodyValidator = GetTokenBodySchema.destruct();

