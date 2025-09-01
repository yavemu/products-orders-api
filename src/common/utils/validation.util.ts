export class ValidationUtil {
  /**
   * Valida que una fecha de inicio no sea posterior a una fecha de fin
   */
  static validateDateRange(startDate: Date | string, endDate: Date | string): void {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
      throw new Error('La fecha de inicio no es válida');
    }

    if (isNaN(end.getTime())) {
      throw new Error('La fecha de fin no es válida');
    }

    if (start > end) {
      throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
    }
  }

  /**
   * Convierte strings a objetos Date validados
   */
  static parseAndValidateDates(
    startDate: string,
    endDate: string,
  ): { startDate: Date; endDate: Date } {
    const start = new Date(startDate);
    const end = new Date(endDate);

    this.validateDateRange(start, end);

    return { startDate: start, endDate: end };
  }

  /**
   * Obtiene el rango de fechas del último mes
   */
  static getLastMonthRange(): { startDate: Date; endDate: Date } {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    return { startDate, endDate };
  }

  /**
   * Obtiene el rango de fechas del mes actual
   */
  static getCurrentMonthRange(): { startDate: Date; endDate: Date } {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    return { startDate, endDate };
  }

  /**
   * Formatea una fecha para mostrar en reportes
   */
  static formatDateForDisplay(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Convierte fecha a inicio del día (00:00:00)
   */
  static toStartOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Convierte fecha a fin del día (23:59:59.999)
   */
  static toEndOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }
}
