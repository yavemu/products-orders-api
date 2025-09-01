export enum ProductMessages {
  // Success messages
  CREATED_SUCCESS = 'Producto creado exitosamente',
  UPDATED_SUCCESS = 'Producto actualizado exitosamente',
  DELETED_SUCCESS = 'Producto eliminado exitosamente',
  FOUND_SUCCESS = 'Producto encontrado exitosamente',
  LIST_SUCCESS = 'Lista de productos obtenida exitosamente',
  SEARCH_SUCCESS = 'Búsqueda de productos completada exitosamente',

  // Error messages
  NOT_FOUND = 'Producto no encontrado',
  ALREADY_EXISTS = 'Ya existe un producto con este SKU',
  INVALID_ID = 'ID de producto inválido',
  CREATE_ERROR = 'Error al crear el producto',
  UPDATE_ERROR = 'Error al actualizar el producto',
  DELETE_ERROR = 'Error al eliminar el producto',
  FETCH_ERROR = 'Error al obtener el producto',
  LIST_ERROR = 'Error al obtener los productos',
  SEARCH_ERROR = 'Error al buscar productos',
  FETCH_BY_IDS_ERROR = 'Error al obtener productos por IDs',

  // Validation messages
  NAME_REQUIRED = 'El nombre es requerido',
  SKU_REQUIRED = 'El SKU es requerido',
  PRICE_REQUIRED = 'El precio es requerido',
  PICTURE_REQUIRED = 'La imagen del producto es requerida',
  INVALID_PRICE = 'El precio debe ser un número positivo',
  INVALID_SKU = 'El SKU debe tener un formato válido (solo letras mayúsculas, números y guiones)',
  PICTURE_UPLOAD_ERROR = 'Error al subir la imagen del producto',
  INVALID_PRODUCTS = 'La orden debe contener al menos un producto',
  INVALID_TOTAL_PRODUCT_PRICES = 'Todas las cantidades deben ser mayores a 0',
}
