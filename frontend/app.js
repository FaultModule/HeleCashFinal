const BASE_URL = 'https://helecashfinal.onrender.com/api';


function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
   
    return JSON.parse(decodeURIComponent(escape(atob(base64))));
  } catch (_) {
    return null;
  }
}

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const payload = parseJwt(token);
  if (!payload || Date.now() / 1000 > payload.exp) {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
    return;
  }

  await Promise.all([fetchCategories(token), fetchTransactions(token)]);
});

async function fetchCategories(token) {
  try {
    const res = await fetch(`${BASE_URL}/categorias`, {
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const categorias = await res.json();
    const select = document.getElementById('category');
    select.innerHTML = '<option value="" disabled selected>Selecione…</option>';

    categorias.forEach(({ id, nome, tipo }) => {
      const opt = new Option(`${nome} (${tipo})`, id);
      select.add(opt);
    });
  } catch (err) {
    console.error('Erro ao carregar categorias:', err);
    alert('Não foi possível carregar categorias. Tente novamente.');
  }
}


const form = document.getElementById('transaction-form');
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('token');
  const payload = parseJwt(token);
  if (!payload) return alert('Sessão inválida. Faça login de novo.');

  const body = {
    descricao: form.description.value.trim(),
    valor: Number(form.amount.value),
    data: form.date.value,
    categoria_id: Number(form.category.value),
    
  };

  try {
    const res = await fetch(`${BASE_URL}/lancamentos`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro desconhecido');

    alert(json.message || 'Lançamento adicionado com sucesso!');
    form.reset();
    await fetchTransactions(token);
  } catch (err) {
    console.error(err);
    alert(`Erro ao adicionar lançamento: ${err.message}`);
  }
});


async function fetchTransactions(token) {
  try {
    const res = await fetch(`${BASE_URL}/lancamentos`, {
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const ul = document.getElementById('transaction-list');
    ul.innerHTML = '';

    let saldo = 0;
    data.forEach((t) => {
      const li = document.createElement('li');
      li.textContent = `${t.data.slice(0, 10)} — ${t.descricao} — R$ ${Number(
        t.valor,
      ).toFixed(2)} [${t.categoria_nome}]`;

      saldo += t.categoria_tipo === 'receita' ? Number(t.valor) : -Number(t.valor);
      ul.appendChild(li);
    });

    document.getElementById('balance').textContent = saldo.toFixed(2);
  } catch (err) {
    console.error('Erro ao carregar lançamentos:', err);
    alert('Não foi possível carregar lançamentos.');
  }
}


document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});

