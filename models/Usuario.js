const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    apellidoP: { type: String, required: true },
    apellidoM: { type: String },
    fechaNacimiento: { type: Date, required: true },
    nacionalidad: { type: String, required: true },
    codigoPostal: { type: String, required: true },
    alcaldiaMunicipio: { type: String, required: true },
    genero: { type: String, required: true },
    telefono: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Usuario', usuarioSchema);
