import express from 'express';
import dotenv from 'dotenv';
import SequelizeSingleton from './config/database';
//import {User, NavigationPlan, Waypoint, ForbiddenArea} from  './models/index';
import UserDAO from './dao/UserDAO';
import NavigationPlanDAO from './dao/NavigationPlanDAO';
import { PlanStatus } from './models/NavigationPlan';
import userRoutes from './routes/userRoutes';
import navigationPlanRoutes from './routes/navigationPlanRoutes';
import foribiddenAreaRoutes from './routes/forbiddenAreaRoutes';
import { errorHandler } from './middleware/errors/errorHandler';
import { StatusCodes } from 'http-status-codes';


//import { User } from './models/index';
/*import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import planRoutes from './routes/plan.routes';
import areaRoutes from './routes/area.routes';
import userRoutes from './routes/user.routes';
*/

dotenv.config();


const app = express();
app.use(express.json());

/*
app.use('/api/auth', authRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/users', userRoutes);

app.use(errorHandler);
*/

app.get('/', (req, res) => {
    res.json({ message: "Drone-backend attivo" });
});

app.use('/api/users', userRoutes);
app.use('/api/plans', navigationPlanRoutes);
app.use('/api/forbidden-areas', foribiddenAreaRoutes);

app.get('/provadb', async (req, res) => {
    try {
        const sequelize = SequelizeSingleton.getInstance();
        //await sequelize.sync()
        
        //let out = await User;//hasMany(NavigationPlan);

        /*const user = await User.findByPk(6, {
            include: [{ model: NavigationPlan, as: 'navigationPlans' }],
        });
        const plans = user?.get('navigationPlans') as NavigationPlan[];

        res.json(plans);
        */

        const user = await UserDAO.findById(6);
        res.json(user);

    } catch (err) {
        console.error('Errore di connessione al database:', err);
        res.status(500).json({ error: (err as Error).message })
    }
});


app.get('/provadbpiani', async (req, res) => {
    try {
        
        //await sequelize.sync()
        
        //let out = await User;//hasMany(NavigationPlan);

        /*const user = await User.findByPk(6, {
            include: [{ model: NavigationPlan, as: 'navigationPlans' }],
        });
        const plans = user?.get('navigationPlans') as NavigationPlan[];

        res.json(plans);
        */

        const plans = await NavigationPlanDAO.findAllByStatus(PlanStatus.PENDING);
       res.json(plans);

    } catch (err) {
        console.error('Errore di connessione al database:', err);
        res.status(500).json({ error: (err as Error).message })
    }
});


// 3. rotta non trovata (catch-all)
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    error: `Rotta ${req.method} ${req.path} non trovata`,
  });
});

app.use(errorHandler);


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