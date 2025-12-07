/**
 * Roles disponibles para usuarios que pertenecen a organizaciones ambientales
 * Estos roles requieren completar el registro después del login inicial
 */
export const ORGANIZATION_ROLES = {
  STATION_ADMIN: 'station_admin',
  RESEARCHER: 'researcher',
  INSTITUTION_WORKER: 'institution_worker'
};

/**
 * Configuración de roles con etiquetas para mostrar en UI
 */
export const ORGANIZATION_ROLES_CONFIG = [
  { 
    value: ORGANIZATION_ROLES.STATION_ADMIN, 
    label: 'Administrador de estación',
    description: 'Gestiona estaciones de monitoreo y sensores'
  },
  { 
    value: ORGANIZATION_ROLES.RESEARCHER, 
    label: 'Investigador',
    description: 'Acceso a datos y reportes para investigación'
  },
  { 
    value: ORGANIZATION_ROLES.INSTITUTION_WORKER, 
    label: 'Trabajador de institución ambiental',
    description: 'Personal de instituciones ambientales'
  }
];

/**
 * Rol por defecto para usuarios generales (ciudadanos)
 */
export const DEFAULT_USER_ROLE = 'citizen';

/**
 * Estados de registro del usuario
 */
export const REGISTRATION_STATUS = {
  COMPLETE: 'complete',
  PENDING_ROLE_COMPLETION: 'pending_role_completion'
};



