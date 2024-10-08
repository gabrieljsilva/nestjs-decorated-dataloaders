/**
 * Relations type used to circumvent ESM tests circular dependency issue
 * caused by reflection metadata saving the type of the property.
 */
export type Relation<T> = T;
