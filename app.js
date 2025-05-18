const contractAddress = '0x4f395877f7f82b5012F9d4aD092249444A93258e';
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"totalAmount","type":"uint256"}],"name":"DividendsDistributed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"activeStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"distributeDividends","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getGlobalStats","outputs":[{"internalType":"uint256","name":"_totalStaked","type":"uint256"},{"internalType":"uint256","name":"_totalTreasury","type":"uint256"},{"internalType":"uint256","name":"_totalDividendsDistributed","type":"uint256"},{"internalType":"uint256","name":"_totalBNBStakedHistorical","type":"uint256"},{"internalType":"uint256","name":"_dailyDividend","type":"uint256"},{"internalType":"uint256","name":"_activeStakers","type":"uint256"},{"internalType":"uint256","name":"_timeUntilNextDistribution","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopEarners","outputs":[{"internalType":"address[50]","name":"","type":"address[50]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopStakers","outputs":[{"internalType":"address[50]","name":"","type":"address[50]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"totalReceived","type":"uint256"},{"internalType":"uint256","name":"dailyEstimate","type":"uint256"},{"internalType":"uint256","name":"userShare","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakerList","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalBNBStakedHistorical","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalDividendsDistributed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"},{"internalType":"uint256","name":"totalReceived","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawPartialStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

// Variables globales
let web3;
let contract;
let userAddress;

// Esperar que el DOM esté listo
window.addEventListener('DOMContentLoaded', () => {
  // Configurar evento click para conectar wallet
  const btn = document.getElementById('connectWalletBtn');
  btn.addEventListener('click', connectWallet);

  // Inicializar gráfica si existe
  const ctx = document.getElementById('dividendChart')?.getContext('2d');
  if (ctx) {
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ["Día 1", "Día 2", "Día 3", "Día 4", "Hoy"],
        datasets: [{
          label: 'Pool de Dividendos (BNB)',
          data: [1.5, 2.0, 2.8, 3.2, 4.0],
          borderColor: '#00bfa6',
          backgroundColor: 'rgba(0, 191, 166, 0.2)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
});

async function connectWallet() {
  if (!window.ethereum) {
    alert('Por favor instala MetaMask para usar esta dApp.');
    return;
  }
  try {
    // Solicitar conexión a MetaMask
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    userAddress = accounts[0];
    contract = new web3.eth.Contract(contractABI, contractAddress);

    document.getElementById('walletAddress').textContent = userAddress;

    // Cargar datos iniciales
    await loadAllStats();
    await loadUserStats();
    await loadRankings();

    // Recarga automática cada 30 segundos
    setInterval(async () => {
      if (userAddress && contract) {
        await loadAllStats();
        await loadUserStats();
        await loadRankings();
      }
    }, 30000);

  } catch (error) {
    console.error('Error al conectar la wallet:', error);
    alert('Error conectando la wallet. Revisa la consola para más detalles.');
  }
}

async function loadAllStats() {
  try {
    const stats = await contract.methods.getAllStats().call();
    document.getElementById('totalStaked').textContent = web3.utils.fromWei(stats._totalStaked, 'ether');
    document.getElementById('totalTreasury').textContent = web3.utils.fromWei(stats._totalTreasury, 'ether');
    document.getElementById('dailyDividend').textContent = web3.utils.fromWei(stats._dailyDividend, 'ether');
    document.getElementById('activeStakers').textContent = stats._activeStakers;
  } catch (error) {
    console.error('Error cargando estadísticas globales:', error);
  }
}

async function loadUserStats() {
  try {
    const stats = await contract.methods.getUserStats(userAddress).call();
    const stakedBNB = web3.utils.fromWei(stats.stakedAmount, 'ether');
    const pendingRewardsBNB = web3.utils.fromWei(stats.pendingRewards, 'ether');
    const dailyEstimateBNB = web3.utils.fromWei(stats.dailyEstimate, 'ether');
    const userSharePercent = (parseFloat(stats.userShare) / 1e16).toFixed(2) + ' %';

    const nextDistSeconds = parseInt(stats.nextDistributionIn);
    const hours = Math.floor(nextDistSeconds / 3600);
    const minutes = Math.floor((nextDistSeconds % 3600) / 60);
    const seconds = nextDistSeconds % 60;
    const countdown = `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;

    document.getElementById('userStaked').textContent = stakedBNB;
    document.getElementById('userPendingRewards').textContent = pendingRewardsBNB;
    document.getElementById('userDailyEstimate').textContent = dailyEstimateBNB;
    document.getElementById('userShare').textContent = userSharePercent;
    document.getElementById('userNextDistribution').textContent = countdown;
  } catch (error) {
    console.error('Error cargando estadísticas del usuario:', error);
  }
}

async function loadRankings() {
  try {
    // El contrato debe tener funciones para obtener los rankings:
    // Aquí simulamos la carga con ejemplos fijos, reemplaza con llamadas reales

    // Ejemplo para ranking stake top 50
    // const stakeTop = await contract.methods.getTopStakers().call();
    // const dividendsTop = await contract.methods.getTopDividendReceivers().call();

    // Simulamos con datos fijos para que veas la estructura
    const stakeTop = [
      { user: '0x123...abc', amount: web3.utils.toWei('10', 'ether') },
      { user: '0x456...def', amount: web3.utils.toWei('8', 'ether') },
      // ...
    ];

    const dividendsTop = [
      { user: '0x789...ghi', amount: web3.utils.toWei('5', 'ether') },
      { user: '0xabc...jkl', amount: web3.utils.toWei('4', 'ether') },
      // ...
    ];

    const stakeList = document.getElementById('stakeRankingList');
    const dividendsList = document.getElementById('dividendRankingList');

    stakeList.innerHTML = '';
    dividendsList.innerHTML = '';

    stakeTop.forEach((entry, idx) => {
      const li = document.createElement('li');
      li.textContent = `#${idx+1} ${entry.user} - ${web3.utils.fromWei(entry.amount, 'ether')} BNB`;
      stakeList.appendChild(li);
    });

    dividendsTop.forEach((entry, idx) => {
      const li = document.createElement('li');
      li.textContent = `#${idx+1} ${entry.user} - ${web3.utils.fromWei(entry.amount, 'ether')} BNB`;
      dividendsList.appendChild(li);
    });

  } catch (error) {
    console.error('Error cargando rankings:', error);
  }
}

async function stake() {
  const amount = document.getElementById('stakeAmount').value;
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    alert('Introduce una cantidad válida para hacer stake.');
    return;
  }
  try {
    const value = web3.utils.toWei(amount, 'ether');
    await contract.methods.stake().send({ from: userAddress, value });
    alert('Stake realizado con éxito');
    await loadAllStats();
    await loadUserStats();
  } catch (error) {
    console.error('Error al hacer stake:', error);
    alert('Error al hacer stake. Revisa la consola.');
  }
}

async function withdrawStake() {
  try {
    await contract.methods.withdrawStake().send({ from: userAddress });
    alert('Stake retirado con éxito');
    await loadAllStats();
    await loadUserStats();
  } catch (error) {
    console.error('Error al retirar stake:', error);
    alert('Error al retirar stake.');
  }
}

async function withdrawPartialStake() {
  const amount = document.getElementById('withdrawAmount').value;
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    alert('Introduce una cantidad válida para retirar parcialmente.');
    return;
  }
  try {
    const value = web3.utils.toWei(amount, 'ether');
    await contract.methods.withdrawPartialStake(value).send({ from: userAddress });
    alert('Retiro parcial realizado con éxito');
    await loadAllStats();
    await loadUserStats();
  } catch (error) {
    console.error('Error al hacer retiro parcial:', error);
    alert('Error al hacer retiro parcial.');
  }
}

async function withdrawRewards() {
  try {
    await contract.methods.withdrawRewards().send({ from: userAddress });
    alert('Recompensas retiradas con éxito');
    await loadUserStats();
  } catch (error) {
    console.error('Error al retirar recompensas:', error);
    alert('Error al retirar recompensas.');
  }
}
