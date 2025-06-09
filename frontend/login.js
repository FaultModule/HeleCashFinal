document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  try {
    const response = await fetch('https://helecashfinal.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();

    if (response.ok) {
      // Salva o token no localStorage
      localStorage.setItem('token', data.token);
      // Redireciona para a página principal
      window.location.href = 'index.html';
    } else {
      document.getElementById('error').textContent = data.error;
    }

  } catch (error) {
    console.error('Erro ao tentar login:', error);
    document.getElementById('error').textContent = 'Erro ao conectar com o servidor.';
  }
});