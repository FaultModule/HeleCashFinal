document.addEventListener('DOMContentLoaded', () => {
  fetchCategories();
  fetchTransactions();
});

  function parseJwt(token) {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const decoded = JSON.parse(atob(base64));
  return decoded;
}

async function fetchCategories() {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch('https://helecashfinal.onrender.com/api/categorias', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const categories = await response.json();

    const select = document.getElementById('category');

    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = `${cat.nome} (${cat.tipo})`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
  }
};


const form = document.getElementById('transaction-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('token');
  const payload = parseJwt(token);
  const userId = payload.id;

  const description = document.getElementById('description').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const date = document.getElementById('date').value;
  const categoryId = parseInt(document.getElementById('category').value);

    try {
    const response = await fetch('https://helecashfinal.onrender.com/api/lancamentos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        descricao: description,
        valor: amount,
        data: date,
        categoria_id: categoryId,
        usuario_id: userId
      })
    });

    const result = await response.json();
    alert(result.message || 'Lançamento adicionado com sucesso!');

    form.reset();
    fetchTransactions();

  }  catch (error) {
    console.error('Erro ao adicionar lançamento:', error);
    alert('Erro ao adicionar lançamento');
  }
});

async function fetchTransactions() {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch('https://helecashfinal.onrender.com/api/lancamentos', {
      headers: {
      'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();

    const list = document.getElementById('transaction-list');
    list.innerHTML = ''; // limpa a lista atual

    let saldo = 0;

    data.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.data.split('T')[0]} - ${item.descricao} - R$ ${Number(item.valor).toFixed(2)} [${item.categoria_nome}]`;


      // Atualiza saldo
      if (item.categoria_tipo === 'receita') {
        saldo += Number(item.valor);
      } else if (item.categoria_tipo === 'despesa') {
        saldo -= Number(item.valor);
      }

      list.appendChild(li);
    });

    // Atualiza o saldo na tela
    document.getElementById('balance').textContent = saldo.toFixed(2);

  } catch (error) {
    console.error('Erro ao carregar lançamentos:', error);
  }
}
