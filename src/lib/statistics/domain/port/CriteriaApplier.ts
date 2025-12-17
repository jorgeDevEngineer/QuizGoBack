export interface CriteriaApplier<TQuery, TCriteria> {
    apply(qb: TQuery, criteria: TCriteria, alias?: string): TQuery;
  }  