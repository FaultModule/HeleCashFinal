const API   = 'https://helecashfinal.onrender.com/api';
const token = localStorage.getItem('token');
if (!token) location.href = 'login.html';

const logoutBtn   = document.getElementById('logout-btn');
const formReceita = document.getElementById('form-receita');
const inputDesc   = document.getElementById('desp-desc');
const inputValor  = document.getElementById('desp-valor');
const inputData   = document.getElementById('desp-data');
const selectCat   = document.getElementById('desp-cat');
const erroBox     = document.getElementById('desp-erro');
const tbody       = document.getElementById('receitas-list');
const btnOpenIncome  = document.getElementById('btn-open-income');
const btnCloseIncome = document.getElementById('btn-close-income');
const incomeModal    = document.getElementById('income-modal');
const incomeForm     = document.getElementById('form-receita');

function openIncomeModal()  {
  incomeModal.classList.remove('hidden');
}
function closeIncomeModal() {
  incomeModal.classList.add('hidden');
}

btnOpenIncome.addEventListener('click', openIncomeModal);

btnCloseIncome.addEventListener('click', closeIncomeModal);
incomeModal.addEventListener('click', (e) => {
  if (e.target === incomeModal) closeIncomeModal();
});

incomeForm.addEventListener('submit', async (e) => {
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

    incomeForm.reset();
    erroBox.textContent = '';
    await listarReceitas();
    closeIncomeModal();
  } catch (err) {
    erroBox.textContent = err.message;
    console.error(err);
  }
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  location.href = 'login.html';
});

document.addEventListener('DOMContentLoaded', async () => {
  await carregarCategorias();
  await listarReceitas();
});

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

async function listarReceitas() {
  tbody.innerHTML =
    '<tr><td colspan="5" class="text-center py-4">Carregando…</td></tr>';

  try {
    const res = await fetch(`${API}/lancamentos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const receitas = data.filter((l) => l.categoria_tipo === 'receita');

    if (!receitas.length) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="text-center text-gray-500 py-4">Nenhuma receita registrada.</td></tr>';
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
          <td class="px-4 py-2">
            <button onclick="removerReceita('${d.id}')" 
              class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
              Remover
            </button>
          </td>
        </tr>`
      );
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML =
      '<tr><td colspan="5" class="text-center text-red-600 py-4">Erro ao carregar receitas.</td></tr>';
  }
}

async function removerReceita(id) {
  const confirmar = confirm("Tem certeza que deseja remover esta receita?");
  if (!confirmar) return;

  try {
    const res = await fetch(`${API}/lancamentos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Erro ao remover");

    listarReceitas();
  } catch (err) {
    console.error(err);
    alert("Erro ao remover receita.");
  }
}

window.removerReceita = removerReceita;
