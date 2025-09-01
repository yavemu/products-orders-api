export enum OrderMessages {
  // Success messages
  CREATED_SUCCESS = 'Orden creada exitosamente',
  UPDATED_SUCCESS = 'Orden actualizada exitosamente',
  DELETED_SUCCESS = 'Orden eliminada exitosamente',
  FOUND_SUCCESS = 'Orden encontrada exitosamente',
  LIST_SUCCESS = 'Lista de órdenes obtenida exitosamente',
  SEARCH_SUCCESS = 'Búsqueda de órdenes completada exitosamente',

  // Error messages
  NOT_FOUND = 'Orden no encontrada',
  INVALID_ID = 'ID de orden inválido',
  CREATE_ERROR = 'Error al crear la orden',
  UPDATE_ERROR = 'Error al actualizar la orden',
  DELETE_ERROR = 'Error al eliminar la orden',
  FETCH_ERROR = 'Error al obtener la orden',
  LIST_ERROR = 'Error al obtener las órdenes',
  SEARCH_ERROR = 'Error al buscar órdenes',

  // Validation messages
  USER_ID_REQUIRED = 'El ID del usuario es requerido',
  PRODUCTS_REQUIRED = 'Los productos son requeridos',
  TOTAL_AMOUNT_REQUIRED = 'El monto total es requerido',
  STATUS_REQUIRED = 'El estado es requerido',
  INVALID_USER_ID = 'El ID del usuario es inválido',
  INVALID_PRODUCT_ID = 'ID de producto inválido',
  INVALID_STATUS = 'Estado de orden inválido',
  INVALID_TOTAL = 'El monto total debe ser un número positivo',
  EMPTY_PRODUCTS = 'La orden debe contener al menos un producto',
  INVALID_QUANTITY = 'La cantidad debe ser un número positivo',
}
