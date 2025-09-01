import { Types } from 'mongoose';

export interface OrderProductCalculation {
  productId: Types.ObjectId;
  quantity: number;
  price: number;
  name: string;
}

export interface OrderCalculationResult {
  products: OrderProductCalculation[];
  total: number;
  totalQuantity: number;
}

export class OrderCalculationUtil {
  /**
   * Calcula el total y cantidad total de una orden
   */
  static calculateOrderTotals(
    products: OrderProductCalculation[],
  ): Pick<OrderCalculationResult, 'total' | 'totalQuantity'> {
    const total = products.reduce((sum, product) => sum + product.price * product.quantity, 0);
    const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);

    return {
      total: Math.round(total * 100) / 100, // Redondear a 2 decimales
      totalQuantity,
    };
  }

  /**
   * Calcula todos los valores de una orden incluyendo productos
   */
  static calculateFullOrder(products: OrderProductCalculation[]): OrderCalculationResult {
    const { total, totalQuantity } = this.calculateOrderTotals(products);

    return {
      products,
      total,
      totalQuantity,
    };
  }

  /**
   * Genera un identificador único para la orden
   */
  static generateOrderIdentifier(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();

    return `ORD-${year}${month}${day}-${random}`;
  }

  /**
   * Valida que los productos de una orden sean válidos
   */
  static validateOrderProducts(products: Array<{ productId?: any; quantity: number; price: number }>): void {
    if (!products || products.length === 0) {
      throw new Error('Se requiere al menos un producto en la orden');
    }

    for (const product of products) {
      if (product.productId && !product.productId) {
        throw new Error('Cada producto debe tener un ID válido');
      }
      if (!product.quantity || product.quantity <= 0) {
        throw new Error('Cada producto debe tener una cantidad válida mayor a 0');
      }
      if (!product.price || product.price <= 0) {
        throw new Error('Cada producto debe tener un precio válido mayor a 0');
      }
    }
  }

  /**
   * Mapea productos de entrada a productos de cálculo
   */
  static mapToCalculationProducts(
    inputProducts: { productId: string; quantity: number }[],
    productDetails: { id: string; price: number; name: string }[],
  ): OrderProductCalculation[] {
    const productDetailsMap = new Map(productDetails.map(p => [p.id, p]));

    return inputProducts.map(p => {
      const detail = productDetailsMap.get(p.productId);
      if (!detail) {
        throw new Error(`Producto no encontrado: ${p.productId}`);
      }

      return {
        productId: new Types.ObjectId(p.productId),
        quantity: p.quantity,
        price: detail.price,
        name: detail.name,
      };
    });
  }
}
