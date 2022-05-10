### How to implement entity with extension of `ExtendedEntity`
1. Must implement `public async toObject(include, reload): Promise<DeepPartial<T>>`
2. Only owner entity of relationship must mark `reference` column as `eager load`.
3. Otherwise, ownee entity, column must be marked as `lazy-load` by typing it as `Promise<T>`
4. Any `include` option must not provide field that not marked as `eager load`.
   In other word, `Promise` type column must not provided as `include` option.
   This results in infinite loop over entity relationship.