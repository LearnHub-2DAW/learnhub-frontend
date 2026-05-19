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
              <a href="https://www.instagram.com/learnhub_oficial/" className="social-item">
                <span className="social-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.822a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </span>
                Instagram
              </a>
            </li>
            <li>
              <a href="https://x.com/LearnHubOficial " className="social-item">
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
