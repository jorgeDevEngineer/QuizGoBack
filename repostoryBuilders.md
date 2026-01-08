# 📘 Documentación: Builders de Repositorios con Tokens

## 1. Objetivo

El patrón **Builder** se utiliza para construir repositorios de manera flexible y desacoplada, permitiendo seleccionar el motor de base de datos (Postgres o Mongo) y configurar las dependencias necesarias sin acoplar la lógica de construcción dentro de cada repositorio.

La mejora respecto a la versión anterior es que ahora los **builders reciben tokens de entidad** (`'Quiz'`, `'User'`, etc.) en lugar de clases concretas (`TypeOrmQuizEntity`, `MongoQuizEntity`).  
Esto evita que los módulos tengan que cambiar su código cuando se cambia de motor: el builder se encarga de mapear el token a la clase correcta.

---

## 2. Principios del diseño

- **Separación de responsabilidades**: el builder no ejecuta queries ni contiene lógica de negocio, solo construye repositorios.  
- **Flexibilidad**: permite cambiar el motor de base de datos mediante variables de entorno.  
- **Explicitez**: los repositorios se inyectan con métodos `withEntity('Token')`, y los *criteria appliers* se pasan directamente en los métodos `buildXRepository`.  
- **Extensibilidad**: cuando se implementen repositorios para Mongo, solo se reemplazan los `throw new Error(...)` por la construcción real.  
- **Consistencia**: todos los módulos usan tokens, evitando cambios masivos al cambiar de motor.

---

## 3. Estructura del Builder con tokens

### Ejemplo: `LibraryRepositoryBuilder`

```typescript
const entityMap = {
  postgres: {
    Quiz: TypeOrmQuizEntity,
    User: TypeOrmUserEntity,
    UserFavoriteQuiz: TypeOrmUserFavoriteQuizEntity,
    SinglePlayerGame: TypeOrmSinglePlayerGameEntity,
  },
  mongo: {
    Quiz: MongoQuizEntity,
    User: MongoUserEntity,
    UserFavoriteQuiz: MongoUserFavoriteQuizEntity,
    SinglePlayerGame: MongoSinglePlayerGameEntity,
  },
};

export class LibraryRepositoryBuilder {
  constructor(private readonly dbType: 'postgres' | 'mongo', private readonly dataSource: DataSource) {}

  private quizRepo?: Repository<TypeOrmQuizEntity> | MongoRepository<MongoQuizEntity>;
  private userRepo?: Repository<TypeOrmUserEntity> | MongoRepository<MongoUserEntity>;
  private userFavRepo?: Repository<TypeOrmUserFavoriteQuizEntity> | MongoRepository<MongoUserFavoriteQuizEntity>;
  private singleGameRepo?: Repository<TypeOrmSinglePlayerGameEntity> | MongoRepository<MongoSinglePlayerGameEntity>;

  withEntity(entityName: keyof typeof entityMap['postgres']) {
    const entityClass = entityMap[this.dbType][entityName];

    if (this.dbType === 'postgres') {
      switch (entityName) {
        case 'Quiz': this.quizRepo = this.dataSource.getRepository(entityClass); break;
        case 'User': this.userRepo = this.dataSource.getRepository(entityClass); break;
        case 'UserFavoriteQuiz': this.userFavRepo = this.dataSource.getRepository(entityClass); break;
        case 'SinglePlayerGame': this.singleGameRepo = this.dataSource.getRepository(entityClass); break;
      }
    } else {
      switch (entityName) {
        case 'Quiz': this.quizRepo = this.dataSource.getMongoRepository(entityClass); break;
        case 'User': this.userRepo = this.dataSource.getMongoRepository(entityClass); break;
        case 'UserFavoriteQuiz': this.userFavRepo = this.dataSource.getMongoRepository(entityClass); break;
        case 'SinglePlayerGame': this.singleGameRepo = this.dataSource.getMongoRepository(entityClass); break;
      }
    }

    return this;
  }

  buildQuizRepository(
    criteriaApplier: CriteriaApplier<SelectQueryBuilder<TypeOrmQuizEntity>, QuizQueryCriteria>
  ): IQuizRepository {
    if (this.dbType === 'postgres') {
      return new TypeOrmQuizRepository(this.quizRepo as Repository<TypeOrmQuizEntity>, criteriaApplier);
    }
    throw new Error('Mongo QuizRepository no implementado aún');
  }

  // ... resto de métodos build igual que antes
}
```

## 4. Uso en un Módulo

```typescript
 @Module({
  imports: [
    TypeOrmModule.forFeature([
      TypeOrmPostgresUserFavoriteQuizEntity,
      TypeOrmQuizEntity,
      TypeOrmUserEntity,
      TypeOrmSinglePlayerGameEntity,
    ]),
    LoggerModule,
  ],
  controllers: [LibraryController],
  providers: [
    {
      provide: "CriteriaApplier",
      useClass: TypeOrmCriteriaApplier, // implementación genérica
    },
    {
      provide: "AdvancedCriteriaApplier",
      useClass: TypeOrmQuizCriteriaApplier, // implementación avanzada
    },
    // Builder configurado con el motor desde variable de entorno
    {
      provide: "LibraryRepositoryBuilder",
      useFactory: (dataSource: DataSource) => {
        const dbType: "postgres" | "mongo" =
          (process.env.LIBRARY_DB_TYPE as "postgres" | "mongo") || "postgres";
        return new LibraryRepositoryBuilder(dbType, dataSource)
          .withEntity("Quiz")
          .withEntity("User")
          .withEntity("UserFavoriteQuiz")
          .withEntity("SinglePlayerGame");
      },
      inject: [DataSource],
    },

    // Repositorios construidos con sus criteria appliers correspondientes
    {
      provide: "UserFavoriteQuizRepository",
      useFactory: (
        builder: LibraryRepositoryBuilder,
        criteriaApplier: CriteriaApplier<
          SelectQueryBuilder<TypeOrmPostgresUserFavoriteQuizEntity>,
          QuizQueryCriteria
        >
      ) => builder.buildUserFavoriteQuizRepository(criteriaApplier),
      inject: ["LibraryRepositoryBuilder", "CriteriaApplier"],
    }
  ],//Resto de repositorios iguales
 })
export LibraryModule {}   
```

- Nota: Los criteria appliers son algo en espcífico de los módulos de biblioteca y de informes

## 5. Beneficios del enfoque con tokens

- **Desacoplamiento**  
  Los repositorios no contienen lógica de construcción, lo que facilita su mantenimiento y pruebas.

- **Flexibilidad**  
  Se puede cambiar el motor de base de datos (Postgres/Mongo) mediante una variable de entorno sin modificar el código de los módulos.

- **Extensibilidad**  
  Cuando se implemente Mongo, solo se reemplazan los `throw new Error(...)` en el builder por la construcción real de los repositorios.

- **Claridad**  
  Cada repositorio recibe explícitamente sus dependencias en el método `buildXRepository`, evitando dependencias ocultas o implícitas.

- **Consistencia**  
  Todos los módulos siguen el mismo patrón de construcción con tokens, lo que facilita la colaboración y el entendimiento del código entre equipos.