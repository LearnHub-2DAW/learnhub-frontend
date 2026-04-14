import { z } from 'zod';

export const registerSchema = z.object({
  nombre_usuario: z
    .string({ error: 'El nombre de usuario es obligatorio' })
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(100, 'El nombre de usuario no puede superar los 100 caracteres'),

  contrasena: z
    .string({ error: 'La contraseña es obligatoria' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),

  correo_electronico: z
    .string({ error: 'El correo electrónico es obligatorio' })
    .email('El correo electrónico no tiene un formato válido')
    .max(100, 'El correo electrónico no puede superar los 100 caracteres'),

  nombre: z
    .string({ error: 'El nombre es obligatorio' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(75, 'El nombre no puede superar los 75 caracteres'),

  apellidos: z
    .string({ error: 'Los apellidos son obligatorios' })
    .min(2, 'Los apellidos deben tener al menos 2 caracteres')
    .max(75, 'Los apellidos no pueden superar los 75 caracteres'),

  ciudad: z
    .string()
    .max(100, 'La ciudad no puede superar los 100 caracteres')
    .optional(),

  pais: z
    .string()
    .max(100, 'El país no puede superar los 100 caracteres')
    .optional(),
});

export const loginSchema = z.object({
  nombre_usuario: z
    .string({ error: 'El nombre de usuario es obligatorio' })
    .min(1, 'El nombre de usuario es obligatorio'),

  contrasena: z
    .string({ error: 'La contraseña es obligatoria' })
    .min(1, 'La contraseña es obligatoria'),
});
