// ===============================
// CIRS Authentication
// ===============================

// ---------- LOGIN ----------
const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const msg = document.getElementById('msg');

    const emailValue = document.getElementById('email').value.trim();
    const passwordValue = document.getElementById('password').value;
    const roleValue = document.getElementById('role').value;

    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: emailValue,
          password: passwordValue,
          role: roleValue
        })
      });

      localStorage.setItem('cirs_token', data.data.token);
      localStorage.setItem(
        'cirs_user',
        JSON.stringify(data.data.user)
      );

      const userRole = data.data.user.role;

      if (userRole === 'CITIZEN') {
        location.href = 'citizen/dashboard.html';
      } else if (userRole === 'OFFICER') {
        location.href = 'officer/dashboard.html';
      } else if (userRole === 'ADMIN') {
        location.href = 'admin/dashboard.html';
      }

    } catch (err) {
      msg.textContent = err.message;
      msg.className = 'msg error';
    }
  });
}


// ---------- REGISTRATION ----------
const registerForm = document.getElementById('registerForm');

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const msg = document.getElementById('msg');

    const nameValue =
      document.getElementById('name').value.trim();

    const emailValue =
      document.getElementById('email').value.trim();

    const passwordValue =
      document.getElementById('password').value;

    const confirmPasswordValue =
      document.getElementById('confirmPassword').value;

    const phoneValue =
      document.getElementById('phone').value.trim();

    const addressValue =
      document.getElementById('address').value.trim();


    // ---------- FRONTEND VALIDATION ----------

    if (!nameValue) {
      msg.textContent = 'Please enter your full name.';
      msg.className = 'msg error';
      return;
    }

    if (!emailValue) {
      msg.textContent = 'Please enter your email.';
      msg.className = 'msg error';
      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(emailValue)) {
      msg.textContent = 'Please enter a valid email address.';
      msg.className = 'msg error';
      return;
    }

    if (!passwordValue) {
      msg.textContent = 'Please enter a password.';
      msg.className = 'msg error';
      return;
    }

    if (passwordValue !== confirmPasswordValue) {
      msg.textContent = 'Passwords do not match.';
      msg.className = 'msg error';
      return;
    }


    // ---------- SEND TO BACKEND ----------

    try {
      const data = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: nameValue,
          email: emailValue,
          password: passwordValue,
          confirmPassword: confirmPasswordValue,
          phone: phoneValue,
          address: addressValue
        })
      });

      msg.textContent =
        data.message || 'Registration successful. You can now login.';

      msg.className = 'msg success';


      // Go to login page after registration
      setTimeout(() => {
        location.href = 'login.html';
      }, 1000);

    } catch (err) {
      msg.textContent = err.message;
      msg.className = 'msg error';
    }
  });
}