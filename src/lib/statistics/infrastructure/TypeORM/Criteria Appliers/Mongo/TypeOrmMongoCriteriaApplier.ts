import { FindOptionsWhere, FindOptionsOrder } from "typeorm";
import { CriteriaApplier } from "../../../../domain/port/CriteriaApplier";
import { CompletedQuizQueryCriteria } from "../../../../application/Response Types/CompletedQuizQueryCriteria";

/**
 * CriteriaApplier para Mongo: aplica paginación y ordenamiento
 */
export class MongoCriteriaApplier<Entity>
  implements
    CriteriaApplier<
      {
        where: FindOptionsWhere<Entity>;
        skip?: number;
        take?: number;
        order?: FindOptionsOrder<Entity>;
      },
      CompletedQuizQueryCriteria
    >
{
  apply(
    options: {
      where: FindOptionsWhere<Entity>;
      skip?: number;
      take?: number;
      order?: FindOptionsOrder<Entity>;
    },
    criteria: CompletedQuizQueryCriteria,
    alias: string // no se usa en Mongo, pero se mantiene para compatibilidad
  ) {
    // 🔹 Paginación
    options.take = criteria.limit;
    options.skip = (criteria.page - 1) * criteria.limit;

    // 🔹 Ordenamiento
    if (criteria.orderBy) {
      options.order = {
        [criteria.orderBy]: criteria.order,
      } as any;
    }

    return options;
  }
}
