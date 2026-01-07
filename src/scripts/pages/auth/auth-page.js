import { login, register } from '../../data/api';
import Swal from 'sweetalert2';
import { getActiveRoute } from '../../routes/url-parser';

export default class AuthPage {
  async render() {
    return `
      <section class="container">
        <h2 tabindex="0">Authentication</h2>
        <div class="auth-container" style="max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div class="auth-tabs" style="display: flex; margin-bottom: 20px;">
            <button id="tab-login" class="tab-button active" style="flex: 1; padding: 10px; cursor: pointer;">Login</button>
            <button id="tab-register" class="tab-button" style="flex: 1; padding: 10px; cursor: pointer;">Register</button>
          </div>

          <form id="login-form">
            <h3>Login</h3>
            <div class="form-group">
              <label for="email-login">Email</label>
              <input type="email" id="email-login" required>
            </div>
            <div class="form-group">
              <label for="password-login">Password</label>
              <input type="password" id="password-login" required>
            </div>
            <button type="submit" class="btn-primary" style="width: 100%; margin-top: 10px;">Login</button>
          </form>

          <form id="register-form" style="display: none;">
            <h3>Register</h3>
            <div class="form-group">
              <label for="name-reg">Full Name</label>
              <input type="text" id="name-reg" required>
            </div>
            <div class="form-group">
              <label for="email-reg">Email</label>
              <input type="email" id="email-reg" required>
            </div>
            <div class="form-group">
              <label for="password-reg">Password</label>
              <input type="password" id="password-reg" required minlength="8">
            </div>
            <button type="submit" class="btn-primary" style="width: 100%; margin-top: 10px;">Register</button>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const loginForm = document.querySelector('#login-form');
    const registerForm = document.querySelector('#register-form');
    const tabLogin = document.querySelector('#tab-login');
    const tabRegister = document.querySelector('#tab-register');

    const setActiveTab = (activeBtn, inactiveBtn) => {
      activeBtn.style.backgroundColor = 'lightskyblue';
      activeBtn.style.fontWeight = 'bold';
    
      inactiveBtn.style.backgroundColor = '#e0e0e0';
      inactiveBtn.style.fontWeight = 'normal';
    };

    const currentRoute = getActiveRoute();
    if (currentRoute === '/register') {
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
      setActiveTab(tabRegister, tabLogin);
    } else {
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
      setActiveTab(tabLogin, tabRegister);
    }

    setActiveTab(tabLogin, tabRegister);

    tabLogin.addEventListener('click', () => {
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
      setActiveTab(tabLogin, tabRegister); 

      window.history.replaceState(null, null, '#/login');
    });

    tabRegister.addEventListener('click', () => {
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
      setActiveTab(tabRegister, tabLogin); 

      window.history.replaceState(null, null, '#/register');
    });


    tabLogin.addEventListener('click', () => {
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
    });

    tabRegister.addEventListener('click', () => {
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
    });

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      Swal.fire({
        title: 'Sedang Masuk...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });

      const email = document.querySelector('#email-login').value;
      const password = document.querySelector('#password-login').value;
      const result = await login(email, password);

      Swal.close();

      if (!result.error) {
        Swal.fire('Berhasil!', 'Selamat Datang!', 'success').then(() => {
          window.location.hash = '#/';
        });
      } else {
        Swal.fire('Gagal!', result.message, 'error');
      }
    });

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      Swal.fire({
        title: 'Mendaftarkan Akun...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });

      const name = document.querySelector('#name-reg').value;
      const email = document.querySelector('#email-reg').value;
      const password = document.querySelector('#password-reg').value;
      const result = await register(name, email, password);

      Swal.close(); 

      if (!result.error) {
        Swal.fire('Berhasil!', 'Akun dibuat, silakan Login.', 'success').then(() => {
          tabLogin.click();
        });
      } else {
        Swal.fire('Gagal!', result.message, 'error');
      }
    });
  }
}