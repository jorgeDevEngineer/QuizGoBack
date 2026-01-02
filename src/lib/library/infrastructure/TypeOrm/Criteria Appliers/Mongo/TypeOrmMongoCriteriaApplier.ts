import { FindOptionsWhere, FindOptionsOrder } from "typeorm";
import { CriteriaApplier } from "../../../../domain/port/CriteriaApplier";
import { QuizQueryCriteria } from "../../../../application/Response Types/QuizQueryCriteria";

/**
 * CriteriaApplier genérico para Mongo
 * Transforma criterios en opciones de búsqueda para cualquier entidad
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
      QuizQueryCriteria
    >
{
  apply(
    options: {
      where: FindOptionsWhere<Entity>;
      skip?: number;
      take?: number;
      order?: FindOptionsOrder<Entity>;
    },
    criteria: QuizQueryCriteria,
    alias?: string // no se usa en Mongo, pero se mantiene para compatibilidad
  ) {
    // 🔹 Paginación
    options.take = criteria.limit;
    options.skip = (criteria.page - 1) * criteria.limit;
    return options;
  }
}
