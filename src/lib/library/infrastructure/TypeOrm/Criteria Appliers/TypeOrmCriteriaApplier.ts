import { SelectQueryBuilder } from "typeorm";
import { CriteriaApplier } from "../../../domain/port/CriteriaApplier";
import { QuizQueryCriteria } from "../../../domain/valueObject/QuizQueryCriteria";

export class TypeOrmCriteriaApplier<Entity>
  implements CriteriaApplier<SelectQueryBuilder<Entity>, QuizQueryCriteria>
{
  apply(
    qb: SelectQueryBuilder<Entity>,
    criteria: QuizQueryCriteria,
    alias: string,
  ): SelectQueryBuilder<Entity> {
   // Paginación
   qb.limit(criteria.limit);
   qb.offset((criteria.page - 1) * criteria.limit);
   return qb;
  }
}