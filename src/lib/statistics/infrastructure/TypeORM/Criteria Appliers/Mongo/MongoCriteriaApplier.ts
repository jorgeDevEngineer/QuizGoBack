import { CriteriaApplier } from "../../../../domain/port/CriteriaApplier";
import { CompletedQuizQueryCriteria } from "../../../../application/Response Types/CompletedQuizQueryCriteria";
import { Filter, FindOptions } from "mongodb";

export type MongoFindParams<T> = {
  filter: Filter<T>; // 🔑 Condiciones de búsqueda (ej: { playerId, status })
  options?: FindOptions; // 🔑 Configuración de la consulta (skip, limit, sort, projection, etc.)
};

/**
 * CriteriaApplier para Mongo: aplica paginación y ordenamiento
 */
export class MongoCriteriaApplier<T>
  implements CriteriaApplier<MongoFindParams<T>, CompletedQuizQueryCriteria>
{
  apply(
    params: MongoFindParams<T>,
    criteria: CompletedQuizQueryCriteria
  ): MongoFindParams<T> {
    const options: FindOptions = params.options ?? {};

    if (criteria.limit) options.limit = criteria.limit;
    if (criteria.page) options.skip = (criteria.page - 1) * criteria.limit;
    if (criteria.orderBy) {
      options.sort = { [criteria.orderBy]: criteria.order === "ASC" ? 1 : -1 };
    }

    return { filter: params.filter, options };
  }
}
