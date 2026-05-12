import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../schemas/auth.schema";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLang } from "../../context/LangContext";
import "./Login.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { tr } = useLang();
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      await login(data.nombre_usuario, data.contrasena);
      navigate("/dashboard");
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Error al conectar con el servidor",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="login-container-custom">
        <h2 className="login-title-custom">{tr('l_title')}</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form-custom">
          <div className="form-row-custom">
            <div className="input-block-custom">
              <label>{tr('l_username')}</label>
              <div className="input-wrapper-custom">
                <input
                  type="text"
                  placeholder={tr('l_username')}
                  {...register("nombre_usuario")}
                />
                <span className="input-icon-custom">👤</span>
              </div>
              {errors.nombre_usuario && (
                <span className="error-mini">{errors.nombre_usuario.message}</span>
              )}
            </div>

            <div className="input-block-custom">
              <label>{tr('l_password')}</label>
              <div className="input-wrapper-custom">
                <input
                  type="password"
                  placeholder={tr('l_password')}
                  {...register("contrasena")}
                />
                <span className="input-icon-custom">🔒</span>
              </div>
              {errors.contrasena && (
                <span className="error-mini">{errors.contrasena.message}</span>
              )}
            </div>
          </div>

          {serverError && (
            <div className="server-error-custom">{serverError}</div>
          )}

          <div className="action-row-custom">
            <button type="submit" className="btn-acc-custom" disabled={loading}>
              {loading ? tr('l_loggingIn') : tr('l_login')}
            </button>
          </div>

          <div className="extra-links-custom">
            <a href="#" className="forgot-link-custom">{tr('l_forgotPwd')}</a>
            <label className="remember-custom">
              <input type="checkbox" /> {tr('l_remember')}
            </label>
          </div>

          <div className="guest-row-custom">
            <button type="button" className="btn-guest-custom">{tr('l_guest')}</button>
          </div>
        </form>
      </div>

      <div className="register-invite-box-custom">
        <h3>{tr('l_firstTime')}</h3>
        <button onClick={() => navigate("/register")} className="btn-go-register-custom">
          {tr('l_createAccount')}
        </button>
      </div>
    </div>
  );
};

export default Login;
