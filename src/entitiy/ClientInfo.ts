import {
    Entity,
    Column,
    Index,
    OneToMany,
    DeepPartial,
    TypeORMError,
} from 'typeorm';
import data_source from '../data_source';
import ExtendedEntity, { ExtendedEntityToObjectOption } from './base/ExtendedEntity';
import ClientOAuthCallback from './ClientOAuthCallback';
import ClientUserRegistration from './ClientUserRegistration';
import { v4 } from 'uuid';
import { randomSHA256, randomSHA512 } from '../util/sha';

export interface ClientInfoToObjectOption extends ExtendedEntityToObjectOption{
    client_id?: boolean,
    secret?: boolean,
    admin_key?: boolean,
}

@Entity()
export default class ClientInfo extends ExtendedEntity {
    @Index({ unique: true })
    @Column({type: 'tinytext', nullable: false})
    public client_id!: string;     // uuid

    @Column({type: 'text', nullable: true, default: null})
    public client_secret!: string; // SHA256

    @Column({type: 'tinytext', nullable: false})
    public client_mgmt_email!: string;

    @Index({ unique: true })
    @Column({type: 'text', nullable: false})
    public client_admin_key!: string;  // SHA512

    @Column({type: 'text', nullable: true, default: null})
    public application_logo!: string;

    @Column({type: 'tinytext', nullable: false, unique: true})
    public application_name!: string;

    @Column({type: 'longtext', nullable: false, default: ''})
    public application_description!: string;

    @Column({type: 'tinytext', nullable: false})
    public application_email!: string;

    @Column({type: 'text', nullable: false})
    public application_homepage_url!: string;

    @OneToMany(
        () => ClientOAuthCallback,
        (callback) => callback.client,
    )
    public callbacks!: Promise<ClientOAuthCallback[]>;

    @OneToMany(
        () => ClientUserRegistration,
        (registration) => registration.client,
    )
    registrations!: Promise<ClientUserRegistration[]>;

    /**
     * Get plain object of `ClientInfo`.
     * If `id` key is undefined though check `include.key = true`, it means it is not real DB instance.
     * @param include Option to select columns that will not appear by default
     * @param reload If true and real instance of DB, will reload instance from DB.
     * @returns All or partial object of `ClientInfo`
     */
    public async toObject(
        include: ClientInfoToObjectOption = {},
        reload: boolean = false
    ): Promise<DeepPartial<ClientInfo>> {
        const ret = super.toObject(include, reload);
        Object.assign(ret, {
            client_mgmt_email: this.client_mgmt_email,
                application_logo: this.application_logo,
            application_name: this.application_name,
            application_description: this.application_description,
            application_email: this.application_email,
            application_homepage_url: this.application_homepage_url,
        });
        if (include.client_id) Object.assign(ret, { client_id: this.client_id });
        if (include.secret) Object.assign(ret, { secret: this.client_secret });
        if (include.admin_key) Object.assign(ret, { admin_key: this.client_admin_key });
        return ret;
    }

    /**
     * Get single or null `ClientInfo` via primary key
     */
    static async findById(id: number): Promise<ClientInfo|null> {
        return await this.createQueryBuilder()
            .where('id = :id', { id }).getOne();
    }

    /**
     * Get single or null `ClientInfo` via `client_id`
     */
    static async findByClientId(client_id: string): Promise<ClientInfo|null> {
        return await this.createQueryBuilder()
            .where('client_id = :client_id', { client_id }).getOne();
    }

    /**
     * Get single or null `ClientInfo` via 'client_admin_key`
     */
    static async findByAdminKey(client_admin_key: string): Promise<ClientInfo|null> {
        return await this.createQueryBuilder()
            .where('client_admin_key = ; :client_admin_key', { client_admin_key }).getOne();
    }

    /**
     * Create clientinfo with(or without) redirect uris.
     *
     * If `client_id`, `client_secret`, `client_admin_key` is undefined, create one for insertion.
     * Any required field must have value to insert.
     * @param clientInfoField Draft `ClientInfo` - Must have all required columns.
     * @param redirect_uris List of uris to create with, if none given, does not create related uris
     * @returns Created `ClientInfo` instance
     */
    static async createClientInfo(
        clientInfoField: DeepPartial<ClientInfo>,
        redirect_uris: Array<string>|undefined
    ): Promise<ClientInfo> {
        if (!clientInfoField.client_mgmt_email ||
            !clientInfoField.application_name ||
            !clientInfoField.application_email ||
            !clientInfoField.application_homepage_url)
            throw new TypeORMError(`No field value to insert on required field.`);

        if (!clientInfoField.client_id) clientInfoField.client_id = v4();
        if (!clientInfoField.client_secret) clientInfoField.client_secret = randomSHA256().toString();
        if (!clientInfoField.client_admin_key) clientInfoField.client_admin_key = randomSHA512().toString();

        const qr = data_source.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();
        try {
            const clientInfoDraft = qr.manager.create(ClientInfo);
            clientInfoDraft.client_id = clientInfoField.client_id;
            clientInfoDraft.client_secret = clientInfoField.client_secret;
            clientInfoDraft.client_mgmt_email = clientInfoField.client_mgmt_email;
            clientInfoDraft.client_admin_key = clientInfoField.client_admin_key;
            if (clientInfoField.application_logo)
                clientInfoDraft.application_logo = clientInfoField.application_logo;
            clientInfoDraft.application_name = clientInfoField.application_name;
            if (clientInfoField.application_description)
                clientInfoDraft.application_description = clientInfoField.application_description;
            clientInfoDraft.application_email = clientInfoField.application_email;
            clientInfoDraft.application_homepage_url = clientInfoField.application_homepage_url;
            const clientInfo = await clientInfoDraft.save();

            if(redirect_uris) {
                const redirectUriDrafts = redirect_uris.map(
                    uri => {
                        const redirectUri = qr.manager.create(ClientOAuthCallback);
                        redirectUri.client = clientInfo;
                        redirectUri.callback_url = uri;
                        return redirectUri;
                    }
                );
                await qr.manager.save(redirectUriDrafts);
            }

            await qr.commitTransaction();
            await clientInfo.reload();
            return clientInfo;
        } catch (err) {
            await qr.rollbackTransaction();
            throw err;
        } finally {
            await qr.release();
        }
    }
}
