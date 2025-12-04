import { SelectQueryBuilder } from "typeorm";
import { CriteriaApplier } from "../../domain/port/CriteriaApplier";
import { QueryCriteria } from "../../domain/valueObject/QueryCriteria";

export class TypeOrmAdvancedCriteriaApplier<Entity>
  implements CriteriaApplier<SelectQueryBuilder<Entity>>
{
  apply(
    qb: SelectQueryBuilder<Entity>,
    criteria: QueryCriteria,
    alias: string,
  ): SelectQueryBuilder<Entity> {
     // Ordenamiento
     if (criteria.orderBy === 'recent') {
        qb.orderBy(`${alias}.createdAt`, 'DESC');
      } else {
        qb.orderBy(`${alias}.${criteria.orderBy}`, criteria.order);
      }
  
      // Filtro por status
      if (criteria.status && criteria.status !== 'all') {
        qb.andWhere(`${alias}.status = :status`, { status: criteria.status });
      }
  
      // Filtro por visibility
      if (criteria.visibility && criteria.visibility !== 'all') {
        qb.andWhere(`${alias}.visibility = :visibility`, { visibility: criteria.visibility });
      }
  
      // Filtro por categorías
      if (criteria.categories && criteria.categories.length > 0) {
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