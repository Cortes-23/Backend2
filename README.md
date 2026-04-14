Gestión de cobranzas. Construida con Node.js, Express y MongoDB.

Framework: Express
Base de datos: MongoDB + Mongoose

##Instalación
bashnpm install
npm run dev   

Crear el SUPERADMIN (solo una vez)
Antes de ejecutar, edita el email y la contraseña en el script para nuestro caso usamos uno ya determinado:

Backend/scrips/crearSuperAmin.js:
    correo: "superadmin@cobranzas.com"
    contraseña: "Gotas123"

Luego ejecuta:
    bashnode scripts/crearSuperAdmin.js

###Login

Login para ADMIN 

Recibe el slug desde la URL (https://front-web-ten.vercel.app/offices/:slug/login).
Ejemplo:

https://front-web-ten.vercel.app/offices/credifacil/login

Llama a loginAdmin del AuthContext.

##Arquitectura multi-tenant
Cada oficina es un tenant independiente. El campo officeId en modelos como User, Cliente y Credito garantiza que los datos de una oficina nunca se mezclen con los de otra.
El frontend identifica el tenant enviando el header x-tenant-slug en cada petición "Los headers HTTP son pares clave-valor que viajan junto a cada petición o respuesta. "

