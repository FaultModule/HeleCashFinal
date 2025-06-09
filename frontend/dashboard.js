document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  fetchDashboardData(token);

  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });
});

async function fetchDashboardData(token) {
  try {
    const response = await fetch('https://helecashfinal.onrender.com/api/lancamentos', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    let totalReceitas = 0;
    let totalDespesas = 0;

    data.forEach(item => {
      const valor = Number(item.valor);
      if (item.categoria_tipo === 'receita') {
        totalReceitas += valor;
      } else if (item.categoria_tipo === 'despesa') {
        totalDespesas += valor;
      }
    });

    const saldoTotal = totalReceitas - totalDespesas;

    document.getElementById('total-saldo').textContent = `R$ ${saldoTotal.toFixed(2)}`;
    document.getElementById('total-receitas').textContent = `R$ ${totalReceitas.toFixed(2)}`;
    document.getElementById('total-despesas').textContent = `R$ ${totalDespesas.toFixed(2)}`;

    renderChart(totalReceitas, totalDespesas);
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error);
  }
}

function renderChart(receitas, despesas) {
  const ctx = document.getElementById('chart').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Receitas', 'Despesas'],
      datasets: [{
        label: 'Distribuição',
        data: [receitas, despesas],
        backgroundColor: ['#3b82f6', '#ef4444']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}
