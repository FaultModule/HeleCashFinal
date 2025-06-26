const API = 'https://helecashfinal.onrender.com/api';


const form  = document.getElementById('loginForm');
const errEl = document.getElementById('error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errEl.textContent = '';

  const body = {
    email:  form.email.value.trim(),
    senha:  form.senha.value,
  };

  try {
    const res  = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();

    if (!res.ok) throw new Error(json.error || 'Falha no login');

    localStorage.setItem('token', json.token);
    window.location.href = 'index.html';
  } catch (err) {
    errEl.textContent = err.message;
  }
});

document.getElementById('googleBtn').addEventListener('click', () => {
  window.location.href = `${API}/auth/google`;
});
