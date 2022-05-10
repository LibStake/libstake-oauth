import OAuthToken from './entitiy/OAuthToken';
import ClientInfo from './entitiy/ClientInfo';
import UserInfo from './entitiy/UserInfo';
import ClientUserRegistration from './entitiy/ClientUserRegistration';

export enum AuthenticationType {
    SERVICE_ADMIN = 'SERVICE_ADMIN', // via Client Admin Key
    USER = 'USER', // via Registration unique user id
}
export enum RequestHeaderAuthorizationSchema {
    BEARER = 'bearer',      // via Client Admin Key
    ADMIN_KEY = 'adminkey', // via Registration unique user id
}
export interface ResponseLocalAuthentication {
    type: AuthenticationType,
    token?: OAuthToken, // OAuthToken for OAuth, If Client Admin, undefined
    identity: UserInfo | ClientInfo | ClientUserRegistration;
}
export interface ResponseLocal {
    authentication?: ResponseLocalAuthentication,
}

