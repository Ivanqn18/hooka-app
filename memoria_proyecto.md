# MEMORIA TÉCNICA DEL PROYECTO: HookaHub

## 1 Identificación proyecto
**Nombre del Proyecto:** HookaHub
**Autor:** [Tu Nombre / Nombre del equipo]
**Fecha:** Abril 2026
**Módulo / Asignatura:** [Nombre del Módulo o Asignatura]
**Centro / Institución:** [Nombre del Centro Educativo]

## 2 Organización de la memoria
La presente memoria documenta exhaustivamente el ciclo de vida del desarrollo de **HookaHub**. Está estructurada en diez apartados que cubren desde la concepción de la idea y descripción general, pasando por la planificación metodológica y financiera, hasta llegar al detalle técnico del análisis, diseño, implementación y pruebas realizadas. Finalmente, se exponen los manuales para el usuario final, conclusiones del proyecto y posibles vías de ampliación futuras acompañadas de la bibliografía correspondiente.

## 3 Descripción general del proyecto

### 3.1 Objetivos
El objetivo principal de HookaHub es proporcionar una plataforma integral para los entusiastas de la cachimba (hookah/shisha), facilitando la gestión de inventarios, la creación y descubrimiento de mezclas de tabaco, y la conexión de la comunidad. 

**Objetivos específicos:**
*   **Alimentación automatizada del catálogo:** Implementar técnicas avanzadas de Web Scraping para alimentar la base de datos de manera autónoma con las marcas, sabores (tastes) y formatos desde catálogos XML y directivas oficiales.
*   **Comunidad y Red Social (C2C):** Construir una arquitectura relacional sólida que permita la interacción entre usuarios a través de la publicación de mezclas, sistemas de *Followers*, un panel de inventario ("Stash") para el tabaco personal, y el fomento de un ecosistema de notificaciones en tiempo real, así como puntuarlas (likes/dislikes) y comentarlas.
*   **Comercio Electrónico / Marketplace:** Fomentar la economía circular posibilitando la compra y venta de productos de segunda mano (cachimbas, cazoletas, accesorios) gestionado mediante un chat privado bidireccional desarrollado sobre WebSockets.
*   **Geoservicios:** Implementar funcionalidades PWA y mapas de Leaflet para mapear y georreferenciar locales de interés (lounges), posibilitando que los usuarios los valoren mediante reseñas.

### 3.2 Cuestiones metodológicas
Dado que HookaHub es un proyecto con módulos heterogéneos y fuertemente entrelazados (una DB compleja, Scraping e interfaz asíncrona), la metodología tradicional "En Cascada" no resultaba operativa. En su lugar se han implementado metodologías ágiles, concretamente una adaptación de **Scrum**.
El ciclo de vida del desarrollo se ha organizado estructurando el *Product Backlog* iterando todos los requerimientos en tareas. Se planificaron ciclos bimensuales y semanales (Sprints). Se ha hecho uso intensivo del control de versiones con Git/GitHub mediante el modelo de ramificación `GitFlow` funcional (`feature/cart`, `fix/scraper`) para la integración continua.

### 3.3 Entorno de trabajo (tecnologías de desarrollo y herramientas)
El ecosistema tecnológico elegido es moderno y robusto, basado íntegramente en TypeScript (Full-Stack TypeScript):
*   **Frontend:** React 19, Vite (bundler hiperrápido), TailwindCSS v4 (estilado utilitario), React Router DOM, React Leaflet (mapas), Vite PWA (aplicación web progresiva).
*   **Backend:** NestJS 11 (framework Node.js), Prisma ORM (gestión de base de datos), Puppeteer / Cheerio (Web Scraping de catálogos XML/PDF), Socket.io (comunicación en tiempo real), Passport/Bcrypt (autenticación segura).
*   **Base de Datos:** PostgreSQL.
*   **Herramientas Adicionales:** VSCode IDE, ESLint / Prettier, Docker (para orquestación y despliegue local de la DB), Jest (Testing), Git.

## 4 Descripción general del producto

