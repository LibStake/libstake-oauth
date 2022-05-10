import {
    Entity,
    Column,
    Index,
    ManyToOne,
    DeepPartial,
} from 'typeorm';
import data_source from '../data_source';
import ExtendedEntity, { ExtendedEntityToObjectOption } from './base/ExtendedEntity';
import ClientInfo from './ClientInfo';

export interface ClientOAuthCallbackToObjectOption extends ExtendedEntityToObjectOption{
    client?: ClientOAuthCallbackToObjectOption,
}

@Entity()
export default class ClientOAuthCallback extends ExtendedEntity {
    @ManyToOne(
        () => ClientInfo,
        (client) => client.callbacks,
        { eager: true, nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' }
    )
    public client!: ClientInfo;

    @Column({ type: 'text', nullable: false })
    public url_origin!: string

    @Index({ unique: true })
    @Column({ type: 'text', nullable: false })
    public callback_url!: string;

    /**
     * Get plain object of `ClientOAuthCallback`
     * If `id` key is undefined though check `include.key = true`, it means it is not real DB instance.
     * @param include Option to select columns that will not appear by default
     * @param reload If true and real instance of DB, will reload instance from DB
     * @returns All or partial object of `ClientOAuthCallback`
     */
    public async toObject(
        include: ClientOAuthCallbackToObjectOption = {},
        reload: boolean = false
    ): Promise<DeepPartial<ClientOAuthCallback>> {
        const ret = super.toObject(include, reload)
        Object.assign(ret, { callback_url: this.callback_url, })
        if (include.client) Object.assign(ret, { client: this.client.toObject(include.client, false) });
        return ret;
    }

    /**
     * Create client-lined CallbackUri
     * @param client `ClientInfo` Instance
     * @param callback_uris Callback uri or its array
     * @returns Instances of create `ClientOAuthCallback`
     */
    static async createCallbackUri(
        client: ClientInfo,
        callback_uris: string|Array<string>,
    ): Promise<Array<ClientOAuthCallback>> {
        if (!Array.isArray(callback_uris))
            callback_uris = [ callback_uris ];
        const qr = data_source.createQueryRunner();
        await qr.connect();
        try {
            const redirectUriDrafts = callback_uris.map(
                uri => {
                    const redirectUri = qr.manager.create(ClientOAuthCallback);
                    redirectUri.client = client;
                    redirectUri.callback_url = uri;
                    return redirectUri;
                }
            );
            return await qr.manager.save(redirectUriDrafts);
        } catch (err) {
            throw err;
        } finally {
            await qr.release();
        }
    }
}
