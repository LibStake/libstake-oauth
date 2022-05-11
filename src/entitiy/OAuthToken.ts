import { Column, DeepPartial, Entity, Index, ManyToOne, } from 'typeorm';
import ExtendedEntity, { ExtendedEntityToObjectOption } from './base/ExtendedEntity';
import ClientUserRegistration, { ClientUserRegistrationToObjectOption } from './ClientUserRegistration';
export enum TokenType { ACCESS = 'ACCESS', REFRESH = 'REFRESH' };

export interface OAuthTokenToObjectOption extends ExtendedEntityToObjectOption {
    registration?: ClientUserRegistrationToObjectOption,
}

@Entity()
export default class OAuthToken extends ExtendedEntity {
    @ManyToOne(
        () => ClientUserRegistration,
        (registration) => registration.tokens,
        { eager: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' }
    )
    public registration!: ClientUserRegistration;

    @Column({ type: 'enum', enum: TokenType, enumName: 'token_type' })
    public token_type!: 'ACCESS'|'REFRESH';

    @Index({ unique: true })
    @Column({ type: 'char', length: '64', nullable: false })
    public token!: string;

    @Column({ type: 'datetime', nullable: false, default: () => `NOW()` })
    public issued_at!: Date;

    @Column({ type: 'int', nullable: false })
    public expires_in!: number;

    /**
     * Get plain object of `OAuthToken`.
     * If `id` key is undefined though check `include.key = true`, it means it is not real DB instance.
     * @param include Option to select columns that will not appear by default
     * @param reload If true and real instance of DB, will reload instance from DB.
     * @returns All or partial object of `OAuthToken`
     */
    public async toObject(
        include: OAuthTokenToObjectOption = {},
        reload: boolean = false,
    ): Promise<DeepPartial<OAuthToken>> {
        const ret = super.toObject(include, reload);
        Object.assign(ret, {
            token_type: this.token_type,
            token: this.token,
            issued_at: this.issued_at,
            expires_in: this.expires_in,
        });
        if (include.registration) Object.assign(ret, { registration: this.registration.toObject(include, false) });
        return ret;
    }

    /**
     * Returns whether this token is expired or not.
     */
    public get isExpired(): boolean {
        return (new Date().getTime() - (this.issued_at.getTime() + this.expires_in)) >= 0;
    }

    /**
     * Set token's `expires_in` to 0
     * @param tokens Token to expire
     */
    static async setExpired(tokens: OAuthToken[]): Promise<void> {
        const ids = tokens.map(tk => tk.id);
        await this.createQueryBuilder()
            .update()
            .set({ expires_in: 0 })
            .whereInIds(ids).execute();
        return;
    }

    /**
     * Get single or null `OAuthToken` via primary key
     */
    static async findById(id: number): Promise<OAuthToken|null> {
        return await this.createQueryBuilder()
            .where('id = :id', { id }).getOne();
    }

    /**
     * Get single or null `OAuthToken` via token and optionally type
     */
    static async findByToken(token: string, token_type: TokenType|undefined): Promise<OAuthToken|null> {
        if (token_type)
            return await this.createQueryBuilder()
                .where('token = :token', { token })
                .andWhere('token_type = :token_type', { token_type })
                .getOne();
        else
            return await this.createQueryBuilder()
                .where('token = :token', { token })
                .getOne();
    }
}