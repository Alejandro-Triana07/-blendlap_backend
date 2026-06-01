import nodemailer, { Transporter } from 'nodemailer';
import logger from '../utils/logger';

function emailUser(): string {
  return (process.env.EMAIL_USER || '').trim();
}

function emailPass(): string {
  // Gmail entrega la contraseña de aplicación con espacios; quitarlos evita fallos de auth.
  return (process.env.EMAIL_PASS || '').replace(/\s+/g, '').trim();
}

function isEmailConfigured(): boolean {
  return Boolean(emailUser() && emailPass());
}

function buildFromAddress(): string {
  const raw = (process.env.EMAIL_FROM || '').trim();
  if (raw) return raw;

  const user = emailUser();
  if (user) return `"Blendlap Barbería" <${user}>`;

  return '"Blendlap Barbería" <no-reply@blendlap.local>';
}

function createTransporter(): Transporter | null {
  if (!isEmailConfigured()) return null;

  const auth = {
    user: emailUser(),
    pass: emailPass(),
  };

  const host = process.env.SMTP_HOST?.trim();
  if (host) {
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    return nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === 'true',
      auth,
    });
  }

  // SMTP explícito de Gmail: más confiable en Docker/producción que `service: 'gmail'`.
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth,
    requireTLS: true,
  });
}

let cachedTransporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (cachedTransporter === undefined) {
    cachedTransporter = createTransporter();
  }
  return cachedTransporter;
}

async function sendMailOrDevLog(args: {
  to: string;
  subject: string;
  html: string;
  text: string;
  codigo: string;
  tipo: 'registro' | 'recuperacion';
}): Promise<void> {
  const transporter = getTransporter();
  const to = args.to.trim().toLowerCase();

  if (!transporter) {
    if (process.env.NODE_ENV !== 'production') {
      logger.warn(
        `[EMAIL DEV] ${args.tipo} → ${args.to} | código: ${args.codigo} (solo referencia local; no se envió correo)`
      );
    }
    throw new Error(
      'El servicio de correo no está configurado. Define EMAIL_USER y EMAIL_PASS en blendlap_backend/.env (Gmail: contraseña de aplicación).'
    );
  }

  try {
    await transporter.sendMail({
      from: buildFromAddress(),
      to,
      subject: args.subject,
      text: args.text,
      html: args.html,
    });
    logger.info(`[EMAIL] Enviado (${args.tipo}) → ${to}`);
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : String(err);
    logger.error(`[EMAIL] Error al enviar (${args.tipo}) → ${to}: ${detail}`);
    throw new Error(
      'No se pudo enviar el correo. Verifica EMAIL_USER, EMAIL_PASS (contraseña de aplicación Gmail) y reinicia el servidor.'
    );
  }
}

// Cada dígito va en su propio <td> dentro de un <tr> — nunca se parte en móvil
function buildDigitCells(codigo: string, size: 'sm' | 'lg'): string {
  const w = size === 'lg' ? '62' : '40';
  const h = size === 'lg' ? '70' : '50';
  const lh = size === 'lg' ? '70' : '50';
  const fs = size === 'lg' ? '34' : '24';
  const pad = size === 'lg' ? '6' : '4';

  return codigo
    .split('')
    .map(
      (d) => `
    <td style="padding:0 ${pad}px;">
      <div style="
        width:${w}px;height:${h}px;line-height:${lh}px;
        font-size:${fs}px;font-weight:900;
        text-align:center;display:block;
        color:#1a1a1a;background:#f5f5f5;
        border-radius:12px;
        font-family:'Courier New',Courier,monospace;
      ">${d}</div>
    </td>`
    )
    .join('');
}

