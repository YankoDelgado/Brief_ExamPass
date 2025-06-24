# Brief_ExamPass

## Tecnologías utilizadas
- React-Vite
- Node.js-Express
- PostgreSQL
- Prisma ORM
- bcrypt
- jsonwebtoken

## Justificación de librerías utilizadas
- Se utiliza bcrypt para aplicar hashing seguro a las contraseñas de los usuarios, siguiendo buenas prácticas de seguridad. De esta forma, las contraseñas no se almacenan en texto plano.
- Se utiliza jsonwebtoken para generar tokens de autenticación JWT, permitiendo proteger rutas y mantener sesiones sin necesidad de usar cookies o almacenamiento en servidor.