import { FindOptionsWhere, FindOptionsOrder } from "typeorm";
import { CriteriaApplier } from "../../../../domain/port/CriteriaApplier";
import { QuizQueryCriteria } from "../../../../application/Response Types/QuizQueryCriteria";
import { Filter, FindOptions } from "mongodb";

/**
 * CriteriaApplier genérico para Mongo
 * Transforma criterios en opciones de búsqueda para cualquier entidad
 */
type MongoFindParams<T> = {
  filter: Filter<T>;
  options?: FindOptions;
};

export class MongoCriteriaApplier<Entity>
  implements CriteriaApplier<MongoFindParams<any>, QuizQueryCriteria>
{
  apply(
    params: MongoFindParams<any>,
    criteria: QuizQueryCriteria,
    alias?: string // no se usa en Mongo, pero se mantiene para compatibilidad
  ): MongoFindParams<any> {
    const options: FindOptions = params.options ?? {};

    // 🔹 Límite
    if (criteria.limit) {
      options.limit = criteria.limit;
    }

    // 🔹 Paginación
    if (criteria.page) {
      options.skip = (criteria.page - 1) * criteria.limit;
    }

    return { filter: params.filter, options };
  }
}
