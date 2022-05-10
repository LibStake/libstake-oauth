import Schema, { Type, boolean, string } from 'computed-types';
import { EmailRegex, NationalPhoneNumber } from '../regex';

const GetUserInfoQuerySchema = Schema.either(
    Schema({}, { strict: true }), // As User
    Schema({    // As Admin
        via: string.equals('classifier'),
        target_id: string,
    }, { strict: true }),
);
export type GetUserInfoParam = Type<typeof GetUserInfoQuerySchema>;
export const GetUserInfoParamValidator = GetUserInfoQuerySchema.destruct();

const UpdateUserInfoBodySchema = Schema({
    realname: string.min(1).strictOptional(),
    mobile: string.regexp(NationalPhoneNumber).strictOptional(),
}, { strict: true });
export type UpdateUserInfoBody = Type<typeof UpdateUserInfoBodySchema>;
export const UpdateUserInfoBodyValidator = UpdateUserInfoBodySchema.destruct();

const SignupBodySchema = Schema({
    email: EmailRegex,
    username: string.min(2),
    realname: string.min(2).strictOptional(),
    password: string.min(1),
    mobile: NationalPhoneNumber,
}, { strict: true });
export type SignupBody = Type<typeof SignupBodySchema>;
export const SignupBodyValidator = SignupBodySchema.destruct();

/* No Sign-out Schema */

const LoginBodySchema = Schema({
        email: EmailRegex,
        password: string.min(1),
        save_email: boolean.strictOptional(),
        stay_logged_in: boolean.strictOptional(),
}, { strict: true });
export type LoginBody = Type<typeof LoginBodySchema>;
export const LoginBodyValidator = LoginBodySchema.destruct();

const GetTokenInfoQuerySchema = Schema.either(
    Schema({}, { strict: true }),   // As User
    Schema({    // As Admin
        via: string.equals('classifier'),
        target_id: string,
    }, { strict: true })
);
export type GetTokenInfoQuerySchema = Type<typeof GetTokenInfoQuerySchema>;
export const GetTokenInfoQueryValidator = GetTokenInfoQuerySchema.destruct();

const UnlinkBodySchema = Schema.either(
    Schema({    // As User & Admin
        via: string.equals('classifier'),
        target_id: string,
    }, { strict: true }),
);
export type UnlinkBody = Type<typeof UnlinkBodySchema>;
export const UnlinkBodyValidator = UnlinkBodySchema.destruct();

/* No Log-out Schema */

// TODO: TBD
// const LinkTermBodySchema = Schema({
//     allow_access_personal_information: boolean.equals(true).strictOptional(),
// }, { strict: true });
// export type LinkTermBody = Type<typeof LinkTermBodySchema>;
// export const LinkTermBodyValidator = LinkTermBodySchema.destruct();