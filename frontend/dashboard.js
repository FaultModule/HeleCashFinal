const API = 'https://helecashfinal.onrender.com/api';


const parseJwt = (t) => {
  try {
    const b64 = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(escape(atob(b64))));
  } catch { return null; }
};

const authHeaders = (tok) => ({ Authorization: `Bearer ${tok}` });


document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const payload = token && parseJwt(token);

  if (!payload || Date.now() / 1000 > payload.exp) {
    localStorage.removeItem('token');
    return (window.location.href = 'login.html');
  }

  fetchDashboardData(token);

  document
    .getElementById('logout-btn')
    .addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    });
});


async function fetchDashboardData(token) {
  try {
    const res  = await fetch(`${API}/lancamentos`, { headers: authHeaders(token) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    
    let totalReceitas = 0;
    let totalDespesas = 0;

    
    const hoje   = new Date();
    const meses  = [0, 1, 2].map(i => {
      const ref = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      return {
        label: ref.toLocaleDateString('pt-BR', { month: 'long' }),
        ano:   ref.getFullYear(),
        mes:   ref.getMonth(),
        receitas: 0,
        despesas: 0,
      };
    });
    const despesasPorCategoriaMes = [{}, {}, {}];

    
    data.forEach((lan) => {
      const dataLan = new Date(lan.data);
      const valor   = Number(lan.valor);
      const tipo    = lan.categoria_tipo;

      
      if (tipo === 'receita')  totalReceitas  += valor;
      if (tipo === 'despesa')  totalDespesas += valor;

     
      meses.forEach((m, idx) => {
        if (dataLan.getFullYear() === m.ano && dataLan.getMonth() === m.mes) {
          if (tipo === 'receita')  m.receitas += valor;
          if (tipo === 'despesa')  m.despesas += valor;

          if (tipo === 'despesa') {
            const cat = lan.categoria_nome;
            despesasPorCategoriaMes[idx][cat] =
              (despesasPorCategoriaMes[idx][cat] || 0) + valor;
          }
        }
      });
    });

   
    document.getElementById('total-saldo'   ).textContent =
      `R$ ${(totalReceitas - totalDespesas).toFixed(2)}`;
    document.getElementById('total-receitas').textContent = `R$ ${totalReceitas.toFixed(2)}`;
    document.getElementById('total-despesas').textContent = `R$ ${totalDespesas.toFixed(2)}`;

    
    renderChartMensal(meses);
    renderPizzaCharts(despesasPorCategoriaMes, meses);
  } catch (err) {
    console.error('Erro ao carregar dashboard:', err);
    alert('Falha ao carregar dados. Faça login novamente.');
  }
}

let barCharts    = [];
let doughnutCharts = [];

function renderChartMensal(meses) {
  const cores = ['#10b981', '#ef4444'];

  meses.forEach((m, idx) => {
    const ctx = document.getElementById(`barChart${idx + 1}`)?.getContext('2d');
    const lbl = document.getElementById(`barLabel${idx + 1}`);
    if (!ctx || !lbl) return;

    lbl.textContent = `Receitas vs Despesas — ${m.label}`;

    barCharts[idx]?.destroy();

    barCharts[idx] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Receitas', 'Despesas'],
        datasets: [{ data: [m.receitas, m.despesas], backgroundColor: cores }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } },
      },
    });
  });
}

function renderPizzaCharts(dadosMes, meses) {
  dadosMes.forEach((mapa, idx) => {
    const ctx = document.getElementById(`pizzaChart${idx + 1}`)?.getContext('2d');
    const lbl = document.getElementById(`pizzaLabel${idx + 1}`);
    if (!ctx || !lbl) return;

    const labels  = Object.keys(mapa);
    const valores = Object.values(mapa);
    const cores   = labels.map(
      () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`,
    );

    lbl.textContent = `Despesas por Categoria — ${meses[idx].label}`;

    doughnutCharts[idx]?.destroy();

    doughnutCharts[idx] = new Chart(ctx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data: valores, backgroundColor: cores }] },
      options: {
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: ({ label, raw }) => `${label}: R$ ${Number(raw).toFixed(2)}`,
            },
          },
        },
      },
    });
  });
}