### 4.1 Visión general del sistema: límites del sistema, funcionalidades básicas, usuarios y/o otros sistemas con los que pueda interactuar.
**Límites y Entorno:**
HookaHub opera como una aplicación web accesible desde dispositivos móviles y de escritorio (con soporte PWA), operando como hub central para el sector.
**Tipos de Usuarios:**
*   **Usuarios Invitados (Anónimos):** Pueden visualizar el catálogo general de tabacos, el marketplace y el mapa de ubicaciones de manera pasiva.
*   **Usuarios Registrados:** Disponen del abanico completo. Pueden crear y comentar mezclas, votarlas (Like/Dislike), añadir tabacos a su inventario personal (Stash), publicar y comprar artículos en el Marketplace conversando por Chat interno, puntuar a vendedores y bares con clasificación de estrellas, y seguir a otros usuarios.
*   **Administrador:** Posee capacidades extra para moderar, forzar el scraping del catálogo, aprobar o rechazar nuevos locales sugeridos y gestionar la plataforma global.
**Interacción con Sistemas Externos:**
El sistema interactúa con fuentes externas automatizadas (scrapers) que procesan archivos XML o directivas web oficiales (ej. BOE) para mantener el catálogo de tabacos oficiales perpetuamente sincronizado de forma oculta a los usuarios para no mermar su rendimiento.

### 4.2 Descripción breve de métodos, técnicas o arquitecturas(m/t/a) utilizadas.
*   **Arquitectura:** Arquitectura Cliente-Servidor (Full-Stack). El backend sigue la "Hexagonal Architecture" fundamentada en módulos, controladores y servicios (propia de NestJS), favoreciendo la inyección de dependencias. El frontend emplea una arquitectura SPA (Single Page Application) hiperactiva con DOM dinámico.
*   **Técnicas:** 
    *   **Autenticación Criptográfica:** Uso de `bcrypt` para hashing irreversible y JWT (JSON Web Tokens) intercambiados para la autorización.
    *   **Scraping Clandestino:** Uso de `puppeteer-extra-plugin-stealth` para evadir contramedidas antibots (ej. Cloudflare) en portales destino al extraer tabacos.
    *   **Comunicación Bidireccional:** Socket.io implementado en un Gateway para emisión de eventos TCP instantáneos en chats del marketplace.

### 4.3 Despliegue de la aplicación indicando plataforma tecnológica, instalación de la aplicación y puesta en marcha
El desarrollo local se basa en contenedores generados mediante Docker (definidos en docker-compose.yml), permitiendo aislar la base de datos de PostgreSQL. La puesta en marcha de producción o despliegue se divide:
*   **Dominio y Red:** Hospedaje bajo plataformas Serverless y de Nube (ej. Vercel para el Frontend y Virtual Private Server en Render/DigitalOcean para el backend) ya que requieren Node.js continuo.
*   **Instalación:** Consiste en clonar el repositorio, inyectar el archivo `.env` con las variables críticas (`DATABASE_URL`, `JWT_SECRET`), instalar dependencias de NPM en ambas subcapetas y ejecutar `npx prisma db push` para mapear el esquema a PostgreSQL. El lanzamiento se efectúa con `npm run start:prod`.

## 5 Planificación y presupuesto
**Viabilidad Económica y Costes:**
*   **Presupuesto Simulativo de Desarrollo:** Si calculamos las horas necesarias: Fase 1 y Arquitectura (40h), Diseño UX/UI (25h), Backend y Scrapers (115h), Frontend y UI (90h), Testing/QA (25h). Total: 295 horas de ingeniería de software. A precios de mercado freelance (~40€/h), este desarrollo superaría los 11.000€.
*   **Costes de Operación:** Uso de tecnologías Open Source (Gratuitas). Hosting de Frontend estimado en capa gratuita ($0). Servidor Backend + BD PostgreSQL (Entre 10 y 20€/mes por las necesidades RAM de Puppeteer y WebSockets).

## 6 Documentación Técnica: análisis, diseño, implementación y pruebas.

