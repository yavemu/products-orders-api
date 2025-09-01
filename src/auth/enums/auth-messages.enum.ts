export enum AuthMessages {
  // Success messages
  LOGIN_SUCCESS = 'Inicio de sesión exitoso',
  REGISTER_SUCCESS = 'Registro exitoso',

  // Error messages
  INVALID_CREDENTIALS = 'Credenciales inválidas',
  LOGIN_ERROR = 'Error al iniciar sesión',
  REGISTER_ERROR = 'Error al registrar usuario',

  // Validation messages
  EMAIL_REQUIRED = 'El email es requerido',
  PASSWORD_REQUIRED = 'La contraseña es requerida',
  REGISTER_DATA_REQUIRED = 'Los datos de registro son requeridos',
}