import { useLang } from '../context/LangContext';
import "./Footer.css";

const Footer = () => {
  const { tr } = useLang();
  return (
    <footer className="footer-container">
      <div className="footer-main">
        <div className="footer-col">
          <picture className="container-logo">
            <img src="/logo-buho.png" alt="IES Learnhub" className="footer-logo" />
          </picture>
        </div>

        <div className="footer-col">
          <h3>{tr('f_links')}</h3>
          <ul>
            <li><a href="#">IES Learnhub</a></li>
            <li><a href="#">PASEN</a></li>
            <li><a href="#">FP Andalucía</a></li>
            <li><a href="#">TodoFP.es</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>{tr('f_followUs')}</h3>
          <div className="social-links">
            <a href="#" className="social-item">
              <span className="social-icon fb">f</span> Facebook
            </a>
            <a href="#" className="social-item">
              <span className="social-icon tw">t</span> Twitter
            </a>
          </div>
        </div>

        <div className="footer-col contact-info">
          <p>C/ Paseo de Consolación, nº 1 - 41710</p>
          <p>Utrera (Sevilla)</p>
          <p className="contact-item">📞 Teléfono: 95 874 23 44</p>
          <p className="contact-item">
            ✉️ E-mail: <br />
            <a href="mailto:majugi@nuestrocorreo.es">majugi@nuestrocorreo.es</a>
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>{tr('f_copyright')}</p>
      </div>
    </footer>
  );
};

export default Footer;
