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

    data.forEach(item => {
      const dataLanc = new Date(item.data);
      const valor = Number(item.valor);
      const tipo = item.categoria_tipo;

      
      if (tipo === 'receita') totalReceitas += valor;
      if (tipo === 'despesa') totalDespesas += valor;

      
      meses.forEach(m => {
        if (dataLanc.getFullYear() === m.ano && dataLanc.getMonth() === m.mes) {
          if (tipo === 'receita') m.receitas += valor;
          if (tipo === 'despesa') m.despesas += valor;
        }
      });
    });

    document.getElementById('total-saldo').textContent = `R$ ${(totalReceitas - totalDespesas).toFixed(2)}`;
    document.getElementById('total-receitas').textContent = `R$ ${totalReceitas.toFixed(2)}`;
    document.getElementById('total-despesas').textContent = `R$ ${totalDespesas.toFixed(2)}`;

    renderChartMensal(meses.reverse()); 
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error);
  }
}


function renderChartMensal(mensais) {
  const cores = ['#3b82f6', '#ef4444']; // azul e vermelho

  mensais.forEach((mes, index) => {
    const ctx = document.getElementById(`chart${index + 1}`).getContext('2d');

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Receitas', 'Despesas'],
        datasets: [{
          label: `Valores - ${mes.label}`,
          data: [mes.receitas, mes.despesas],
          backgroundColor: cores,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        indexAxis: 'y', // barras horizontais
        plugins: {
          title: {
            display: true,
            text: `Movimentação em ${mes.label}`,
            font: {
              size: 16
            }
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: context => `R$ ${context.raw.toFixed(2)}`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              callback: value => `R$ ${value}`
            }
          },
          y: {
            ticks: {
              font: {
                weight: 'bold'
              }
            }
          }
        }
      }
    });
  });
}

