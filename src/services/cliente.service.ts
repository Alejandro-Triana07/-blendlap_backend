import { UsuarioModel } from '../models/usuario.model';
import { AuthModel } from '../models/auth.model';
import bcrypt from 'bcrypt';
import { pool } from '../database/connection';
import { RowDataPacket } from 'mysql2';

const PRECIO_CORTE = 20000;
const CORTE_DESCUENTO = 11;
const DESCUENTO = 0.5;

export class ClienteService {

  // Obtener todos los clientes
  static async getAll() {
    const clientes = await UsuarioModel.findAllClientes();
    // Agregar conteo de cortes a cada cliente
    const clientesConCortes = await Promise.all(
      clientes.map(async (c) => {
        const total_cortes = await UsuarioModel.contarCortes(c.id_usuario);
        const cortes_ciclo = total_cortes % CORTE_DESCUENTO;
        return { ...c, total_cortes, cortes_ciclo, cortes_para_descuento: CORTE_DESCUENTO - cortes_ciclo };
      })
    );
    return clientesConCortes;
  }

  // Buscar clientes
  static async buscar(termino: string) {
    if (!termino) throw new Error('El término de búsqueda es requerido');
    const clientes = await UsuarioModel.buscarClientes(termino);
    const clientesConCortes = await Promise.all(
      clientes.map(async (c) => {
        const total_cortes = await UsuarioModel.contarCortes(c.id_usuario);
        const cortes_ciclo = total_cortes % CORTE_DESCUENTO;
        return { ...c, total_cortes, cortes_ciclo, cortes_para_descuento: CORTE_DESCUENTO - cortes_ciclo };
      })
    );
    return clientesConCortes;
  }

  // Obtener historial completo del cliente
  static async getHistorial(id_cliente: number) {
    // Reservas completadas
    const [reservas] = await pool.execute<RowDataPacket[]>(
      `SELECT r.id_reserva, r.fecha, r.hora, r.estado,
        CONCAT(b.nombre, ' ', b.apellido) AS barbero,
        GROUP_CONCAT(s.nombre_servicio) AS servicios,
        'reserva' AS tipo
       FROM reserva r
       JOIN usuario_rol b ON r.id_barbero = b.id_usuario
       LEFT JOIN reserva_servicio rs ON r.id_reserva = rs.id_reserva
       LEFT JOIN servicio s ON rs.id_servicio = s.id_servicio
       WHERE r.id_cliente = ?
       GROUP BY r.id_reserva`,
      [id_cliente]
    );

    // Cortes presenciales
    const [presenciales] = await pool.execute<RowDataPacket[]>(
      `SELECT cp.id_corte, cp.fecha, cp.valor_cobrado, cp.descuento_aplicado,
        CONCAT(b.nombre, ' ', b.apellido) AS barbero,
        'presencial' AS tipo
       FROM corte_presencial cp
       JOIN usuario_rol b ON cp.id_barbero = b.id_usuario
       WHERE cp.id_cliente = ?`,
      [id_cliente]
    );

    const total_cortes = await UsuarioModel.contarCortes(id_cliente);
    const cortes_ciclo = total_cortes % CORTE_DESCUENTO;

    return {
      total_cortes,
      cortes_ciclo,
      cortes_para_descuento: CORTE_DESCUENTO - cortes_ciclo,
      proximo_descuento: cortes_ciclo === CORTE_DESCUENTO - 1,
      reservas,
      presenciales
    };
  }

  // Registrar corte presencial
  static async registrarCorte(id_cliente: number, id_barbero: number) {
    const total_cortes = await UsuarioModel.contarCortes(id_cliente);
    const cortes_ciclo = total_cortes % CORTE_DESCUENTO;
    const esDescuento = cortes_ciclo === CORTE_DESCUENTO - 1; // corte #11
    const valor = esDescuento ? PRECIO_CORTE * DESCUENTO : PRECIO_CORTE;

    await UsuarioModel.registrarCortePresencial(id_cliente, id_barbero, valor, esDescuento);

    return {
      mensaje: 'Corte registrado correctamente',
      valor_cobrado: valor,
      descuento_aplicado: esDescuento,
      total_cortes: total_cortes + 1,
      cortes_para_descuento: esDescuento ? CORTE_DESCUENTO : CORTE_DESCUENTO - ((cortes_ciclo + 1) % CORTE_DESCUENTO)
    };
  }

  // Actualizar cliente
  static async update(id: number, data: any) {
    const actualizado = await UsuarioModel.updateCliente(id, data);
    if (!actualizado) throw new Error('Cliente no encontrado');
    return { mensaje: 'Cliente actualizado correctamente' };
  }
}