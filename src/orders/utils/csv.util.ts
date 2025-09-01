import { OrderReportItemDto } from '../dto';

export class CsvUtil {
  /**
   * Convierte un array de datos de reporte de órdenes a formato CSV
   */
  static convertOrderReportsToCsv(data: OrderReportItemDto[]): string {
    if (!data || data.length === 0) {
      return 'No hay datos para exportar';
    }

    // Headers del CSV
    const headers = [
      'ID Orden',
      'Identificador',
      'ID Cliente',
      'Nombre Cliente',
      'Total',
      'Cantidad Total',
      'Estado',
      'Fecha Creación',
      'Productos (ID:Nombre:Cantidad:Precio)',
    ];

    // Crear las filas de datos
    const rows = data.map(order => [
      this.escapeCsvValue(order.orderId),
      this.escapeCsvValue(order.identifier),
      this.escapeCsvValue(order.clientId),
      this.escapeCsvValue(order.clientName),
      order.total.toString(),
      order.totalQuantity.toString(),
      this.escapeCsvValue(order.status),
      new Date(order.createdAt).toISOString(),
      this.formatProductsForCsv(order.products),
    ]);

    // Combinar headers y datos
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');

    return csvContent;
  }

  /**
   * Formatea la lista de productos para el CSV
   */
  private static formatProductsForCsv(
    products: Array<{
      productId: string;
      name: string;
      quantity: number;
      price: number;
    }>,
  ): string {
    if (!products || products.length === 0) {
      return '""';
    }

    const productStrings = products.map(
      product =>
        `${product.productId}:${this.cleanForProductList(product.name)}:${product.quantity}:${product.price}`,
    );

    return `"${productStrings.join(' | ')}"`;
  }

  /**
   * Limpia un valor para usar dentro de la lista de productos
   */
  private static cleanForProductList(value: string): string {
    return value
      .replace(/"/g, '""')
      .replace(/:/g, '-')
      .replace(/\|/g, '-')
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      .trim();
  }

  /**
   * Escapa valores para CSV (maneja comillas, saltos de línea, etc.)
   */
  private static escapeCsvValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }

    const stringValue = value.toString();

    // Si contiene coma, comillas, o salto de línea, envolver en comillas
    if (
      stringValue.includes(',') ||
      stringValue.includes('"') ||
      stringValue.includes('\n') ||
      stringValue.includes('\r')
    ) {
      // Escapar comillas duplicándolas
      const escapedValue = stringValue.replace(/"/g, '""');
      return `"${escapedValue}"`;
    }

    return stringValue;
  }

  /**
   * Genera headers para respuesta HTTP de CSV
   */
  static getCsvHeaders(filename: string = 'order-reports'): Record<string, string> {
    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}-${timestamp}.csv`;

    return {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fullFilename}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    };
  }

  /**
   * Añade BOM (Byte Order Mark) para UTF-8 para mejor compatibilidad con Excel
   */
  static addUtf8Bom(csvContent: string): string {
    return '\uFEFF' + csvContent;
  }
}
