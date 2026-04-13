import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../schemas/auth.schema";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    try {
      const { confirmar_correo, ...userData } = data;
      // Validación manual extra por si acaso
      if (data.correo_electronico !== confirmar_correo) {
         return alert("Los correos no coinciden");
      }
      await signup(userData);
      alert("Cuenta creada con éxito.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Error al registrar");
    }
  };

  return (
    <div className="auth-page">
      <div className="register-card">
        <img src="/logo-buho.png" alt="Logo" className="auth-logo-small" />
        <h2>Crear una nueva cuenta</h2>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <p className="subtitle">Paso 1: Datos de acceso</p>
          <div className="form-section">
            <div className="input-field">
              <label>Nombre de usuario</label>
              <input 
                {...register("nombre_usuario")} 
                className={errors.nombre_usuario ? "input-error" : ""}
              />
              {errors.nombre_usuario && <span className="error-txt">{errors.nombre_usuario.message}</span>}
            </div>

            <div className="input-field">
              <label>Contraseña</label>
              <input 
                type="password" 
                {...register("contrasena")} 
                className={errors.contrasena ? "input-error" : ""}
              />
              {errors.contrasena && <span className="error-txt">{errors.contrasena.message}</span>}
            </div>
          </div>

          <p className="subtitle">Paso 2: Datos personales</p>
          <div className="form-section">
            <div className="input-field">
              <label>Correo electrónico</label>
              <input 
                {...register("correo_electronico")} 
                className={errors.correo_electronico ? "input-error" : ""}
              />
              {errors.correo_electronico && <span className="error-txt">{errors.correo_electronico.message}</span>}
            </div>

            <div className="input-field">
              <label>Confirmar correo electrónico</label>
              <input 
                {...register("confirmar_correo")} 
                className={errors.confirmar_correo ? "input-error" : ""}
              />
              {errors.confirmar_correo && <span className="error-txt">{errors.confirmar_correo.message}</span>}
            </div>

            <div className="input-row">
              <div className="input-field">
                <label>Nombre</label>
                <input {...register("nombre")} className={errors.nombre ? "input-error" : ""} />
                {errors.nombre && <span className="error-txt">{errors.nombre.message}</span>}
              </div>
              <div className="input-field">
                <label>Apellidos</label>
                <input {...register("apellidos")} className={errors.apellidos ? "input-error" : ""} />
                {errors.apellidos && <span className="error-txt">{errors.apellidos.message}</span>}
              </div>
            </div>

            <div className="input-row">
              <div className="input-field">
                <label>Ciudad</label>
                <input {...register("ciudad")} />
              </div>
              <div className="input-field">
                <label>País</label>
                <input {...register("pais")} />
              </div>
            </div>
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn-primary">CREAR CUENTA</button>
            <button type="button" className="btn-cancel" onClick={() => navigate("/login")}>CANCELAR</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
