import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthModel } from '../models/auth.model';
import { ILoginPayload, IRegistroPayload, IJwtPayload } from '../interfaces/auth.interface';
import { pool } from '../database/connection';
import { OAuth2Client } from 'google-auth-library';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthService {

    // LOGIN
    static async login(payload: ILoginPayload) {
        // 1. Verificar que el usuario existe
        const usuario = await AuthModel.findByCorreo(payload.correo_electronico);
        if (!usuario) {
            throw new Error('Credenciales inválidas');
        }

        // 2. Verificar contraseña
        const passwordValida = await bcrypt.compare(payload.contrasena, usuario.contrasena);
        if (!passwordValida) {
            throw new Error('Credenciales inválidas');
        }

        // 3. Generar JWT
        const jwtPayload: IJwtPayload = {
            id_usuario: usuario.id_usuario,
            correo_electronico: usuario.correo_electronico,
            rol: usuario.rol
        };

        const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);

        return {
            token,
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                correo_electronico: usuario.correo_electronico,
                rol: usuario.rol
            }
        };
    }

    // REGISTRO
    static async registro(payload: IRegistroPayload) {
        // 1. Verificar que el correo no exista
        const existe = await AuthModel.findByCorreo(payload.correo_electronico);
        if (existe) {
            throw new Error('El correo ya está registrado');
        }

        // 2. Hashear contraseña
        const contrasena_hash = await bcrypt.hash(payload.contrasena, 10);

        // 3. Crear usuario
        const id_usuario = await AuthModel.create({ ...payload, contrasena_hash });

        // 4. Generar JWT
        const jwtPayload: IJwtPayload = {
            id_usuario,
            correo_electronico: payload.correo_electronico,
            rol: payload.rol
        };

        const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);

        return {
            token,
            usuario: {
                id_usuario,
                nombre: payload.nombre,
                apellido: payload.apellido,
                correo_electronico: payload.correo_electronico,
                rol: payload.rol
            }
        };
    }

    // VERIFICAR TOKEN (para el middleware)
    static verificarToken(token: string): IJwtPayload {
        return jwt.verify(token, JWT_SECRET) as IJwtPayload;
    }
    static async cambiarPassword(correo_electronico: string, nueva_contrasena: string) {
        const usuario = await AuthModel.findByCorreo(correo_electronico);
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        const hash = await bcrypt.hash(nueva_contrasena, 10);
        await pool.execute(
            'UPDATE usuario_rol SET contrasena = ? WHERE correo_electronico = ?',
            [hash, correo_electronico]
        );

        return { mensaje: 'Contraseña actualizada correctamente' };
    }
    // Generar código de recuperación
    static async solicitarRecuperacion(correo_electronico: string) {
        const usuario = await AuthModel.findByCorreo(correo_electronico);
        if (!usuario) {
            throw new Error('No existe una cuenta con ese correo');
        }

        // Generar código de 6 dígitos
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();

        // Expiración en 15 minutos
        const expiracion = new Date();
        expiracion.setMinutes(expiracion.getMinutes() + 15);

        await AuthModel.guardarCodigo(usuario.id_usuario, codigo, expiracion);

        // En producción aquí enviarías el correo/SMS
        // Por ahora retornamos el código directamente
        return {
            mensaje: 'Código de recuperación generado',
            codigo, // ← en producción esto NO se retorna, se envía por correo
            expiracion
        };
    }

    // Resetear contraseña con código
    static async resetearPassword(correo_electronico: string, codigo: string, nueva_contrasena: string) {
        const valido = await AuthModel.verificarCodigo(correo_electronico, codigo);
        if (!valido) {
            throw new Error('Código inválido o expirado');
        }

        const hash = await bcrypt.hash(nueva_contrasena, 10);
        await pool.execute(
            'UPDATE usuario_rol SET contrasena = ? WHERE correo_electronico = ?',
            [hash, correo_electronico]
        );

        await AuthModel.marcarCodigoUsado(correo_electronico, codigo);

        return { mensaje: 'Contraseña actualizada correctamente' };
    }

    static async loginConGoogle(token: string) {
        // 1. Verificar token con Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        if (!payload) throw new Error('Token de Google inválido');

        const { sub: google_id, email, given_name, family_name } = payload;

        // 2. Buscar si ya existe
        let usuario = await AuthModel.findByGoogleId(google_id!);
        if (!google_id || !email) throw new Error('Token de Google inválido');

        if (!usuario) {
            const existe = await AuthModel.findByCorreo(email);
            if (existe) {
                await pool.execute(
                    'UPDATE usuario_rol SET google_id = ? WHERE correo_electronico = ?',
                    [google_id, email]
                );
                usuario = await AuthModel.findByCorreo(email);
            } else {
                const id_usuario = await AuthModel.createConGoogle({
                    nombre: given_name || 'Usuario',
                    apellido: family_name || 'Google',
                    correo_electronico: email,
                    google_id
                });
                usuario = await AuthModel.findById(id_usuario);
            }
        }

        // 3. Si no existe, crear
        if (!usuario) {
            const existe = await AuthModel.findByCorreo(email!);
            if (existe) {
                // Ya tiene cuenta, vincular google_id
                await pool.execute(
                    'UPDATE usuario_rol SET google_id = ? WHERE correo_electronico = ?',
                    [google_id, email]
                );
                usuario = await AuthModel.findByCorreo(email!);
            } else {
                // Crear nuevo usuario
                const id_usuario = await AuthModel.createConGoogle({
                    nombre: given_name || 'Usuario',
                    apellido: family_name || 'Google',
                    correo_electronico: email,
                    google_id
                });
                usuario = await AuthModel.findById(id_usuario);
            }
        }

        if (!usuario) throw new Error('Error al crear usuario');

        // 4. Generar JWT
        const jwtPayload: IJwtPayload = {
            id_usuario: usuario.id_usuario,
            correo_electronico: usuario.correo_electronico,
            rol: usuario.rol
        };

        const token_jwt = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);

        return {
            token: token_jwt,
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                correo_electronico: usuario.correo_electronico,
                rol: usuario.rol
            }
        };
    }
}