# Drone-Backend-PA

Sistema di gestione dei piani di navigazione per droni marini autonomi. Permette agli utenti di sottomettere richieste di navigazione, agli operatori di valutarle e gestire le aree vietate, e agli amministratori di gestire i crediti degli utenti.

## Tecnologie principali

- **Node.js 20** con **TypeScript**
- **Express** — framework HTTP
- **Sequelize** — ORM per la gestione del database
- **PostgreSQL 16** — database relazionale
- **Docker** e **Docker Compose** — containerizzazione e orchestrazione
- **JWT con RS256** — autenticazione e autorizzazione
- **Zod** — validazione degli input
- **bcryptjs** — hashing delle password
- **PDFKit** — esportazione dei piani in PDF
- **http-status-codes** — gestione semantica degli status code HTTP

---

## Avvio del progetto

### Prerequisiti

- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) installati
- Chiavi RSA per la firma dei JWT

### 1. Clona il repository

```bash
git clone https://github.com/tuo-utente/drone-backend.git
cd drone-backend
```

### 2. Configura le variabili d'ambiente

Copia il file di esempio e compilalo con i valori corretti:

```bash
cp .env.example .env
```

Contenuto del file `.env`:

```env
NODE_ENV=production
PORT=3000

POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=drone_nav
POSTGRES_USER=drone_user
POSTGRES_PASSWORD=cambia_questa_password

JWT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
JWT_EXPIRES_IN=8h
```

Per generare le chiavi RSA:

```bash
# chiave privata
openssl genrsa -out private.key 2048

# chiave pubblica
openssl rsa -in private.key -pubout -out public.key

# converti in formato inline per il .env
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' private.key
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' public.key
```

### 3. Avvia i container

```bash
docker compose up -d --build
```

Questo comando avvia due servizi:
- `postgres` — database PostgreSQL con volume persistente
- `backend` — applicazione Express in ascolto sulla porta 3000

### 4. Esegui le migration

Le migration creano lo schema del database nell'ordine corretto rispettando i vincoli di foreign key:

```bash
docker compose exec backend npx sequelize-cli db:migrate
```

### 5. Esegui i seeder

I seeder popolano il database con i dati iniziali (utenti di esempio con i rispettivi ruoli e token, piani di navigazione di esempio, aree vietate):

```bash
docker compose exec backend npx sequelize-cli db:seed:all
```

### 6. Verifica il funzionamento

```bash
curl http://localhost:3000/api/areas
```

### Credenziali di default (seeder)

| Email | Password | Ruolo |
|-------|----------|-------|
| user1@example.com | Password1! | user |
| user2@example.com | Password1! | user |
| operator@example.com | Password1! | operator |
| admin@example.com | Password1! | admin |

### Comandi utili

```bash
# visualizza i log in tempo reale
docker compose logs -f backend

# reset completo del database
docker compose exec backend npx sequelize-cli db:seed:undo:all
docker compose exec backend npx sequelize-cli db:migrate:undo:all
docker compose exec backend npx sequelize-cli db:migrate
docker compose exec backend npx sequelize-cli db:seed:all

# reset completo con cancellazione del volume
docker compose down -v
docker compose up -d --build
docker compose exec backend npx sequelize-cli db:migrate
docker compose exec backend npx sequelize-cli db:seed:all

# accesso alla shell del container
docker compose exec backend sh

# accesso diretto al database
docker compose exec postgres psql -U drone_user -d drone_nav
```

---

## Architettura del backend

Il backend segue un'architettura a layer separati con responsabilità ben definite.

```
src/
├── config/
│   ├── database.ts         # Singleton Sequelize
│   └── config.js           # Configurazione sequelize-cli
├── models/
│   ├── index.ts            # Associazioni tra i model
│   ├── User.ts
│   ├── NavigationPlan.ts
│   ├── Waypoint.ts
│   └── ForbiddenArea.ts
├── dao/
│   ├── UserDAO.ts
│   ├── NavigationPlanDAO.ts
│   ├── WaypointDAO.ts
│   └── ForbiddenAreaDAO.ts
├── services/
│   ├── auth.service.ts
│   ├── navigationPlan.service.ts
│   └── forbiddenArea.service.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── navigationPlan.controller.ts
│   └── forbiddenArea.controller.ts
├── routes/
│   ├── auth.routes.ts
│   ├── plan.routes.ts
│   ├── area.routes.ts
│   └── user.routes.ts
├── middleware/
│   ├── JWTAuth.ts          # Verifica del token JWT
│   ├── checkRole.ts        # Verifica del ruolo
│   ├── zodValidator.ts     # Validazione input con Zod
│   └── errorHandler.ts     # Gestione centralizzata degli errori
├── validators/
│   ├── auth.validator.ts
│   ├── navigationPlan.validator.ts
│   └── forbiddenArea.validator.ts
├── utils/
│   ├── AppError.ts         # Gerarchia degli errori custom
│   └── ApiResponse.ts      # Risposte HTTP standardizzate
├── migrations/
└── seeders/
```

