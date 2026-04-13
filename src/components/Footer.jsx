import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer-container">
      {/* SECCIÓN PRINCIPAL AZUL */}
      <div className="footer-main">
        {/* Columna 1: Logo */}
        <div className="footer-col">
          <picture className="container-logo">
            <img
              src="/logo-buho.png"
              alt="IES Ruiz Gijón"
              className="footer-logo"
            />
          </picture>
        </div>

        {/* Columna 2: Enlaces */}
        <div className="footer-col">
          <h3>Enlaces</h3>
          <ul>
            <li>
              <a href="#">IES Learnhub</a>
            </li>
            <li>
              <a href="#">PASEN</a>
            </li>
            <li>
              <a href="#">FP Andalucía</a>
            </li>
            <li>
              <a href="#">TodoFP.es</a>
            </li>
          </ul>
        </div>

        {/* Columna 3: Redes Sociales */}
        <div className="footer-col">
          <h3>Síganos</h3>
          <div className="social-links">
            <a href="#" className="social-item">
              <span className="social-icon fb">f</span> Facebook
            </a>
            <a href="#" className="social-item">
              <span className="social-icon tw">t</span> Twitter
            </a>
          </div>
        </div>

        {/* Columna 4: Contacto */}
        <div className="footer-col contact-info">
          <p>C/ Paseo de Consolación, nº 1 - 41710</p>
          <p>Utrera (Sevilla)</p>
          <p className="contact-item">📞 Teléfono: 95 874 23 44</p>
          <p className="contact-item">
            ✉️ E-mail: <br />
            <a href="mailto:41007898.edu@juntadeandalucia.es">
              majugi@nuestrocorreo.es
            </a>
          </p>
        </div>
      </div>

      {/* BARRA INFERIOR COPYRIGHT */}
      <div className="footer-bottom">
        <p>Copyright © 2026</p>
      </div>
    </footer>
  );
};

export default Footer;
