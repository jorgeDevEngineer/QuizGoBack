<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# 🚀 QuizGo Backend (BackComun)

Proyecto backend diseñado para emular las funcionalidades de Kahoot, permitiendo la gestión de quizzes, salas en tiempo real y sistemas de puntuación competitivos. 🎮

Este proyecto es una solución backend robusta construida con **NestJS**, diseñada bajo los principios de **Arquitectura Hexagonal (Ports & Adapters)** y **Domain-Driven Design (DDD)**. una caracteristica importantee es la capacidad de **Persistencia Híbrida Dinámica**, permitiendo cambiar entre MongoDB y PostgreSQL en tiempo de ejecución sin detener el servicio.

---

## 🧭 Arquitectura & Diseño

El sistema está dividido en módulos desacoplados, donde cada uno encapsula su propia lógica y persistencia. Hemos integrado patrones de diseño táctico para garantizar escalabilidad y mantenibilidad.

### Estructura de Capas (The Hexagon)

🟡 **Domain (Núcleo):**
Donde residen las reglas de negocio puras.
- **Aggregates & Entities:** Modelos ricos con lógica de negocio.
- **Value Objects:** Objetos inmutables que encapsulan validaciones.
- **Ports (Interfaces):** Contratos que la infraestructura debe cumplir (ej: `GroupRepository`).

🟣 **Application (Orquestación):**
La capa que coordina las acciones del usuario.
- **CQS (Commands & Queries):** Separación estricta entre operaciones de escritura y lectura.
- **Handlers:** Ejecutores de casos de uso específicos.
- **DTOs:** Contratos de entrada/salida para proteger el dominio.

🔵 **Infrastructure (Adaptadores):**
Implementaciones técnicas y detalles externos.
- **NestJS Controllers & Gateways:** API REST y WebSockets.
- **Persistence:** Repositorios híbridos (TypeORM + Native Mongo Driver).
- **Adapters:** Implementaciones de los puertos del dominio (ej: `DynamicMongoAdapter`).

👉 **[Ver Diagrama del Modelo de Dominio](https://lucid.app/lucidchart/c54dbe5b-aec8-4c01-8c33-933dc3005d76/edit?invitationId=inv_b30a5a60-c316-4ea5-b4bd-5900b0ac2294)** 👈

---

## 🛠️ Stack Tecnológico

| Tecnología | Rol |
| :--- | :--- |
| **NestJS** | Framework principal (Node.js). |
| **TypeScript** | Lenguaje tipado para robustez. |
| **PostgreSQL** | Base de datos Relacional (Fallback / Reportes). |
| **MongoDB** | Base de datos Documental (Principal / Alto rendimiento). |
| **TypeORM** | ORM para manejo de entidades SQL. |
| **Docker** | Contenerización de servicios. |
| **Socket.io** | Comunicación en tiempo real para las salas de juego. |

---

## 🚀 Puesta en Marcha (Setup)

Sigue estos pasos para levantar el entorno de desarrollo localmente.

### 1. Prerrequisitos
Asegúrate de tener instalado:
- [Node.js](https://nodejs.org/) (v18 o superior)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### 2. Instalación de Dependencias
```bash
npm install
```

### 3. Configuración de Entorno
Crea una copia del archivo .env.example y renómbralo a .env. Configura las credenciales para los contenedores de Docker:

```Bash
cp .env.example .env
```
Nota: Asegúrate de que DATABASE_URL_POSTGRES y DATABASE_URL_MONGO coincidan con la configuración de tu docker-compose.yml.

### 4. Levantar Infraestructura (Docker) 🐳
No necesitas instalar las bases de datos manualmente. Usa Docker Compose para levantar PostgreSQL y MongoDB simultáneamente:

```Bash
docker-compose up -d
```
### 5. Ejecutar la Aplicación
```Bash
# Modo Desarrollo (con recarga automática / watch mode)
npm run start:dev
```
Una vez levantado, la API estará disponible en: http://localhost:3000/api

## Base de Datos Dinámica
Este backend implementa un patrón de Circuit Breaker / Fallback para la persistencia.

```Mongo First:``` Por defecto, los módulos intentan escribir en MongoDB (optimizado para lectura/escritura rápida de documentos grandes como Quizzes).

```Postgres Fallback:``` Si Mongo falla o se deshabilita, el sistema cambia automáticamente a PostgreSQL sin perder datos.

**Control en Tiempo Real:**

Puedes forzar el cambio de motor de base de datos para un módulo específico (ej: groups) usando el endpoint de administración:

```Endpoint:``` PUT /config/database-connection


JSON

// Body para forzar PostgreSQL (Simular fallo de Mongo)
{
  "moduleName": "groups",
  "dbType": "postgres"
}
JSON

// Body para restaurar a MongoDB
{
  "moduleName": "groups",
  "dbType": "mongo"
}



## 🧪Testing
Aseguramos la calidad del código mediante tests unitarios y de integración.


## Autores 👥

Jorge Ignacio Ramírez Millán
✉️ jorge.dev.engineer@gmail.com

Diego García
✉️ diego.frnz.2004@gmail.com

José Gabriel Vilchez Porra
✉️ jgvilchez.dev@gmail.com

José Alejandro Briceño Luzardo
✉️ josea2102@gmail.com 

Daniel García
✉️ dangar452000@gmail.com

Andrés Guilarte
✉️ andresguilartelamuno@gmail.com

## Licencia 📄
MIT
