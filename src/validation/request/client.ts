import Schema, {Type, string, array, boolean} from 'computed-types';
import { WebURLRegex, EmailRegex, ArrayWebURLRegex } from '../regex';

const RegisterClientBodySchema = Schema({
    name: string.min(2),
    description: string.strictOptional(),
    email: EmailRegex,
    management_email: EmailRegex,
    homepage_url: WebURLRegex,
    redirect_uris: ArrayWebURLRegex,
}, { strict: true });
export type RegisterClientBody = Type<typeof RegisterClientBodySchema>;
export const RegisterClientBodyValidator = RegisterClientBodySchema.destruct();

const GetClientInfoBodySchema = Schema({
    client_id: string.min(1),
}, { strict: true });
export type GetClientInfoBody = Type<typeof GetClientInfoBodySchema>;
export const GetClientInfoBodyValidator = GetClientInfoBodySchema.destruct();

const UpdateClientBodySchema = Schema({
    client_id: string.min(1),
    description: string.strictOptional(),
    email: string.regexp(EmailRegex).strictOptional(),
    management_email: string.regexp(EmailRegex).strictOptional(),
    homepage_url: string.regexp(WebURLRegex).strictOptional(),
    redirect_uris: string.regexp(ArrayWebURLRegex).strictOptional(),
}, { strict: true });
export type UpdateClientBody = Type<typeof UpdateClientBodySchema>;
export const UpdateClientBodyValidator = UpdateClientBodySchema.destruct();

const DeleteClientBodySchema = Schema({
    client_id: string.min(1),
    permanently: boolean.strictOptional(),
}, { strict: true });
export type DeleteClientBody = Type<typeof DeleteClientBodySchema>;
export const DeleteClientBodyValidator = DeleteClientBodySchema.destruct();

const RenewClientCredentialBodySchema = Schema({
    client_id: string.min(1),
    which: Schema.either(string.equals('secret'), string.equals('admin_key')),
}, { strict: true });
export type RenewClientCredentialBody = Type<typeof RenewClientCredentialBodySchema>;
export const RenewClientCredentialBodyValidator = RenewClientCredentialBodySchema.destruct();
