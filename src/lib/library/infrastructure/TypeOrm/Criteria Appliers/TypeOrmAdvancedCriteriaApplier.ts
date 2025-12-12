import { SelectQueryBuilder } from "typeorm";
import { CriteriaApplier } from "../../../domain/port/CriteriaApplier";
import { QuizQueryCriteria } from "../../../domain/valueObject/QuizQueryCriteria";

export class TypeOrmQuizCriteriaApplier<Entity>
  implements CriteriaApplier<SelectQueryBuilder<Entity>, QuizQueryCriteria>
{
  apply(
    qb: SelectQueryBuilder<Entity>,
    criteria: QuizQueryCriteria,
    alias: string,
  ): SelectQueryBuilder<Entity> {
     // Ordenamiento
        qb.orderBy(`${alias}.${criteria.orderBy}`, criteria.order);   
  
      // Filtro por status
      if (criteria.status !== 'all') {
        qb.andWhere(`${alias}.status = :status`, { status: criteria.status });
      }
  
      // Filtro por visibility
      if (criteria.visibility !== 'all') {
        qb.andWhere(`${alias}.visibility = :visibility`, { visibility: criteria.visibility });
      }
  
      // Filtro por categorías
      if ( criteria.categories.length > 0) {
        qb.andWhere(`${alias}.category IN (:...categories)`, { categories: criteria.categories });
      }
  
      // Filtro por búsqueda textual
      if (criteria.search) {
        qb.andWhere(`${alias}.title ILIKE :search OR ${alias}.description ILIKE :search`, {
          search: `%${criteria.search}%`,
        });
      }
  
      // Filtro genérico q
      if (criteria.q) {
        qb.andWhere(`${alias}.id = :q`, { q: criteria.q });
      }

      return qb;  
  }
}