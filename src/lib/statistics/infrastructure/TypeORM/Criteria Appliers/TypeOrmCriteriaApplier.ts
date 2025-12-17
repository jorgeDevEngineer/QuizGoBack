import { SelectQueryBuilder } from "typeorm";
import { CriteriaApplier } from "../../../domain/port/CriteriaApplier";
import { CompletedQuizQueryCriteria } from "../../../application/Response Types/CompletedQuizQueryCriteria";

export class TypeOrmCriteriaApplier<Entity>
  implements CriteriaApplier<SelectQueryBuilder<Entity>, CompletedQuizQueryCriteria>
{
  apply(
    qb: SelectQueryBuilder<Entity>,
    criteria: CompletedQuizQueryCriteria,
    alias: string,
  ): SelectQueryBuilder<Entity> {
   // Paginación
   qb.limit(criteria.limit);
   qb.offset((criteria.page - 1) * criteria.limit);
   // Ordenamiento
   qb.orderBy(`${alias}.${criteria.orderBy}`, criteria.order);  
   return qb;
  }
}