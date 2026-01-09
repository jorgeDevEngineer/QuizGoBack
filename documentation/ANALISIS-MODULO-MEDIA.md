
# Análisis del Módulo `media`

## 1. Visión General y Arquitectura

El módulo `media` es responsable de gestionar la subida, almacenamiento, recuperación y eliminación de archivos multimedia. Sigue una **Arquitectura Hexagonal (Puertos y Adaptadores)**, lo que separa claramente la lógica de negocio (dominio) de los detalles de implementación (infraestructura).

- **Dominio (`domain`):** Contiene el núcleo de la lógica de negocio, las entidades y las reglas. Es independiente de cualquier framework.
- **Aplicación (`application`):** Orquesta los casos de uso (como "subir un archivo"), conectando el dominio con la infraestructura.
- **Infraestructura (`infrastructure`):** Implementa las interfaces (puertos) definidas en el dominio utilizando tecnologías concretas como NestJS, TypeORM y Sharp.

## 2. Capa de Dominio (El Corazón del Módulo)

### Entidad `Media`
- **Inmutabilidad:** Una vez que un objeto `Media` es creado, no puede ser modificado.
- **Identidad:** Gestiona su propio ID (`UUIDv4`).
- **Contenido:** Almacena tanto los datos binarios completos (`data`) como un `thumbnail` (que puede ser nulo para archivos que no son imágenes).
- **Serialización:** Provee un método `toListResponse()` que prepara los datos para ser expuestos en una API de listado, incluyendo una URL para el thumbnail en formato `base64`.

### Value Objects
Refuerzan la integridad de los datos:
- **`MediaId`:** Garantiza que los IDs son siempre `UUIDv4` válidos.
- **`MimeType`:** Restringe los tipos de archivo a una lista blanca: `image/jpeg`, `image/png`, `image/gif`, `video/mp4`, `video/quicktime`. **Cualquier otro tipo de archivo será rechazado.**
- **`FileSize`:** Impone un límite de tamaño de **100MB**.

### Puertos (Contratos)
- **`MediaRepository`:** Define las operaciones CRUD que deben estar disponibles: `save`, `findById`, `findAll`, `delete`.
- **`ImageOptimizer`:** Define un contrato para un servicio que puede optimizar una imagen y generar un thumbnail. Su diseño (`Promise<Result | null>`) indica que la optimización es opcional y puede no aplicarse.

## 3. Capa de Aplicación (Los Casos de Uso)

### `UploadMedia`
- **Orquestación:** Es el caso de uso principal. Recibe un archivo y coordina su procesamiento y guardado.
- **Optimización Condicional:** Invoca al `ImageOptimizer`. Si este devuelve un resultado (porque es una imagen y la optimización fue exitosa), el `Buffer` y el tamaño del archivo se actualizan con la versión optimizada. El `thumbnail` también se guarda.
- **Validación:** Delega la validación de `MimeType` y `FileSize` a la entidad `Media` al momento de su creación.

### `GetMedia`
- Recupera un único archivo multimedia por su ID y devuelve la entidad completa junto con su `Buffer` de datos.

### `ListMediaUseCase`
- Recupera una lista de **todos** los archivos multimedia.
- **Optimización Clave:** Está diseñado para ser eficiente. **No carga los datos binarios (`data`)** de los archivos, solo sus metadatos (`id`, `mimeType`, `size`, etc.) y el `thumbnail`.

### `DeleteMedia`
- Elimina un archivo multimedia por su ID, verificando primero su existencia para proporcionar un feedback claro (404 si no se encuentra).

## 4. Capa de Infraestructura (La Implementación)

### `MediaController` (Endpoints de la API)
- **`POST /media/upload`:** Endpoint para subir archivos. Espera una petición `multipart/form-data` con un campo llamado `file`.
- **`GET /media`:** Lista todos los archivos multimedia (solo metadatos y thumbnails).
- **`GET /media/:id`:** Sirve el contenido binario de un archivo específico, ajustando la cabecera `Content-Type`.
- **`DELETE /media/:id`:** Elimina un archivo.

### `TypeOrmMediaRepository` (Persistencia con TypeORM)
- **Implementación de `findAll()`:** La consulta a la base de datos está optimizada para **excluir la columna `data`**, que contiene los bytes del archivo, previniendo un uso excesivo de memoria al listar los archivos.
- **Dependencia Inusual:** Inyecta un `DynamicMongoAdapter` pero no lo utiliza en las operaciones principales, lo que podría indicar una funcionalidad futura o en desuso.

### `SharpImageOptimizer` (Procesamiento de Imágenes con Sharp)
- **Activación:** Solo procesa archivos si su `MimeType` comienza con `image/`. Los videos y otros tipos de archivo son ignorados por este optimizador.
- **Compresión Inteligente:** Comprime la imagen principal, pero **solo utiliza la versión comprimida si es más pequeña que la original**.
- **Generación de Thumbnail:** Siempre crea un thumbnail de `200x200` para las imágenes.
- **Robustez:** Está envuelto en un `try-catch`. Si la librería `sharp` falla (ej. por un archivo corrupto), la subida no se interrumpe; simplemente no se realiza la optimización.

## 5. Implicaciones para la Refactorización

1.  **Lógica de Negocio Centralizada:** Todas las reglas de negocio críticas (tipos de archivo, tamaño máximo) están en el **dominio**. Cualquier cambio en estas reglas debe hacerse en los *Value Objects* (`MimeType`, `FileSize`).
2.  **Optimización de Listado:** El endpoint `GET /media` es eficiente y no debe ser una fuente de problemas de rendimiento, ya que no carga los archivos completos en memoria.
3.  **Servicio de Archivos:** El endpoint `GET /media/:id` sirve los archivos directamente desde la base de datos. Para un sistema con mucho tráfico, esto podría convertirse en un cuello de botella. Una futura refactorización podría considerar servir los archivos desde un CDN o un sistema de archivos dedicado.
4.  **Procesamiento de Imágenes:** La lógica de optimización está bien aislada en `SharpImageOptimizer`. Para cambiar la calidad de compresión, el tamaño de los thumbnails o usar una librería diferente, solo habría que modificar o reemplazar este archivo.
5.  **Videos vs. Imágenes:** El sistema trata los videos como archivos genéricos. No se generan thumbnails para ellos, y no se aplica ninguna optimización. Si se requiere procesamiento de video (ej. generar un fotograma como thumbnail), se necesitaría un nuevo "optimizador" (o procesador) de video que implemente la misma interfaz `ImageOptimizer` o una nueva interfaz `VideoProcessor`.
