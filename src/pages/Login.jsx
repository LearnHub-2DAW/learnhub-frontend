import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schemas/auth.schema";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import "./Login.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setServerError(null);
      await login(data.nombre_usuario, data.contrasena);
      navigate("/dashboard");
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Error al conectar con el servidor",
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="login-container-custom">
        <h2 className="login-title-custom">Acceda a su cuenta</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form-custom">
          <div className="form-row-custom">
            <div className="input-block-custom">
              <label>Nombre de usuario</label>
              <div className="input-wrapper-custom">
                <input
                  type="text"
                  placeholder="Nombre de usuario"
                  {...register("nombre_usuario")}
                />
                <span className="input-icon-custom">👤</span>
              </div>
              {errors.nombre_usuario && (
                <span className="error-mini">
                  {errors.nombre_usuario.message}
                </span>
              )}
            </div>

            <div className="input-block-custom">
              <label>Contraseña</label>
              <div className="input-wrapper-custom">
                <input
                  type="password"
                  placeholder="Contraseña"
                  {...register("contrasena")}
                />
                <span className="input-icon-custom">🔒</span>
              </div>
              {errors.contrasena && (
                <span className="error-mini">{errors.contrasena.message}</span>
              )}
            </div>
          </div>

          <div className="action-row-custom">
            <button type="submit" className="btn-acc-custom">
              ACCEDER
            </button>
          </div>

          <div className="extra-links-custom">
            <a href="#" className="forgot-link-custom">
              ¿Olvidó su nombre de usuario o contraseña?
            </a>
            <label className="remember-custom">
              <input type="checkbox" /> Recordar nombre de usuario
            </label>
          </div>

          <div className="guest-row-custom">
            <button type="button" className="btn-guest-custom">
              ENTRAR COMO INVITADO
            </button>
          </div>
        </form>
      </div>

      {/* El cuadro inferior de "Crear nueva cuenta" se mantiene fuera o debajo según tu preferencia */}
      <div className="register-invite-box-custom">
        <h3>¿Es la primera vez que entra aquí?</h3>
        <button
          onClick={() => navigate("/register")}
          className="btn-go-register-custom"
        >
          CREAR NUEVA CUENTA
        </button>
      </div>
    </div>
  );
};

export default Login;