### 6.1 Especificación de requisitos
**Requisitos Funcionales (RF):**
* RF1: Sistema unificado de cuentas de usuario perfilado con roles, sistema relacional de seguidores (followers), notificaciones de sistema y configuración de inventario personal de tabaco (`UserStash`).
* RF2: Visualización del directorio y catálogo de tabacos oficial, nutrido del sistema backend de Scraping.
* RF3: Gestión completa de mezclas participativas (ingredientes y %), foros interactivos/comentarios y "Like/Dislike".
* RF4: Mercado de intercambio (Marketplace) para cazoletas, mangueras, etc., con chat a tiempo real entre interesado y vendedor.
* RF5: Interfaz de mapas dinámica gestionada por Leaflet para la catalogación de Bares (Lounges) geo-referenciados vinculando un ecosistema de reseñas.

**Requisitos No Funcionales (RNF):**
* RNF1: Tiempo de respuesta en listados de componentes menor a 1 segundo gracias al caché y al DOM estático.
* RNF2: Interfaz Responsive (Mobile first) instalable nativamente mediante PWA.
* RNF3: Código documentado, validado por dependencias DTOs (Data Transfer Objects) y tipado estricto (TypeScript).

### 6.2 Análisis del sistema
Se detectó la necesidad vital de automatizar la entrada de nuevos tabacos al mercado nacional para evitar cuellos de botella de personal. Los posibles atascos por web scraping fueron derivados a colas y tareas asíncronas cronometradas no bloqueantes. El sistema se diseña asumiendo que los clientes navegan libremente entre un gran repertorio social (Followers y Stash), mientras el servidor hace el trabajo pesado relacional bajo la manta.

### 6.3 Diseño del sistema:

#### 6.3.1 Diseño de la Base de Datos
Implementado mediante Prisma ORM bajo PostgreSQL. El esquema está totalmente normalizado abarcando múltiples áreas semánticas masivas:
*   **Social & Notificaciones:** `User`, `UserFollow` (relación cruzada entre usuarios), `Notification`, `UserStash` (HAVE/WANT).
*   **La Mezcla (Mix):** `Mix`, `MixIngredient` (ingredientes dependientes 1 a N), `MixLike`/`MixDislike`, `MixComment`, `Tag`.
*   **Catálogo Oficial (Scraping):** Jerarquía estricta que engloba `Brand` (Marca), `Taste` (Sabor) y `TasteFormat` (Gramaje y precio).
*   **Marketplace (C2C):** Entidades `Product`, forjado junto a `Chat` y `Message` (Mensajería anidada a la venta). Contiene además el modelo `SellerReview` para reputación transaccional.
*   **Bares (Locales):** `Bar` (latitud/longitud) interconectado a `BarReview` (reseñas participativas).

#### 6.3.2 Diseño de la Interfaz de usuario.
Desarrollada con **Tailwind CSS v4** y fundamentada en iconografía `lucide-react`. El diseño sigue los principios rigurosos de **Dark UI Pro Max**, combinando tonos oscuros neón, fondos difuminados y un efecto inmersivo tipo "Glassmorphism".
A nivel de usabilidad UX (Experiencia de usuario), se ha dotado a los formularios de interacciones limpias. Un ejemplo remarcable es forzar el uso de `Selects` dinámicos en cascada (para Seleccionar Marca $\rightarrow$ luego desbloquear el select de Sabor) eludiendo la introducción manual por teclado (InputText), lo que impide fatídicamente que un error tipográfico arruine la integridad de las tabulaciones de consultas de la base de datos.

#### 6.3.3 Diseño de la Aplicación.
Es un proyecto estructurado como *Monorepo*:
*   **Client-Side Browser (Frontend):** Puntos de entrada en `index.html` $\rightarrow$ `main.tsx`. Rutas manejadas algorítmicamente por `react-router-dom`. Funciones asíncronas vía `axios` e instanciamiento del Socket mediante `socket.io-client`. Todo modularizado mediante componentes funcionales React.
*   **Server-Side Control (Backend):** Punto de entrada compilado `main.ts`. Altamente modularizado bajo el patrón NestJS en áreas lógicas o contextos: (`TobaccosModule`, `MezclasModule`, `ScraperModule`, `AuthModule`, `SocketGateway`).

### 6.4 Implementación:

