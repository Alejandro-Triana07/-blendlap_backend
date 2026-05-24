import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export class EmailService {

  static async enviarCodigoRecuperacion(
    correo: string,
    nombre: string,
    codigo: string
  ): Promise<void> {
    const digitosHtml = codigo
      .split('')
      .map(d => `
        <span style="
          display: inline-block;
          width: 48px; height: 56px;
          line-height: 56px;
          font-size: 28px; font-weight: 900;
          color: #1a1a1a;
          background: #f7f8fa;
          border: 2px solid #e9ecef;
          border-radius: 10px;
          text-align: center;
          margin: 0 4px;
          font-family: monospace;
        ">${d}</span>`)
      .join('');

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperación de contraseña — Blendlap</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1a1a1a;border-radius:16px 16px 0 0;padding:32px;text-align:center;">
              <div style="color:#fbc447;font-size:26px;font-weight:900;letter-spacing:3px;">BLENDLAP</div>
              <div style="color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:4px;margin-top:2px;">BARBERÍA</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px 48px;border-radius:0 0 16px 16px;">

              <h2 style="color:#1a1a1a;font-size:22px;font-weight:800;margin:0 0 8px;">
                Recuperación de contraseña
              </h2>
              <p style="color:#6c757d;font-size:14px;margin:0 0 28px;line-height:1.6;">
                Hola <strong style="color:#1a1a1a;">${nombre}</strong>, recibimos una solicitud para
                restablecer la contraseña de tu cuenta en Blendlap Barbería.
              </p>

              <!-- Divider -->
              <div style="border-top:1px solid #f0f0f0;margin-bottom:28px;"></div>

              <p style="color:#1a1a1a;font-size:14px;font-weight:700;margin:0 0 16px;text-align:center;text-transform:uppercase;letter-spacing:1px;">
                Tu código de verificación
              </p>

              <!-- Código -->
              <div style="text-align:center;margin-bottom:8px;">
                ${digitosHtml}
              </div>

              <p style="color:#6c757d;font-size:12px;text-align:center;margin:16px 0 28px;">
                ⏱ Este código expira en <strong>15 minutos</strong>
              </p>

              <!-- Divider -->
              <div style="border-top:1px solid #f0f0f0;margin-bottom:24px;"></div>

              <p style="color:#6c757d;font-size:13px;line-height:1.7;margin:0 0 16px;">
                Ingresa este código en la página de recuperación de contraseña de Blendlap.
                Por tu seguridad, <strong style="color:#1a1a1a;">nunca compartas este código</strong>
                con nadie, ni siquiera con nuestro equipo.
              </p>

              <p style="color:#adb5bd;font-size:12px;line-height:1.6;margin:0;">
                Si no solicitaste recuperar tu contraseña, puedes ignorar este correo.
                Tu cuenta permanece segura y no se realizará ningún cambio.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0;text-align:center;">
              <p style="color:#adb5bd;font-size:11px;margin:0;">
                © ${new Date().getFullYear()} Blendlap Barbería &nbsp;·&nbsp; Este es un correo automático, no respondas a este mensaje.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Blendlap Barbería" <${process.env.EMAIL_USER}>`,
      to: correo,
      subject: 'Tu código de recuperación — Blendlap Barbería',
      html,
    });
  }
}
