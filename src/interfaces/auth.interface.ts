export interface IUsuarioRol {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo_electronico: string;
  contrasena: string;
  rol: 'admin' | 'barbero' | 'cliente';
  estado: 'activo' | 'inactivo';
  fecha_creacion: Date;
}

export interface ILoginPayload {
  correo_electronico: string;
  contrasena: string;
}

export interface IRegistroPayload {
  nombre: string;
  apellido: string;
  correo_electronico: string;
  contrasena: string;
  rol: 'admin' | 'barbero' | 'cliente';
}

export interface IJwtPayload {
  id_usuario: number;
  correo_electronico: string;
  rol: 'admin' | 'barbero' | 'cliente';
}
export interface IUsuarioRol {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo_electronico: string;
  contrasena: string;
  rol: 'admin' | 'barbero' | 'cliente';
  estado: 'activo' | 'inactivo';
  fecha_creacion: Date;
  telefono?: string;
  observaciones?: string;
}

export interface IRegistroPayload {
  nombre: string;
  apellido: string;
  correo_electronico: string;
  contrasena: string;
  rol: 'admin' | 'barbero' | 'cliente';
  telefono?: string;
  observaciones?: string;
}