const bcrypt = require('bcryptjs');

// Generar hashes para las contraseñas
console.log('admin123:', bcrypt.hashSync('admin123', 10));
console.log('doc123:', bcrypt.hashSync('doc123', 10));
console.log('est123:', bcrypt.hashSync('est123', 10));