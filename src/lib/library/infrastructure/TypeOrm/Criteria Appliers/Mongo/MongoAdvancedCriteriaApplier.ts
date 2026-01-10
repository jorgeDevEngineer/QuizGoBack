import { Filter, FindOptions } from "mongodb";
import { CriteriaApplier } from "../../../../domain/port/CriteriaApplier";
import { QuizQueryCriteria } from "../../../../application/Response Types/QuizQueryCriteria";

export type MongoFindParams<T> = {
  filter: Filter<T>;
  options?: FindOptions;
};

export class MongoAdvancedCriteriaApplier<T>
  implements CriteriaApplier<MongoFindParams<T>, QuizQueryCriteria>
{
  apply(
    params: MongoFindParams<T>,
    criteria: QuizQueryCriteria,
    alias?: string // no se usa en Mongo, pero se mantiene para compatibilidad
  ): MongoFindParams<T> {
    // Usamos un objeto plano para construir el filtro
    const rawFilter: Record<string, any> = { ...params.filter };
    const options: FindOptions = params.options ?? {};

    // 🔹 Ordenamiento
    if (criteria.orderBy) {
      options.sort = { [criteria.orderBy]: criteria.order === "ASC" ? 1 : -1 };
    }

    // 🔹 Filtro por status
    if (criteria.status !== "all") {
      rawFilter.status = criteria.status;
    }

    // 🔹 Filtro por visibility
    if (criteria.visibility !== "all") {
      rawFilter.visibility = criteria.visibility;
    }

    // 🔹 Filtro por categorías
    if (criteria.categories.length > 0) {
      rawFilter.category = { $in: criteria.categories };
    }

    // 🔹 Filtro por búsqueda textual
    if (criteria.search) {
      rawFilter.$or = [
        { title: { $regex: criteria.search, $options: "i" } },
        { description: { $regex: criteria.search, $options: "i" } },
      ];
    }

    // 🔹 Filtro genérico q
    if (criteria.q) {
      rawFilter._id = criteria.q;
    }

    return { filter: rawFilter as Filter<T>, options };
  }
}