### Componenti principali

**Models** — definiscono la struttura delle tabelle e i tipi TypeScript corrispondenti tramite Sequelize. Le associazioni tra i model (`hasMany`, `belongsTo`, `hasOne`) sono centralizzate in `models/index.ts` per evitare dipendenze circolari.

**DAO (Data Access Object)** — ogni classe DAO incapsula tutte le query al database per una singola entità. I DAO non contengono logica di business — eseguono solo operazioni CRUD e query filtrate.

**Services** — contengono la logica di business dell'applicazione: validazione dei dati, controllo dei token, verifica delle aree vietate, gestione delle transazioni. I service utilizzano i DAO per accedere al database.

**Controllers** — ricevono le richieste HTTP, estraggono i dati da `req.body`, `req.params` e `req.query`, delegano l'elaborazione ai service e restituiscono la risposta al client. Non contengono logica di business.

**Routes** — definiscono gli endpoint e la catena di middleware da applicare a ciascuna rotta (autenticazione, autorizzazione, validazione, controller).

**Middleware** — funzioni che si interpongono nella catena di elaborazione della richiesta per autenticazione, autorizzazione, validazione e gestione degli errori.

---

## Pattern architetturali

### Singleton — Sequelize

La connessione al database è gestita tramite il pattern Singleton implementato nella classe `SequelizeSingleton`. Questo garantisce che esista una sola istanza di Sequelize per tutta la durata dell'applicazione, evitando la creazione di pool di connessioni multipli e sprechi di risorse.

```typescript
class SequelizeSingleton {
  private static instance: Sequelize | null = null;

  public static getInstance(): Sequelize {
    if (!SequelizeSingleton.instance) {
      SequelizeSingleton.instance = new Sequelize({ ... });
    }
    return SequelizeSingleton.instance;
  }
}
```

La scelta del Singleton esplicito, rispetto al Singleton implicito basato sulla cache dei moduli Node.js, è motivata dalla necessità di controllare con precisione il momento della creazione della connessione — che deve avvenire solo dopo che le variabili d'ambiente sono state caricate — e di gestire la chiusura ordinata del pool di connessioni in risposta al segnale `SIGTERM` di Docker.

### MVC — Model View Service

Il progetto adotta una variante del pattern MVC adatta al contesto di una REST API, dove la View è sostituita dalla risposta JSON:

- **Model** — le classi Sequelize definiscono la struttura dei dati e le relazioni tra le entità
- **Service** — sostituisce la View tradizionale, contenendo la logica di business e le regole applicative
- **Controller** — gestisce il ciclo richiesta/risposta HTTP delegando l'elaborazione ai service

Questa separazione rende il codice testabile — i service possono essere testati indipendentemente dalla layer HTTP — e manutenibile, poiché ogni componente ha una responsabilità unica e ben definita.

### Chain of Responsibility — Middleware

I middleware Express implementano il pattern Chain of Responsibility: ogni middleware riceve la richiesta, la elabora e decide se passarla al successivo tramite `next()` o interrompere la catena restituendo una risposta.

La catena applicata alle rotte protette è:

```
Richiesta HTTP
    → JWTAuth (verifica il token)
    → checkRole (verifica il ruolo)
    → zodValidate (valida il body/query)
    → Controller (elabora la richiesta)
    → errorHandler (gestisce gli errori)
```

Questo pattern permette di comporre la pipeline di elaborazione in modo dichiarativo nella definizione delle rotte, aggiungendo o rimuovendo middleware senza modificare il codice dei controller. L'`errorHandler` finale intercetta qualsiasi errore lanciato in qualsiasi punto della catena tramite `next(err)`.

### DAO — Data Access Object

Ogni entità del dominio ha una classe DAO dedicata che incapsula tutte le operazioni di accesso al database. I DAO sono esportati come istanze singleton sfruttando la cache dei moduli Node.js, garantendo un unico punto di accesso al database per ogni entità.

La separazione tra DAO e Service è motivata dal principio di singola responsabilità: i DAO non sanno nulla delle regole di business, i service non sanno nulla di come i dati vengono recuperati. Questo rende possibile modificare le query senza toccare la logica applicativa e viceversa, e semplifica i test unitari permettendo di sostituire i DAO con mock nelle classi di test.