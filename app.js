const contractAddress = '0x4f395877f7f82b5012F9d4aD092249444A93258e';
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"totalAmount","type":"uint256"}],"name":"DividendsDistributed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"activeStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"distributeDividends","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getGlobalStats","outputs":[{"internalType":"uint256","name":"_totalStaked","type":"uint256"},{"internalType":"uint256","name":"_totalTreasury","type":"uint256"},{"internalType":"uint256","name":"_totalDividendsDistributed","type":"uint256"},{"internalType":"uint256","name":"_totalBNBStakedHistorical","type":"uint256"},{"internalType":"uint256","name":"_dailyDividend","type":"uint256"},{"internalType":"uint256","name":"_activeStakers","type":"uint256"},{"internalType":"uint256","name":"_timeUntilNextDistribution","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopEarners","outputs":[{"internalType":"address[50]","name":"","type":"address[50]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopStakers","outputs":[{"internalType":"address[50]","name":"","type":"address[50]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"totalReceived","type":"uint256"},{"internalType":"uint256","name":"dailyEstimate","type":"uint256"},{"internalType":"uint256","name":"userShare","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakerList","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalBNBStakedHistorical","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalDividendsDistributed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"},{"internalType":"uint256","name":"totalReceived","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawPartialStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]; // (ABI completo, como ya está)

let web3;
let contract;
let userAddress;
let dividendChart;

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('connectWalletBtn')?.addEventListener('click', connectWallet);

  const ctx = document.getElementById('dividendChart')?.getContext('2d');
  if (ctx) {
    dividendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Pool de Dividendos (BNB)',
          data: [],
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
        animation: {
          duration: 1000,
          easing: 'easeInOutQuad'
        },
        plugins: {
          legend: { labels: { color: '#ccc' } },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: {
            ticks: { color: '#999' },
            grid: { color: 'rgba(255,255,255,0.05)' }
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#999' },
            grid: { color: 'rgba(255,255,255,0.05)' }
          }
        }
      }
    });
  }
});

async function connectWallet() {
  if (!window.ethereum) return alert('Por favor instala MetaMask.');

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    userAddress = accounts[0];
    contract = new web3.eth.Contract(contractABI, contractAddress);
    document.getElementById('walletAddress').textContent = userAddress;

    await loadAllStats();
    await loadUserStats();
    await loadRankings();
    setInterval(async () => {
      if (userAddress && contract) {
        await loadAllStats();
        await loadUserStats();
        await loadRankings();
      }
    }, 30000);

  } catch (err) {
    console.error(err);
    alert('Error conectando la wallet. Revisa la consola.');
  }
}

async function loadAllStats() {
  try {
    const stats = await contract.methods.getGlobalStats().call();

    const totalStaked = parseFloat(web3.utils.fromWei(stats._totalStaked, 'ether'));
    const treasury = parseFloat(web3.utils.fromWei(stats._totalTreasury, 'ether'));
    const dividend = parseFloat(web3.utils.fromWei(stats._dailyDividend, 'ether'));

    document.getElementById('totalStaked').textContent = totalStaked.toFixed(4);
    document.getElementById('totalTreasury').textContent = treasury.toFixed(4);
    document.getElementById('dailyDividend').textContent = dividend.toFixed(4);
    document.getElementById('activeStakers').textContent = stats._activeStakers;

    updateChart(dividend);
  } catch (err) {
    console.error('Error stats globales:', err);
  }
}

function updateChart(newValue) {
  if (!dividendChart) return;
  const chart = dividendChart;
  const now = new Date();
  const label = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

  chart.data.labels.push(label);
  chart.data.datasets[0].data.push(newValue);

  if (chart.data.labels.length > 10) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }
  chart.update();
}

async function loadUserStats() {
  try {
    const stats = await contract.methods.getUserStats(userAddress).call();
    document.getElementById('userStaked').textContent = web3.utils.fromWei(stats.stakedAmount, 'ether');
    document.getElementById('userPendingRewards').textContent = web3.utils.fromWei(stats.pendingRewards, 'ether');
    document.getElementById('userDailyEstimate').textContent = web3.utils.fromWei(stats.dailyEstimate, 'ether');
    document.getElementById('userShare').textContent = (parseFloat(stats.userShare) / 1e16).toFixed(2) + '%';
  } catch (err) {
    console.error('Error user stats:', err);
  }
}

async function loadRankings() {
  try {
    const topStakers = await contract.methods.getTopStakers().call();
    const topEarners = await contract.methods.getTopEarners().call();

    const stakeList = document.getElementById('stakeRankingList');
    const earnList = document.getElementById('dividendRankingList');
    stakeList.innerHTML = '';
    earnList.innerHTML = '';

    for (let i = 0; i < topStakers.length; i++) {
      const addr = topStakers[i];
      if (addr === '0x0000000000000000000000000000000000000000') continue;
      const stats = await contract.methods.getUserStats(addr).call();
      const staked = web3.utils.fromWei(stats.stakedAmount, 'ether');
      const li = document.createElement('li');
      li.textContent = `#${i + 1} ${addr.slice(0, 6)}...${addr.slice(-4)} - ${staked} BNB`;
      stakeList.appendChild(li);
    }

    for (let i = 0; i < topEarners.length; i++) {
      const addr = topEarners[i];
      if (addr === '0x0000000000000000000000000000000000000000') continue;
      const stats = await contract.methods.getUserStats(addr).call();
      const received = web3.utils.fromWei(stats.totalReceived, 'ether');
      const li = document.createElement('li');
      li.textContent = `#${i + 1} ${addr.slice(0, 6)}...${addr.slice(-4)} - ${received} BNB`;
      earnList.appendChild(li);
    }
  } catch (err) {
    console.error('Error cargando rankings:', err);
  }
}
