import cron from 'node-cron';
import { pool } from '../database/connection';
import { RowDataPacket } from 'mysql2';
import { ReservaService } from '../services/reserva.service';
import logger from './logger';
import { CreditoService } from '../services/credito.service';

export const iniciarCronJobs = () => {

  cron.schedule('*/5 * * * *', async () => {
    try {
      const [reservas] = await pool.execute<RowDataPacket[]>(
        `SELECT id_reserva, id_barbero
         FROM reserva
         WHERE estado IN ('pendiente', 'confirmada')
         AND TIMESTAMP(fecha, hora) + INTERVAL 55 MINUTE < NOW()`
      );

      for (const reserva of reservas) {
        await ReservaService.update(
          reserva.id_reserva,
          { estado: 'completada' },
          'admin',
          0
        );
        logger.info(`Reserva ${reserva.id_reserva} marcada como completada automáticamente`);
      }

    } catch (error) {
      logger.error(`Error en cron job: ${error}`);
    }
  });


  logger.info('Cron jobs iniciados');
};
// Créditos vencidos — cada día a las 8am
cron.schedule('0 8 * * *', async () => {
  try {
    await CreditoService.actualizarVencidos();
    console.log('[CRON] Créditos vencidos actualizados');
  } catch (error) {
    console.error('[CRON] Error actualizando vencidos:', error);
  }
});