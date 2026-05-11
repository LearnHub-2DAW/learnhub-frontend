import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../schemas/auth.schema";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLang } from "../context/LangContext";
import "./Register.css";

const Register = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { tr } = useLang();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const { confirmar_correo, ...userData } = data;
      await signup(userData);
      navigate("/login");
    } catch (err) {
      setServerError(err.response?.data?.message || "Error al registrar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="register-card">
        <img src="/logo-buho.png" alt="Logo" className="auth-logo-small" />
        <h2>{tr('r_createAccount')}</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <p className="subtitle">{tr('r_step1')}</p>
          <div className="form-section">
            <div className="input-field">
              <label>{tr('r_username')}</label>
              <input
                {...register("nombre_usuario")}
                className={errors.nombre_usuario ? "input-error" : ""}
              />
              {errors.nombre_usuario && <span className="error-txt">{errors.nombre_usuario.message}</span>}
            </div>

            <div className="input-field">
              <label>{tr('r_password')}</label>
              <input
                type="password"
                {...register("contrasena")}
                className={errors.contrasena ? "input-error" : ""}
              />
              {errors.contrasena && <span className="error-txt">{errors.contrasena.message}</span>}
            </div>
          </div>

          <p className="subtitle">{tr('r_step2')}</p>
          <div className="form-section">
            <div className="input-field">
              <label>{tr('r_email')}</label>
              <input
                {...register("correo_electronico")}
                className={errors.correo_electronico ? "input-error" : ""}
              />
              {errors.correo_electronico && <span className="error-txt">{errors.correo_electronico.message}</span>}
            </div>

            <div className="input-field">
              <label>{tr('r_confirmEmail')}</label>
              <input
                {...register("confirmar_correo")}
                className={errors.confirmar_correo ? "input-error" : ""}
              />
              {errors.confirmar_correo && <span className="error-txt">{errors.confirmar_correo.message}</span>}
            </div>

            <div className="input-row">
              <div className="input-field">
                <label>{tr('r_name')}</label>
                <input {...register("nombre")} className={errors.nombre ? "input-error" : ""} />
                {errors.nombre && <span className="error-txt">{errors.nombre.message}</span>}
              </div>
              <div className="input-field">
                <label>{tr('r_surname')}</label>
                <input {...register("apellidos")} className={errors.apellidos ? "input-error" : ""} />
                {errors.apellidos && <span className="error-txt">{errors.apellidos.message}</span>}
              </div>
            </div>

            <div className="input-row">
              <div className="input-field">
                <label>{tr('r_city')}</label>
                <input {...register("ciudad")} />
              </div>
              <div className="input-field">
                <label>{tr('r_country')}</label>
                <input {...register("pais")} />
              </div>
            </div>
          </div>

          {serverError && <div className="register-server-error">{serverError}</div>}

          <div className="form-buttons">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? tr('r_registering') : tr('r_register')}
            </button>
            <button type="button" className="btn-cancel" onClick={() => navigate("/login")}>{tr('cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
