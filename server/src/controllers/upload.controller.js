const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configurar armazenamento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Criar diretório de uploads se não existir
    if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Gerar nome de arquivo único baseado em timestamp e nome original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas (JPEG, PNG, GIF, WEBP)'), false);
  }
};

// Configurar upload
const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB
}).single('image');

exports.uploadImage = (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Erro do Multer
      return res.status(400).json({ 
        success: false,
        error: err.message 
      });
    } else if (err) {
      // Outro erro
      return res.status(500).json({ 
        success: false,
        error: err.message 
      });
    }
    
    // Tudo ok, arquivo enviado
    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.status(200).json({ 
      success: true,
      imageUrl
    });
  });
};