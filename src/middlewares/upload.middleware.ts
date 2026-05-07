import multer from 'multer';
import path from 'path';

// ─────────────────────────────────────────────────────────────
// STORAGE DINÁMICO
// ─────────────────────────────────────────────────────────────

const crearStorage = (carpeta: string) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `public/images/${carpeta}`);
    },

    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);

      const nombre = `${carpeta}_${Date.now()}_${Math.round(
        Math.random() * 1000
      )}${ext}`;

      cb(null, nombre);
    }
  });

// ─────────────────────────────────────────────────────────────
// VALIDACIÓN ARCHIVOS
// ─────────────────────────────────────────────────────────────

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const permitidos = /jpeg|jpg|png|webp/;

  const esValido = permitidos.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (esValido) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Solo se permiten imágenes (jpg, jpeg, png, webp)'
      )
    );
  }
};

// ─────────────────────────────────────────────────────────────
// OPCIONES GENERALES
// ─────────────────────────────────────────────────────────────

const opciones = {
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
};

// ─────────────────────────────────────────────────────────────
// UPLOADS
// ─────────────────────────────────────────────────────────────

export const uploadServicio = multer({
  storage: crearStorage('servicios'),
  ...opciones
});

export const uploadBarbero = multer({
  storage: crearStorage('barberos'),
  ...opciones
});