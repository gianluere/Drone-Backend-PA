/**
 * Questo file definisce le associazioni tra i modelli.
 * Non crea tabelle o colonne: serve solo per abilitare le relazioni ORM
 * È stato fatto qui per evitare gli import ricorsivi.
 */

import User from './User';
import NavigationPlan from './NavigationPlan';
import Waypoint from './Waypoint';
import ForbiddenArea from './ForbiddenArea';

/**
 * Uno User può avere molti NavigationPlan.
 * Ogni NavigationPlan appartiene a un solo User.
*/
User.hasMany(NavigationPlan, { foreignKey: 'userId', sourceKey: 'id', as: 'navigationPlans' });
NavigationPlan.belongsTo(User, { foreignKey: 'userId', targetKey: 'id', as: 'user' });

/**
 * Un NavigationPlan contiene più Waypoint.
 * Ogni Waypoint appartiene a un solo NavigationPlan.
 */
NavigationPlan.hasMany(Waypoint, { foreignKey: 'planId', sourceKey: 'id', as: 'waypoints' });
Waypoint.belongsTo(NavigationPlan, { foreignKey: 'planId', targetKey: 'id', as: 'navigationPlan' });

/**
 * Uno User può creare più ForbiddenArea.
 * Ogni ForbiddenArea ha un creatore (User).
 */
User.hasMany(ForbiddenArea, { foreignKey: 'createdBy', sourceKey: 'id', as: 'forbiddenAreas' });
ForbiddenArea.belongsTo(User, { foreignKey: 'createdBy', targetKey: 'id', as: 'creator' });

export { User, NavigationPlan, Waypoint, ForbiddenArea };