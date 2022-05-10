import Schema, { Type, boolean, string } from 'computed-types';
import { EmailRegex, NationalPhoneNumber } from '../regex';

const SignupBodySchema = Schema({
    email: EmailRegex,
    username: string.min(2),
    realname: string.min(2).strictOptional(),
    password: string.min(1),
    mobile: NationalPhoneNumber,
}, { strict: true });
export type SignupBody = Type<typeof SignupBodySchema>;
export const SignupBodyValidator = SignupBodySchema.destruct();

const LoginBodySchema = Schema({
        email: EmailRegex,
        password: string.min(1),
        save_email: boolean.strictOptional(),
        stay_logged_in: boolean.strictOptional(),
}, { strict: true });
export type LoginBody = Type<typeof LoginBodySchema>;
export const LoginBodyValidator = LoginBodySchema.destruct();

const LinkTermBodySchema = Schema({
        allow_access_personal_information: boolean.equals(true).strictOptional(),
}, { strict: true });
export type LinkTermBody = Type<typeof LinkTermBodySchema>;
export const LinkTermBodyValidator = LinkTermBodySchema.destruct();

const UnlinkBodySchema = Schema.either(
    Schema({}, { strict: true }), // As User
    Schema({    // As Admin
        via: string.equals('classifier'),
        target_id: string,
    }, { strict: true }),
);
export type UnlinkBody = Type<typeof UnlinkBodySchema>;
export const UnlinkBodyValidator = UnlinkBodySchema.destruct();

const GetUserInfoParamSchema = Schema.either(
    Schema({}, { strict: true }), // As User
    Schema({    // As Admin
        via: string.equals('classifier'),
        target_id: string,
    }, { strict: true }),
);
export type GetUserInfoParam = Type<typeof GetUserInfoParamSchema>;
export const GetUserInfoParamValidator = GetUserInfoParamSchema.destruct();
