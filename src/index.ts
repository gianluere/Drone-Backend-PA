/**
 * @fileoverview Punto di ingresso dell'applicazione Express. Configura il server, le rotte e la connessione al database.
 * Carica le variabili d'ambiente, imposta i middleware e avvia il server sulla porta specificata.
 * Gestisce anche la chiusura pulita del pool di connessione al database quando il processo termina.
 * 
 */

import express from 'express';
import dotenv from 'dotenv';
import SequelizeSingleton from './config/database';
import userRoutes from './routes/userRoutes';
import navigationPlanRoutes from './routes/navigationPlanRoutes';
import foribiddenAreaRoutes from './routes/forbiddenAreaRoutes';
import { errorHandler } from './middleware/errors/errorHandler';
import { StatusCodes } from 'http-status-codes';

// Carica le variabili d'ambiente da .env
dotenv.config();

// Crea l'app Express
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: "Drone-backend attivo" });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/users', userRoutes); // Rotte per autenticazione e gestione utenti
app.use('/api/navigation-plans', navigationPlanRoutes); // Rotte per gestione piani di navigazione
app.use('/api/forbidden-areas', foribiddenAreaRoutes); // Rotte per gestione aree vietate


// gestisce caso rotta non trovata
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    error: `Rotta ${req.method} ${req.path} non trovata`,
  });
});

app.use(errorHandler); // Middleware di gestione errori


const PORT = process.env.PORT || 3000;

async function start() {
    try {
        const sequelize = SequelizeSingleton.getInstance();
        await sequelize.authenticate();
        console.log('Connessione al database OK');

        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
        }

        const server = app.listen(PORT, () => {
            console.log(`Server in ascolto su http://localhost:${PORT}`);
        });

        // Chiusura pulita del pool quando il processo termina
        process.on('SIGTERM', async () => {
            server.close();
            await SequelizeSingleton.close();
            console.log('Server e database chiusi correttamente');
        });

    } catch (err) {
        console.error('Errore di avvio:', err);
        await SequelizeSingleton.close();
        process.exit(1);
    }
}

start();