#### 6.4.1 Entorno de desarrollo.
Se configuró un entorno monorepo (separando por carpetas subyacentes `/frontend` y `/backend`). Uso exhaustivo y sistemático de Node.js, `npm`, y configuraciones estrictas del transpilador en los archivos `tsconfig.json`. La información sensible (como firmas o bases de datos) recae exclusivamente sobre archivos `dot-env` (.env) nunca expuestos en repositorios remotos.

#### 6.4.2 Estructura del código.
**Backend (`/backend/src`):** Emplea a nivel base la inyección de repositorios. Sus *Controladores* se encargan unicamente de enrutar las llamadas HTTP/REST; sus *Servicios* albergan de hecho la lógica pesada de la abstracción ORM. El script *seed* inicial (`prisma/seed.ts`) inyecta o asegura al usuario administrador maestro ("ivan@admin.com").
**Frontend (`/frontend/src`):** Compilado sobre "Vite", organiza su arquitectura reactiva en las carpetas de `/components` (unidades modulares repetibles), `/pages` (vistas matrices completas, e.g., `TobaccoCatalog.tsx`), e integra un proxy dinámico en Axios.

#### 6.4.3 Cuestiones de diseño e implementación reseñables.
*   **Web Scraping Robusto:** Uso vital de la librería `puppeteer-extra-plugin-stealth`, indispensable para renderizar los listados simulando un Chrome válido, saltando conculcaciones y parseando Fast-XML-Parser/Cheerio bajo dominios con protecciones abusivas.
*   **Gestión del WebSocket Gateway:** En vez de un polling masivo que destruye el ancho de banda del servidor, la integración con `@nestjs/websockets` logra mantener vivo un *socket TCP* capaz de disparar la notificación y actualizar los mensajes instantáneos en las entrañas de los *Chats del Marketplace*.
*   **Arquitectura PWA Híbrida:** Configuración configurada por la directiva `vite-plugin-pwa` posibilitando el almacenamiento temporal y cacheo per-app que induce la pre-instalación asincrónica en smartphones directamente a pantalla de inicio sin cursar las tiendas móviles normativas.

### 6.5 Pruebas.
La cultura "Test-Driven" permite certificar la fortaleza del sistema de base.
Se implementó un entorno de pruebas robusto basado en **Jest**.
1.  **Unit & E2E Testing:** Existen rutinas parametrizadas en el `package.json` (`npm run test`, `npm run test:e2e`) configuradas para testar controladores y la impermeabilidad de los guards JWT frente a peticiones intrusivas (por ej, intentando crear mezclas inyectando payload defectuoso que derive en más del 100% matemático).
2.  **Scripts de Línea Comandos:** Creación de scripts experimentales paralelos (ej. `test_productos.js`, `check_admin.ts`) utilizados para la depuración en fase de desarrollo terminal, para validaciones de flujo transaccional.

## 7 Manuales de usuario

### 7.1 Manual de usuario
1.  **Acceso y Registro:** Al entrar a la web por primera vez, el usuario verá la pantalla de bienvenida. Puede navegar como invitado o, para tener funcionalidades plenas, se debe crear una cuenta verificando su mayoría de edad.
2.  **Catálogo de Tabacos y Directorio:** En la sección "Catálogo", el usuario puede buscar, buscar y filtrar la lista absoluta nacional y su formato de venta extraída de modo automatizado por la aplicación.
3.  **Configurar Inventario Personal de Tabaco (Stash):** Situado en Perfil / Mis tabacos, se busca el sabor exacto del mercado y se marca activamente con la etiqueta `HAVE` (Comprado en estanco y en posesión) o `WANT` (Deseado pero indisponible).
4.  **Creador de Mezclas (Módulo Transaccional):** En "Crear Mezcla", el usuario hace clic en el selector "Marca", lo que dinámicamente arrastrará a su selector consecutivo las variantes de "Sabor". Se introducen proporciones, finalizándolo y publicándolo.
5.  **Marketplace C2C:** Accediendo al mercadillo de cazoletas y equipo derivado, presionar sobre "Hacer Oferta/Comprar" abre inmediatamente una conexión de "Chat" privado integrado y notificable.
6.  **Mapa de Lounges:** La sección de mapa (Levantada interactiva por Leaflet) permite ubicar establecimientos cercanos usando la geolocalización o leyendo críticas (Reviews) puntuables de aquellos.