function buildEmail(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
</head>
<body style="margin:0;padding:0;background:#111111;
             font-family:'Segoe UI',Helvetica,Arial,sans-serif;
             -webkit-text-size-adjust:100%;">

<table width="100%" cellpadding="0" cellspacing="0" border="0"
       style="background:#111111;padding:32px 12px;">
  <tr><td align="center">

    <table cellpadding="0" cellspacing="0" border="0"
           style="width:100%;max-width:520px;">

      <tr>
        <td style="height:4px;background:#fbc447;
                   border-radius:12px 12px 0 0;"></td>
      </tr>

      <tr>
        <td style="background:#1a1a1a;padding:32px 32px 24px;
                   text-align:center;">
          <div style="color:#fbc447;font-size:26px;font-weight:900;
                      letter-spacing:5px;">BLENDLAP</div>
          <div style="color:rgba(255,255,255,0.3);font-size:10px;
                      letter-spacing:6px;margin-top:4px;">BARBERÍA</div>
        </td>
      </tr>

      <tr>
        <td style="background:#1e1e1e;padding:36px 32px 40px;">
          ${content}
        </td>
      </tr>

      <tr>
        <td style="background:#161616;padding:18px 32px;
                   text-align:center;border-radius:0 0 12px 12px;">
          <p style="color:rgba(255,255,255,0.18);font-size:11px;
                    margin:0;line-height:1.6;">
            © ${new Date().getFullYear()} Blendlap Barbería &nbsp;·&nbsp;
            Correo automático — no respondas a este mensaje.
          </p>
        </td>
      </tr>

    </table>

  </td></tr>
</table>

</body>
</html>`;
}

export class EmailService {
  static isConfigured(): boolean {
    return isEmailConfigured();
  }

  /** Comprueba conexión SMTP al arrancar (no bloquea el servidor si falla). */
  static async verify(): Promise<boolean> {
    const transporter = getTransporter();
    if (!transporter) return false;

    try {
      await transporter.verify();
      logger.info(`Correo: SMTP OK (${emailUser()}) — puede enviar a cualquier destinatario`);
      return true;
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : String(err);
      logger.error(`Correo: falló verificación SMTP — ${detail}`);
      return false;
    }
  }

  static async enviarPrueba(correo: string): Promise<void> {
    const codigo = '1234';
    const nombre = 'Prueba';
    const content = `
      <h2 style="color:#ffffff;font-size:20px;font-weight:800;margin:0 0 8px;text-align:center;">
        Prueba de correo
      </h2>
      <p style="color:rgba(255,255,255,0.45);font-size:13px;margin:0 0 18px;line-height:1.7;text-align:center;">
        Si recibes este mensaje, tu configuración SMTP está funcionando.
      </p>
      <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:0;text-align:center;">
        Código de ejemplo: <strong style="color:#fbc447;">${codigo}</strong>
      </p>
    `;

    await sendMailOrDevLog({
      to: correo,
      subject: 'Prueba de correo - Blendlap Barberia',
      html: buildEmail(content),
      text: `Prueba de correo.\n\nSi recibes este mensaje, SMTP funciona.\n\nCodigo: ${codigo}\n`,
      codigo,
      tipo: 'registro',
    });
  }

  static async enviarCodigoRegistro(correo: string, nombre: string, codigo: string): Promise<void> {
    const cells = buildDigitCells(codigo, 'lg');

    const content = `
      <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px;">
        <tr>
          <td align="center" style="
            width:60px;height:60px;line-height:60px;
            background:rgba(251,196,71,0.12);
            border:2px solid rgba(251,196,71,0.3);
            border-radius:50%;font-size:24px;
            text-align:center;">
            ✉️
          </td>
        </tr>
      </table>

      <h2 style="color:#ffffff;font-size:20px;font-weight:800;
                 margin:0 0 8px;text-align:center;">
        Verifica tu correo electrónico
      </h2>
      <p style="color:rgba(255,255,255,0.45);font-size:13px;
                margin:0 0 28px;line-height:1.7;text-align:center;">
        Hola <strong style="color:#fbc447;">${nombre}</strong>,
        usa este código para completar tu registro en Blendlap Barbería.
      </p>

      <div style="border-top:1px solid rgba(255,255,255,0.07);margin-bottom:26px;"></div>

      <p style="color:rgba(255,255,255,0.3);font-size:10px;font-weight:700;
                margin:0 0 16px;text-align:center;text-transform:uppercase;
                letter-spacing:2.5px;">
        Tu código de verificación
      </p>

      <table cellpadding="0" cellspacing="0" border="0"
             align="center" style="margin:0 auto 10px;">
        <tr>${cells}</tr>
      </table>

      <p style="color:rgba(255,255,255,0.3);font-size:12px;
                text-align:center;margin:14px 0 28px;">
        ⏱&nbsp; Este código expira en
        <strong style="color:rgba(255,255,255,0.55);">15 minutos</strong>
      </p>
    `;

    await sendMailOrDevLog({
      to: correo,
      subject: 'Tu codigo de verificacion - Blendlap Barberia',
      html: buildEmail(content),
      text: `Hola ${nombre},\n\nTu codigo de verificacion es: ${codigo}\n\nExpira en 15 minutos.\n\nBlendlap Barberia`,
      codigo,
      tipo: 'registro',
    });
  }

  static async enviarCodigoRecuperacion(
    correo: string,
    nombre: string,
    codigo: string
  ): Promise<void> {
    const cells = buildDigitCells(codigo, 'sm');

    const content = `
      <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px;">
        <tr>
          <td align="center" style="
            width:60px;height:60px;line-height:60px;
            background:rgba(251,196,71,0.12);
            border:2px solid rgba(251,196,71,0.3);
            border-radius:50%;font-size:24px;
            text-align:center;">
            🔑
          </td>
        </tr>
      </table>

      <h2 style="color:#ffffff;font-size:20px;font-weight:800;
                 margin:0 0 8px;text-align:center;">
        Recuperación de contraseña
      </h2>
      <p style="color:rgba(255,255,255,0.45);font-size:13px;
                margin:0 0 28px;line-height:1.7;text-align:center;">
        Hola <strong style="color:#fbc447;">${nombre}</strong>,
        recibimos una solicitud para restablecer tu contraseña.
      </p>

      <div style="border-top:1px solid rgba(255,255,255,0.07);margin-bottom:26px;"></div>

      <p style="color:rgba(255,255,255,0.3);font-size:10px;font-weight:700;
                margin:0 0 16px;text-align:center;text-transform:uppercase;
                letter-spacing:2.5px;">
        Tu código de verificación
      </p>

      <table cellpadding="0" cellspacing="0" border="0"
             align="center" style="margin:0 auto 10px;">
        <tr>${cells}</tr>
      </table>

      <p style="color:rgba(255,255,255,0.3);font-size:12px;
                text-align:center;margin:14px 0 28px;">
        ⏱&nbsp; Este código expira en
        <strong style="color:rgba(255,255,255,0.55);">15 minutos</strong>
      </p>
    `;

    await sendMailOrDevLog({
      to: correo,
      subject: 'Tu codigo de recuperacion - Blendlap Barberia',
      html: buildEmail(content),
      text: `Hola ${nombre},\n\nTu codigo de recuperacion es: ${codigo}\n\nExpira en 15 minutos.\n\nBlendlap Barberia`,
      codigo,
      tipo: 'recuperacion',
    });
  }
}
