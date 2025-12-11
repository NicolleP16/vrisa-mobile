/**
 * Mapa de todos los roles del sistema (mapeados desde el backend)
 */
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  INSTITUTION_HEAD: 'institution_head',
  STATION_ADMIN: 'station_admin',
  RESEARCHER: 'researcher',
  CITIZEN: 'citizen',
  INSTITUTION_MEMBER: 'institution_member'
};

/**
 * Roles disponibles para solicitar en el registro (Organizaciones)
 */
export const ORGANIZATION_ROLES = {
  STATION_ADMIN: USER_ROLES.STATION_ADMIN,
  RESEARCHER: USER_ROLES.RESEARCHER,
  INSTITUTION_HEAD: USER_ROLES.INSTITUTION_HEAD 
};

/**
 * Configuración de roles para formularios y selección
 */
export const ORGANIZATION_ROLES_CONFIG = [
  { 
    value: USER_ROLES.STATION_ADMIN, 
    label: 'Administrador de estación',
    description: 'Gestiona estaciones de monitoreo y sensores'
  },
  { 
    value: USER_ROLES.RESEARCHER, 
    label: 'Investigador',
    description: 'Acceso a datos y reportes para investigación'
  },
  { 
    value: USER_ROLES.INSTITUTION_HEAD, 
    label: 'Representante de Institución',
    description: 'Gestiona la red de monitoreo de una entidad'
  }
];

/**
 * Rol de usuario por defecto al registrarse
 */
export const DEFAULT_USER_ROLE = USER_ROLES.CITIZEN;

/**
 * Estados de registro de usuario
 */
export const REGISTRATION_STATUS = {
  COMPLETE: 'complete',
  PENDING_ROLE_COMPLETION: 'pending_role_completion'
};
