import { BaseEntity, DeepPartial, Entity, PrimaryGeneratedColumn, TypeORMError } from 'typeorm';

export interface ExtendedEntityToObjectOption {
    id?: boolean,
    [key: string]: any,
}

@Entity()
export default class ExtendedEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    public readonly id!: number;

    /**
     * Get plain object of Instance.
     *
     * Note that, calling reference entity which is not `eager` loaded will result in infinite loop over entity.
     *
     * Only owner can call its ref key.
     *
     * This should be called from its child class.
     * @param include
     * @param reload
     */
    public async toObject(
        include: ExtendedEntityToObjectOption = {},
        reload: boolean = false,
    ): Promise<DeepPartial<ExtendedEntity>> {
        if (reload && this.hasId()) await this.reload();
        else if (reload && !this.hasId())
            throw new TypeORMError('Unable to reload un-instantiated entity.');

        const ret = {}
        if (include.id) Object.assign(ret, { id: this.id });
        return ret;
    }

    /**
     * Get single or null Instance via primary key
     * - This should be overriden if needed.
     */
    static async findById(id: number): Promise<ExtendedEntity|null> {
        return await this.createQueryBuilder()
            .where('id = :id', { id }).getOne();
    }
}