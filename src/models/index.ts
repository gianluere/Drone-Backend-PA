import User from './User';
import NavigationPlan from './NavigationPlan';
import Waypoint from './Waypoint';
import ForbiddenArea from './ForbiddenArea';

/*
// User → NavigationPlan
User.hasMany(NavigationPlan, { foreignKey: 'userId', as: 'plans' });
NavigationPlan.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// NavigationPlan → Waypoint
NavigationPlan.hasMany(Waypoint, { foreignKey: 'planId', as: 'waypoints' });
Waypoint.belongsTo(NavigationPlan, { foreignKey: 'planId', as: 'plan' });

// User → ForbiddenArea
User.hasMany(ForbiddenArea, { foreignKey: 'createdBy', as: 'forbiddenAreas' });
ForbiddenArea.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
*/


User.hasMany(NavigationPlan, { foreignKey: 'userId', sourceKey: 'id', as: 'navigationPlans' });
NavigationPlan.belongsTo(User, { foreignKey: 'userId', targetKey: 'id', as: 'user' });

NavigationPlan.hasMany(Waypoint, { foreignKey: 'planId', sourceKey: 'id', as: 'waypoints' });
Waypoint.belongsTo(NavigationPlan, { foreignKey: 'planId', targetKey: 'id', as: 'navigationPlan' });

User.hasMany(ForbiddenArea, { foreignKey: 'createdBy', sourceKey: 'id', as: 'forbiddenAreas' });
ForbiddenArea.belongsTo(User, { foreignKey: 'createdBy', targetKey: 'id', as: 'creator' });


export { User, NavigationPlan, Waypoint, ForbiddenArea };