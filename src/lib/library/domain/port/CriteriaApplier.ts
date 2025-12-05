import { QueryCriteria } from "../valueObject/QueryCriteria";

export interface CriteriaApplier<TQuery> {
    apply(qb: TQuery, criteria: QueryCriteria, alias?: string): TQuery;
  }  