### 7.2 Manual de instalación
Se exponen las exigencias de despliegue para el *Technical Administrador*:
1.  Instalar entorno unificado `Node.js (>20.x)` y `Docker` en la máquina local/servidor.
2.  Descargar/Clonar el repositorio de código fuente integral.
3.  Renombrar o transferir el archivo `.env.example` a formato `.env` definiendo con cautela la ruta a la DDBB en la variable fundamental `DATABASE_URL` y variables como el `JWT_SECRET`.
4.  Inyectar el modelo hacia la DB e instanciar: ubicarse en consola sobre la carpeta `backend`, realizar un `npm install`, seguido de compilar esquemas con `npx prisma db push` e inaugurar la capa backend REST en servidor con `npm run start:prod` u optativamente `dev`.
5.  En otra ventana idéntica paralela `cd frontend && npm install && npm run build`.

## 8 Conclusiones y posibles ampliaciones
**Conclusiones:**
HookaHub ha logrado unificar tecnologías Full-Stack (NestJS/Prisma/React/Tailwind) en un único proyecto disruptivo, rompiendo los obsoletos estándares del nicho (foros crudos). El proyecto soporta hoy una catalogación oficial perpetuamente rastreada mediante Web-Scraping para centralizar la información. Y sobre esta base de datos relacional sólida y estructurada (PostgreSQL/Prisma), se ha elevado un auténtico ecosistema sociocomercial asimétrico que abarca el inventario cruzado de los participantes `UserStash` junto al flujo asíncrono e integrado de las transacciones Marketplace modelando la comunicación por `Sockets`.

**Posibles Ampliaciones (Ampliaciones Futuras):**
*   **Algoritmo Predictivo de Matchmaking de Inventario:** Aprovechando que la base de datos ya domina con certeza un inventario riguroso (`UserStash`), a medio plazo se pretendería diseñar un algoritmo en memoria que cruce tu "Stash" local con todas las recetas que posee el "Catálogo Global". Como desenlace devolviendo matemáticamente: *"Puedes prepararte exactamente estas 5 recetas distintas hoy, combinando el Tabaco Físico que detentas en tu posesión en este preciso instante"*.
*   **Transacciones Logísticas Integradas en Marketplace:** Integrar al modelo `Product` una funcionalidad Checkout externa con la API transaccional de *Stripe*, promoviendo la función nativa de retención de comisiones o *escrow*, garantizando el amparo logístico de envíos seguros para aquellos agentes de mensajería (usuario y usuario).
*   **Modelos de Lenguaje (IA) para Sustitución de Sabores:** Alimentar una Inteligencia local mapeándole las tablas de jerarquía relacional semántica `Taste`/`Tag`. Así, cuando se demande una mezcla en que se carece del tabaco preciso al % adecuado, la IA podría interpretar la traída de matices ("Dulce"/"Mint") sugiriendo ágilmente sabores suplementarios verídicamente equivalentes en tu cajón local.

## 9 Bibliografía
*   **NestJS Core Architecture**: Documentación técnica oficial provista por Trilon [https://docs.nestjs.com/](https://docs.nestjs.com/)
*   **React 19 / Meta OS**: Principios conceptuales de Client Side DOM Management [https://react.dev/](https://react.dev/)
*   **Tailwind CSS Utilities**: Guías de diseño utility-first [https://tailwindcss.com/docs/](https://tailwindcss.com/docs/)
*   **Prisma Client DML**: Conceptos ORM y diagramado relacional de esquemas [https://www.prisma.io/docs](https://www.prisma.io/docs)
*   **Puppeteer Clandestino / Headless API Reference**: [https://pptr.dev/](https://pptr.dev/) y plugins antidetect.

## 10 Anexos
*   [Anexo I: Capturas de Pantalla Oficiales de las Rutas de Frontend]
*   [Anexo II: Modelos ER (Diagrama de Entidad Relación ampliado generado desde Prisma)]
*   [Anexo III: Documentación API Base]
