const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor, informe o nome'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Por favor, informe o email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor, informe um email válido',
    ],
  },
  password: {
    type: String,
    required: [true, 'Por favor, informe a senha'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Criptografar senha antes de salvar
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Verificar senha
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Gerar token JWT
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, name: this.name, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

module.exports = mongoose.model('User', UserSchema);