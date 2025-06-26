/* frontend/receitas.js -------------------------------------------------- */
const API   = 'https://helecashfinal.onrender.com/api';
const token = localStorage.getItem('token');
if (!token) location.href = 'login.html';

/* ------------ elementos DOM ------------------------------------------ */
const logoutBtn   = document.getElementById('logout-btn');
const formDespesa = document.getElementById('form-receita');
const inputDesc   = document.getElementById('desp-desc');
const inputValor  = document.getElementById('desp-valor');
const inputData   = document.getElementById('desp-data');
const selectCat   = document.getElementById('desp-cat');
const erroBox     = document.getElementById('desp-erro');
const tbody       = document.getElementById('receitas-list');

/* ------------ logout -------------------------------------------------- */
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  location.href = 'login.html';
});

/* ------------ boot ---------------------------------------------------- */
document.addEventListener('DOMContentLoaded', async () => {
  await carregarCategorias();
  await listarReceitas();
});

/* ---------------------------------------------------------------------- */
/* Carregar categorias tipo 'receita'                                     */
/* ---------------------------------------------------------------------- */
async function carregarCategorias() {
  try {
    const res  = await fetch(`${API}/categorias`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const cats = await res.json();

    selectCat.innerHTML =
      '<option value="" disabled selected>Selecione…</option>';

    cats
      .filter((c) => c.tipo === 'receita')
      .forEach((c) => selectCat.add(new Option(c.nome, c.id)));
  } catch (err) {
    erroBox.textContent = 'Erro ao carregar categorias.';
    console.error(err);
  }
}

/* ---------------------------------------------------------------------- */
/* Submit nova despesa                                                    */
/* ---------------------------------------------------------------------- */
formDespesa.addEventListener('submit', async (e) => {
  e.preventDefault();

  const body = {
    descricao: inputDesc.value.trim(),
    valor: Number(inputValor.value),
    data: inputData.value,
    categoria_id: Number(selectCat.value),
  };

  try {
    const res = await fetch(`${API}/lancamentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Falha ao adicionar');

    /* sucesso */
    formDespesa.reset();
    erroBox.textContent = '';
    await listarReceitas();
  } catch (err) {
    erroBox.textContent = err.message;
    console.error(err);
  }
});

/* ---------------------------------------------------------------------- */
/* Listar receitas existentes                                             */
/* ---------------------------------------------------------------------- */
async function listarReceitas() {
  tbody.innerHTML =
    '<tr><td colspan="4" class="text-center py-4">Carregando…</td></tr>';

  try {
    const res  = await fetch(`${API}/lancamentos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const receitas = data.filter((l) => l.categoria_tipo === 'receita');

    if (!receitas.length) {
      tbody.innerHTML =
        '<tr><td colspan="4" class="text-center text-gray-500 py-4">Nenhuma despesa registrada.</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    receitas.forEach((d) => {
      tbody.insertAdjacentHTML(
        'beforeend',
        `<tr>
           <td class="px-4 py-2">${d.descricao}</td>
           <td class="px-4 py-2">${d.categoria_nome}</td>
           <td class="px-4 py-2">${new Date(d.data).toLocaleDateString()}</td>
           <td class="px-4 py-2 text-green-600 font-semibold">R$ ${Number(d.valor).toFixed(2)}</td>
         </tr>`
      );
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML =
      '<tr><td colspan="4" class="text-center text-red-600 py-4">Erro ao carregar receitas.</td></tr>';
  }
}
