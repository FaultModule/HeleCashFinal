/* receitas.js ----------------------------------------------------------- */
const API = 'https://helecashfinal.onrender.com/api';

/* ---------------- token / logout -------------------------------------- */
const token = localStorage.getItem('token');
if (!token) location.href = 'login.html';

document.getElementById('logout-btn').onclick = () => {
  localStorage.removeItem('token');
  location.href = 'login.html';
};

/* ---------------- boot ------------------------------------------------- */
document.addEventListener('DOMContentLoaded', async () => {
  await preencherCategorias();
  await listarReceitas();
});

/* ---------------- preencher <select> ---------------------------------- */
async function preencherCategorias() {
  const sel = document.getElementById('rec-categoria');
  sel.innerHTML = '<option selected disabled>Carregando…</option>';

  try {
    const res  = await fetch(`${API}/categorias`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const cats = await res.json();

    sel.innerHTML = '<option selected disabled>Selecione…</option>';
    cats
      .filter(c => c.tipo === 'receita')
      .forEach(c => sel.add(new Option(c.nome, c.id)));
  } catch {
    document.getElementById('rec-erro').textContent =
      'Erro ao carregar categorias.';
  }
}

/* ---------------- submit receita -------------------------------------- */
document.getElementById('form-receita').addEventListener('submit', async e => {
  e.preventDefault();

  const body = {
    descricao   : recDescricao.value.trim(),
    valor       : Number(recValor.value),
    data        : recData.value,
    categoria_id: Number(recCategoria.value)
  };

  try {
    const res  = await fetch(`${API}/lancamentos`, {
      method : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization : `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Falha desconhecida');

    /* sucesso */
    e.target.reset();
    document.getElementById('rec-erro').textContent = '';
    await listarReceitas();
  } catch (err) {
    document.getElementById('rec-erro').textContent = err.message;
  }
});

/* ---------------- listar receitas ------------------------------------- */
async function listarReceitas() {
  const tbody = document.getElementById('receitas-list');
  tbody.innerHTML =
    '<tr><td colspan="4" class="text-center py-4">Carregando…</td></tr>';

  try {
    const res  = await fetch(`${API}/lancamentos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const rec  = data.filter(l => l.categoria_tipo === 'receita');

    if (!rec.length) {
      tbody.innerHTML =
        '<tr><td colspan="4" class="text-center text-gray-500 py-4">Nenhuma receita registrada.</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    rec.forEach(r => {
      tbody.insertAdjacentHTML(
        'beforeend',
        `<tr>
           <td class="px-4 py-2">${r.descricao}</td>
           <td class="px-4 py-2">${r.categoria_nome}</td>
           <td class="px-4 py-2">${new Date(r.data).toLocaleDateString()}</td>
           <td class="px-4 py-2 text-green-600 font-semibold">R$ ${Number(r.valor).toFixed(2)}</td>
         </tr>`
      );
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML =
      '<tr><td colspan="4" class="text-center text-red-600 py-4">Erro ao carregar receitas.</td></tr>';
  }
}
