const User = require('../models/User');

// @desc    Registrar usuário
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    console.log('Tentativa de registro recebida:', req.body);
    const { name, email, password } = req.body;

    // Verificar se o usuário já existe
    let user = await User.findOne({ email });

    if (user) {
      console.log('Usuário já existe:', email);
      return res.status(400).json({ message: 'Usuário já cadastrado' });
    }

    // Criar usuário
    user = await User.create({
      name,
      email,
      password,
    });

    console.log('Usuário criado com sucesso:', email);
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Erro no registro:', error.message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// @desc    Login de usuário
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    console.log('Tentativa de login recebida:', req.body);
    const { email, password } = req.body;

    // Validar email e senha
    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, informe email e senha' });
    }

    // Verificar usuário
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('Usuário não encontrado:', email);
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      console.log('Senha incorreta para:', email);
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    console.log('Login bem-sucedido:', email);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Erro no login:', error.message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// @desc    Obter usuário atual
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Função auxiliar para enviar o token como resposta
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
  });
};