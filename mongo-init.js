// Script de inicialización de MongoDB
// Cambiar a la base de datos del proyecto
db = db.getSiblingDB('products-order-mongo');

// Crear usuario para la aplicación
db.createUser({
  user: 'nodeuser',
  pwd: 'nodepassword',
  roles: [
    {
      role: 'readWrite',
      db: 'products-order-mongo',
    },
  ],
});

// Crear colecciones iniciales
db.createCollection('products');
db.createCollection('orders');
db.createCollection('users');

// Crear índices para mejorar el rendimiento
db.users.createIndex({ email: 1 }, { unique: true });
db.products.createIndex({ sku: 1 }, { unique: true });
db.orders.createIndex({ identifier: 1 }, { unique: true });
db.orders.createIndex({ clientName: 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ createdAt: -1 });

// Insertar usuario SuperAdmin por defecto
// Email: admin@demo.com, Contraseña: demodemo
db.users.insertOne({
  firstName: 'Super',
  lastName: 'Admin',
  email: 'admin@demo.com',
  password: '$2b$12$vs7N5ii2tLYCt.4Rm/51a.IehP3DpeVtiicZ2YasPDEtX6qU6GWLG', // demodemo
  role: 'admin',
  createdAt: new Date(),
  updatedAt: new Date(),
});

print('✅ SuperAdmin user created: admin@demo.com / demodemo');

// Insertar usuarios adicionales de prueba
db.users.insertMany([
  {
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@demo.com',
    password: '$2b$12$vs7N5ii2tLYCt.4Rm/51a.IehP3DpeVtiicZ2YasPDEtX6qU6GWLG',
    role: 'client',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    firstName: 'María',
    lastName: 'García',
    email: 'maria.garcia@demo.com',
    password: '$2b$12$vs7N5ii2tLYCt.4Rm/51a.IehP3DpeVtiicZ2YasPDEtX6qU6GWLG',
    role: 'client',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);

print('✅ 2 additional test client users created');

// Insertar productos reales de demostración
const products = [
  {
    name: 'Apple iPhone 14 Pro Max',
    sku: 'APL-IP14PM-001',
    price: 1299.99,
    picture:
      'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-14-pro-max-deeppurple',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Samsung Galaxy S23 Ultra',
    sku: 'SAM-GS23U-001',
    price: 1199.99,
    picture:
      'https://images.samsung.com/is/image/samsung/p6pim/levant/sm-s918bzkgmea/gallery/levant-galaxy-s23-ultra-s918-415195-sm-s918bzkgmea-535904516',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Sony WH-1000XM4 Headphones',
    sku: 'SON-WH1000-001',
    price: 349.99,
    picture: 'https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_SL1500_.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'MacBook Air M2',
    sku: 'APL-MBA-M2-001',
    price: 1499.99,
    picture:
      'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/macbook-air-midnight-select-20220606',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Nintendo Switch OLED',
    sku: 'NIN-SW-OLED-001',
    price: 349.99,
    picture: 'https://m.media-amazon.com/images/I/51Pp3u2aK-L._AC_SL1000_.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Canon EOS R6 Camera',
    sku: 'CAN-EOSR6-001',
    price: 2499.99,
    picture: 'https://m.media-amazon.com/images/I/81UJlDli9XL._AC_SL1500_.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const insertedProducts = db.products.insertMany(products);
const productIds = Object.values(insertedProducts.insertedIds);
print('✅ Demo products created with real image URLs');

// Get the client user IDs for order creation
const clientUsers = db.users.find({ role: 'client' }).toArray();
const clientIds = clientUsers.map(user => user._id);

// Función para generar identificador único de orden
function generateOrderId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${year}${month}${day}-${random}`;
}

// Crear órdenes de demostración con múltiples productos
const clientNames = [
  'Empresa ABC S.A.',
  'Comercial XYZ Ltda.',
  'Tech Solutions Inc.',
  'Digital World Corp.',
];

const orderStatuses = ['pending', 'processing', 'shipped', 'delivered'];

const orders = [];

// Función para seleccionar productos únicos aleatorios
function getRandomProducts(productsArray, count) {
  const shuffled = [...productsArray].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Crear 6 órdenes variadas con diferentes cantidades de productos
const orderTemplates = [
  { productCount: 1, statusIndex: 0 }, // 1 producto - pending
  { productCount: 2, statusIndex: 3 }, // 2 productos - shipped  
  { productCount: 1, statusIndex: 2 }, // 1 producto - delivered
  { productCount: 3, statusIndex: 0 }, // 3 productos - pending
  { productCount: 2, statusIndex: 1 }, // 2 productos - processing
  { productCount: 4, statusIndex: 0 }, // 4 productos - pending
];

for (let i = 0; i < orderTemplates.length; i++) {
  const template = orderTemplates[i];
  const selectedProducts = getRandomProducts(products, template.productCount);
  const clientId = clientIds[i % clientIds.length];
  
  let total = 0;
  let totalQuantity = 0;
  const orderProducts = [];
  
  selectedProducts.forEach((product, index) => {
    const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity per product
    const productTotal = product.price * quantity;
    
    total += productTotal;
    totalQuantity += quantity;
    
    orderProducts.push({
      productId: productIds[products.indexOf(product)],
      quantity: quantity,
      price: product.price,
      name: product.name,
    });
  });

  const order = {
    identifier: generateOrderId(),
    clientId: clientId,
    clientName: clientNames[i % clientNames.length],
    total: Math.round(total * 100) / 100,
    totalQuantity: totalQuantity,
    products: orderProducts,
    status: orderStatuses[template.statusIndex],
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Random date within last 7 days
    updatedAt: new Date(),
  };

  orders.push(order);
}

db.orders.insertMany(orders);
print('✅ Demo orders created with multiple products per order, varied quantities, and realistic scenarios');
