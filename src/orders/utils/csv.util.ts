import { OrderReportItemDto } from '../dto';

export class CsvUtil {
  /**
   * Convierte un reporte completo de órdenes a formato CSV con una fila por producto
   */
  static convertOrderReportsToCsv(
    data: OrderReportItemDto[],
    metadata: {
      total: number;
      filters: {
        startDate: string;
        endDate: string;
        clientId?: string;
        productId?: string;
        sortBy: string;
      };
      summary: {
        totalOrders: number;
        totalRevenue: number;
        totalQuantitySold: number;
        averageOrderValue: number;
      };
    }
  ): string {
    if (!data || data.length === 0) {
      return 'No hay datos para exportar';
    }

    const sections: string[] = [];

    // Headers del CSV - cada producto en su propia fila
    const headers = [
      'ID Orden',
      'Identificador Orden',
      'ID Cliente',
      'Nombre Cliente',
      'Total Orden',
      'Cantidad Total Orden',
      'Estado Orden',
      'Fecha Creacion Orden',
      'ID Producto',
      'Nombre Producto',
      'Cantidad Producto',
      'Precio Producto',
      'Subtotal Producto'
    ];

    sections.push(headers.join(','));

    // Crear una fila por cada producto en cada orden
    data.forEach(order => {
      if (order.products && order.products.length > 0) {
        order.products.forEach(product => {
          const subtotal = product.quantity * product.price;
          const row = [
            this.escapeCsvValue(order.orderId),
            this.escapeCsvValue(order.identifier),
            this.escapeCsvValue(order.clientId),
            this.escapeCsvValue(order.clientName),
            order.total.toFixed(2),
            order.totalQuantity.toString(),
            this.escapeCsvValue(order.status),
            new Date(order.createdAt).toISOString(),
            this.escapeCsvValue(product.productId),
            this.escapeCsvValue(product.name),
            product.quantity.toString(),
            product.price.toFixed(2),
            subtotal.toFixed(2)
          ];
          sections.push(row.join(','));
        });
      }
    });

    // Agregar líneas vacías antes del resumen
    sections.push('');
    sections.push('');

    // Resumen al final
    sections.push('RESUMEN DEL REPORTE');
    sections.push(`Periodo del reporte:,${metadata.filters.startDate} al ${metadata.filters.endDate}`);
    if (metadata.filters.clientId) {
      sections.push(`Filtro Cliente ID:,${metadata.filters.clientId}`);
    }
    if (metadata.filters.productId) {
      sections.push(`Filtro Producto ID:,${metadata.filters.productId}`);
    }
    sections.push(`Ordenado por:,${metadata.filters.sortBy}`);
    sections.push('');
    sections.push('ESTADISTICAS');
    sections.push(`Total de ordenes:,${metadata.summary.totalOrders}`);
    sections.push(`Ingresos totales:,$${metadata.summary.totalRevenue.toFixed(2)}`);
    sections.push(`Cantidad total vendida:,${metadata.summary.totalQuantitySold}`);
    sections.push(`Valor promedio por orden:,$${metadata.summary.averageOrderValue.toFixed(2)}`);
    sections.push(`Fecha de generacion:,${new Date().toISOString()}`);

    return sections.join('\n');
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
