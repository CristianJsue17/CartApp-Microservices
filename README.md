# 🛒 App Carrito - E-Commerce de Computadoras

Sistema de e-commerce con arquitectura de microservicios para venta de computadoras con descuento automático de componentes.

## USAR INFRAESTRUCTURA TERRAFORM CON API-GATEWAY-AWS

## 🚀 Tecnologías

- **Backend:** Node.js + Express.js
- **Base de Datos:** AWS DynamoDB (Single Table Design)
- **Infraestructura:** AWS EC2
- **Frontend:** HTML5 + Bootstrap 5 + Vanilla JavaScript
- **IaC:** Terraform (repositorio separado)

---

## 📦 Microservicios

### **1. Catalog Service (Puerto 3001)**
Gestión de componentes y configuraciones.

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/components` | Listar componentes |
| GET | `/api/components/:id` | Obtener componente |
| GET | `/api/configs` | Listar computadoras |
| GET | `/api/configs/:id` | Detalles de computadora |
| GET | `/api/catalog/configs` | Computadoras con conteo |

### **2. Cart Service (Puerto 3002)**
Verificación de disponibilidad de stock.

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/cart/check-availability` | Verificar stock disponible |

### **3. Order Service (Puerto 3003)**
Creación de órdenes y descuento automático de stock.

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/orders` | Crear orden (descuenta stock) |
| GET | `/api/orders` | Listar todas las órdenes |
| GET | `/api/orders/:orderId` | Obtener orden específica |
| GET | `/api/orders/user/:userId` | Órdenes por usuario |

---

## 🗄️ Base de Datos (DynamoDB)

**Tabla:** `ecommerce-main-v2` (Single Table Design)

| Entidad | PK | SK | Descripción |
|---------|----|----|-------------|
| Componente | `COMPONENT#id` | `METADATA` | Stock, precio, specs |
| Computadora | `CONFIG#id` | `METADATA` | Nombre, precio |
| Composición | `CONFIG#id` | `COMPONENT#id` | Cantidad por config |
| Orden | `USER#userId` | `ORDER#orderId` | Orden completada |

---

## ⚙️ Configuración

### **Infraestructura (Terraform)**
📁 La configuración de Terraform está en un **repositorio separado**.

### **Frontend (Local)**
⚠️ **IMPORTANTE:** Actualizar IPs en `frontend/js/config.js` cada vez que se levante la infraestructura:

```javascript
const API_CONFIG = {
  CATALOG_SERVICE: 'http://TU_IP:3001',  // ⬅️ CAMBIAR
  CART_SERVICE: 'http://TU_IP:3002',     // ⬅️ CAMBIAR
  ORDER_SERVICE: 'http://TU_IP:3003'     // ⬅️ CAMBIAR
};
```

**Ejecutar frontend:**

Simplemente ve a la carpeta frontend/ y da doble click al index.html para abrir de manera local.


---

## 📊 Flujo de Compra

1. Usuario ve catálogo de computadoras
2. Agrega items al carrito (en memoria)
3. Verifica disponibilidad de stock
4. Procede al pago
5. **Order Service descuenta componentes automáticamente**
6. Se crea la orden con estado "completed"

---

## 🔥 Características

✅ Carrito de compras en memoria (localStorage)  
✅ Descuento automático de stock de componentes  
✅ Verificación de disponibilidad en tiempo real  
✅ Arquitectura de microservicios independientes  
✅ Single Table Design en DynamoDB  
✅ Transacciones atómicas para evitar overselling  

---

## 📝 Estructura del Proyecto

```
app-carrito/
├── catalog-service/       # Microservicio de catálogo
├── cart-service/          # Microservicio de carrito
├── order-service/         # Microservicio de órdenes
├── frontend/              # Frontend local
│   ├── index.html
│   └── js/
│       ├── config.js      # ⚠️ Actualizar IPs aquí
│       ├── catalog.js
│       ├── cart.js
│       ├── cart-view.js
│       └── orders.js
├── create-dynamodb-table.js
├── seed-data.js
└── package.json
```

---

## 🚀 Despliegue

1. Levantar infraestructura con Terraform (repositorio separado)
2. Obtener IP pública de EC2
3. Actualizar `frontend/js/config.js` con la IP
4. Ejecutar frontend localmente
5. Los microservicios se inician automáticamente con PM2

---

## 👥 Usuario Demo

- **ID:** `user123`
- **Nombre:** Usuario Demo

---

