export enum UserMessages {
  // Success messages
  CREATED_SUCCESS = 'Usuario creado exitosamente',
  UPDATED_SUCCESS = 'Usuario actualizado exitosamente',
  DELETED_SUCCESS = 'Usuario eliminado exitosamente',
  FOUND_SUCCESS = 'Usuario encontrado exitosamente',
  LIST_SUCCESS = 'Lista de usuarios obtenida exitosamente',
  SEARCH_SUCCESS = 'Búsqueda de usuarios completada exitosamente',

  // Error messages
  NOT_FOUND = 'Usuario no encontrado',
  ALREADY_EXISTS = 'Ya existe un usuario con este email',
  INVALID_ID = 'usuario inválido',
  CREATE_ERROR = 'Error al crear el usuario',
  UPDATE_ERROR = 'Error al actualizar el usuario',
  DELETE_ERROR = 'Error al eliminar el usuario',
  FETCH_ERROR = 'Error al obtener el usuario',
  LIST_ERROR = 'Error al obtener los usuarios',
  SEARCH_ERROR = 'Error al buscar usuarios',
  EMAIL_SEARCH_ERROR = 'Error al buscar usuario por email',

  // Validation messages
  EMAIL_REQUIRED = 'El email es requerido',
  PASSWORD_REQUIRED = 'La contraseña es requerida',
  FIRST_NAME_REQUIRED = 'El nombre es requerido',
  LAST_NAME_REQUIRED = 'El apellido es requerido',
  INVALID_EMAIL = 'El formato del email es inválido',
  PASSWORD_TOO_SHORT = 'La contraseña debe tener al menos 8 caracteres',
}
