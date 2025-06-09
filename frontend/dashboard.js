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
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();

    let totalReceitas = 0;
    let totalDespesas = 0;

    const hoje = new Date();
    const meses = [0, 1, 2].map(i => {
      const ref = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      return {
        label: ref.toLocaleDateString('pt-BR', { month: 'long' }),
        ano: ref.getFullYear(),
        mes: ref.getMonth(),
        receitas: 0,
        despesas: 0
      };
    });
    const despesasPorCategoriaMes = [ {}, {}, {} ];
    data.forEach(item => {
      const dataLanc = new Date(item.data);
      const valor = Number(item.valor);
      const tipo = item.categoria_tipo;

      
      if (tipo === 'receita') totalReceitas += valor;
      if (tipo === 'despesa') totalDespesas += valor;

      
      meses.forEach((m, i) => {
    if (dataLanc.getFullYear() === m.ano && dataLanc.getMonth() === m.mes) {
      const categoria = item.categoria_nome;
      if (tipo === 'despesa') {
      despesasPorCategoriaMes[i][categoria] = (despesasPorCategoriaMes[i][categoria] || 0) + valor;
      }
    }
    });
    });

    document.getElementById('total-saldo').textContent = `R$ ${(totalReceitas - totalDespesas).toFixed(2)}`;
    document.getElementById('total-receitas').textContent = `R$ ${totalReceitas.toFixed(2)}`;
    document.getElementById('total-despesas').textContent = `R$ ${totalDespesas.toFixed(2)}`;

    
    renderChartMensal(meses); // Gráfico de barras
    renderPizzaCharts(despesasPorCategoriaMes, meses); // Gráfico de pizza
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error);
  }
}


function renderChartMensal(mensais) {
  const cores = ['#10b981', '#ef4444'];

  mensais.forEach((mes, index) => {
    const canvasId = `barChart${index + 1}`;
    const labelId = `barLabel${index + 1}`;
    const canvas = document.getElementById(canvasId);
    const labelEl = document.getElementById(labelId);

    if (!canvas || !labelEl) return;

    labelEl.textContent = `Receitas vs Despesas - ${mes.label}`;

    const ctx = canvas.getContext('2d');

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Receitas', 'Despesas'],
        datasets: [{
          label: mes.label,
          data: [mes.receitas, mes.despesas],
          backgroundColor: cores
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  });
}
function renderPizzaCharts(despesasPorMes, meses) {
  despesasPorMes.forEach((dados, index) => {
    const ctx = document.getElementById(`pizzaChart${index + 1}`).getContext('2d');
    const labelEl = document.getElementById(`pizzaLabel${index + 1}`);

    const labels = Object.keys(dados);
    const valores = Object.values(dados);
    const cores = labels.map(() => `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`);

    if (labelEl) {
      labelEl.textContent = `Despesas por Categoria - ${meses[index].label}`;
    }

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: valores,
          backgroundColor: cores
        }]
      },
      options: {
        plugins: {
          title: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw || 0;
                return `${label}: R$ ${value.toFixed(2)}`;
              }
            }
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  });
}
