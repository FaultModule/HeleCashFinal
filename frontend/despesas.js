const API   = 'https://helecashfinal.onrender.com/api';
const token = localStorage.getItem('token');
if (!token) location.href = 'login.html';

const logoutBtn   = document.getElementById('logout-btn');
const formDespesa = document.getElementById('form-despesa');
const inputDesc   = document.getElementById('desp-desc');
const inputValor  = document.getElementById('desp-valor');
const inputData   = document.getElementById('desp-data');
const selectCat   = document.getElementById('desp-cat');
const erroBox     = document.getElementById('desp-erro');
const tbody       = document.getElementById('despesas-list');
const btnOpenExpense  = document.getElementById('btn-open-expense');
const btnCloseExpense = document.getElementById('btn-close-expense');
const expenseModal    = document.getElementById('expense-modal');
const expenseForm     = document.getElementById('form-despesa');

function openExpenseModal()  {
  expenseModal.classList.remove('hidden');
}
function closeExpenseModal() {
  expenseModal.classList.add('hidden');
}

btnOpenExpense.addEventListener('click', openExpenseModal);
btnCloseExpense.addEventListener('click', closeExpenseModal);
expenseModal.addEventListener('click', (e) => {
  if (e.target === expenseModal) closeExpenseModal();
});

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

    formDespesa.reset();
    erroBox.textContent = '';
    await listarDespesas();
    closeExpenseModal();
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
  await listarDespesas();
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
      .filter((c) => c.tipo === 'despesa')
      .forEach((c) => selectCat.add(new Option(c.nome, c.id)));
  } catch (err) {
    erroBox.textContent = 'Erro ao carregar categorias.';
    console.error(err);
  }
}

async function listarDespesas() {
  tbody.innerHTML =
    '<tr><td colspan="5" class="text-center py-4">Carregando…</td></tr>';

  try {
    const res = await fetch(`${API}/lancamentos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const despesas = data.filter((l) => l.categoria_tipo === 'despesa');

    if (!despesas.length) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="text-center text-gray-500 py-4">Nenhuma despesa registrada.</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    despesas.forEach((d) => {
      tbody.insertAdjacentHTML(
        'beforeend',
        `<tr>
          <td class="px-4 py-2">${d.descricao}</td>
          <td class="px-4 py-2">${d.categoria_nome}</td>
          <td class="px-4 py-2">${new Date(d.data).toLocaleDateString()}</td>
          <td class="px-4 py-2 text-red-600 font-semibold">-R$ ${Number(d.valor).toFixed(2)}</td>
          <td class="px-4 py-2">
            <button onclick="removerDespesa('${d.id}')" 
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
      '<tr><td colspan="5" class="text-center text-red-600 py-4">Erro ao carregar despesas.</td></tr>';
  }
}

async function removerDespesa(id) {
  const confirmar = confirm("Tem certeza que deseja remover esta despesa?");
  if (!confirmar) return;

  try {
    const res = await fetch(`${API}/lancamentos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Erro ao remover");

    await listarDespesas();
  } catch (err) {
    console.error(err);
    alert("Erro ao remover despesa.");
  }
}

window.removerDespesa = removerDespesa;
