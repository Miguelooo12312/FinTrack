# Activar cuentas y sincronización

FinTrack conserva una copia local para que funcione sin conexión y, con una sesión iniciada, la sincroniza con Supabase. Las contraseñas las procesa Supabase Auth; la aplicación no las guarda ni las recibe en una base de datos propia.

1. Crea un proyecto en [Supabase](https://supabase.com/dashboard) y ejecuta `supabase/schema.sql` en **SQL Editor**.
2. En **Authentication > URL Configuration**, agrega la URL final de tu sitio en `Site URL` y en `Redirect URLs`.
3. Copia `assets/js/supabase-config.example.js` a `assets/js/supabase-config.js`. Añade la **Project URL** y la clave **anon/public** de **Project Settings > API**. No uses una clave `service_role`.
4. En **Authentication > Providers > Email**, mantén habilitada la confirmación de correo. Configura SMTP propio antes de producción.
5. Publica el sitio únicamente bajo HTTPS; no lo abras desde `file://`.

Al primer acceso de una cuenta, los datos de ese navegador se suben a su perfil. Después se descarga la versión de la cuenta y se replica en los otros dispositivos. Si se edita el mismo perfil a la vez desde dos dispositivos, prevalece el último guardado.

## Medidas incluidas

- Contraseñas gestionadas y almacenadas con hash por Supabase Auth.
- Sesión persistente del SDK; no se guardan contraseñas en `localStorage`.
- Row Level Security: cada sesión solo puede seleccionar, crear o modificar su propia fila.
- Clave de navegador limitada a `anon`; la protección efectiva está en las políticas RLS.
- Recuperación de contraseña por correo y confirmación de correo configurables en Supabase.
