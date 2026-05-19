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
          <ul className="social-links">
            <li>
              <a href="#" className="social-item">
                <span className="social-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6c1.05 0 2.05.2 2.05.2v2.25h-1.16c-1.14 0-1.39.75-1.39 1.45V12h2.5l-.5 3h-2v6.8C18.56 20.87 22 16.84 22 12z" />
                  </svg>
                </span>
                Facebook
              </a>
            </li>
            <li>
              <a href="#" className="social-item">
                <span className="social-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.05c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                  </svg>
                </span>
                Twitter
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-col contact-info">
          <p>C/ Paseo de Consolación, nº 1 - 41710</p>
          <p>Utrera (Sevilla)</p>
          <p className="contact-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.09 8.32 8.82 8.59L6.62 10.79Z" fill="currentColor" />
            </svg>
            <span>Teléfono: 95 874 23 44</span>
          </p>
          <p className="contact-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor" />
            </svg>
            <span>
              E-mail: <br />
              <a href="mailto:majugi@nuestrocorreo.es">majugi@nuestrocorreo.es</a>
            </span>
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
