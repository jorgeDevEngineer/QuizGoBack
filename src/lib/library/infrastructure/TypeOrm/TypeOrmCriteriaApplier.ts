import { SelectQueryBuilder } from "typeorm";
import { CriteriaApplier } from "../../domain/port/CriteriaApplier";
import { QueryCriteria } from "../../domain/valueObject/QueryCriteria";

export class TypeOrmCriteriaApplier<Entity>
  implements CriteriaApplier<SelectQueryBuilder<Entity>>
{
  apply(
    qb: SelectQueryBuilder<Entity>,
    criteria: QueryCriteria,
    alias: string,
  ): SelectQueryBuilder<Entity> {
   // Paginación
   qb.limit(criteria.limit);
   qb.offset((criteria.page - 1) * criteria.limit);
   return qb;
  }
}