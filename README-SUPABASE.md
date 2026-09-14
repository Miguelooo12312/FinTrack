# Activar cuentas y sincronización

FinTrack conserva una copia local para que funcione sin conexión y, con una sesión iniciada, la sincroniza con Supabase. Las contraseñas las procesa Supabase Auth; la aplicación no las guarda ni las recibe en una base de datos propia.

1. Crea un proyecto en [Supabase](https://supabase.com/dashboard) y ejecuta `supabase/schema.sql` en **SQL Editor**.
2. En **Authentication > URL Configuration**, configura `https://miguelooo12312.github.io/FinTrack/` como `Site URL` y agrégala también a `Redirect URLs`. Esto permite los enlaces de recuperación desde GitHub Pages.
3. `assets/js/supabase-config.js` contiene la **Project URL** y la clave **anon/public** que debe publicarse junto al sitio estático. No uses nunca una clave `service_role`: la clave pública es segura porque las políticas RLS de `schema.sql` limitan cada perfil a su propietario.
4. En **Authentication > Providers > Email**, mantén habilitada la confirmación de correo. Configura SMTP propio antes de producción.
5. Publica el sitio únicamente bajo HTTPS; no lo abras desde `file://`.

Al primer acceso de una cuenta, los datos de ese navegador se suben a su perfil. Después se descarga la versión de la cuenta y se replica en los otros dispositivos. Para importar movimientos antiguos desde un JSON, inicia sesión y usa **Configuración > Migrar datos anteriores**: se combinan sin reemplazar los datos existentes y se evita duplicar los movimientos iguales. Si se edita el mismo perfil a la vez desde dos dispositivos, prevalece el último guardado.

## Medidas incluidas

- Contraseñas gestionadas y almacenadas con hash por Supabase Auth.
- Sesión persistente del SDK; no se guardan contraseñas en `localStorage`.
- Row Level Security: cada sesión solo puede seleccionar, crear o modificar su propia fila.
- Clave de navegador limitada a `anon`; la protección efectiva está en las políticas RLS.
- Recuperación de contraseña por correo y confirmación de correo configurables en Supabase.
