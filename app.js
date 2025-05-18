// Configuración de contrato
const contractAddress = '0x4f395877f7f82b5012F9d4aD092249444A93258e';
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"totalAmount","type":"uint256"}],"name":"DividendsDistributed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"activeStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"distributeDividends","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getGlobalStats","outputs":[{"internalType":"uint256","name":"_totalStaked","type":"uint256"},{"internalType":"uint256","name":"_totalTreasury","type":"uint256"},{"internalType":"uint256","name":"_totalDividendsDistributed","type":"uint256"},{"internalType":"uint256","name":"_totalBNBStakedHistorical","type":"uint256"},{"internalType":"uint256","name":"_dailyDividend","type":"uint256"},{"internalType":"uint256","name":"_activeStakers","type":"uint256"},{"internalType":"uint256","name":"_timeUntilNextDistribution","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopEarners","outputs":[{"internalType":"address[50]","name":"","type":"address[50]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopStakers","outputs":[{"internalType":"address[50]","name":"","type":"address[50]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"totalReceived","type":"uint256"},{"internalType":"uint256","name":"dailyEstimate","type":"uint256"},{"internalType":"uint256","name":"userShare","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakerList","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalBNBStakedHistorical","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalDividendsDistributed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"},{"internalType":"uint256","name":"totalReceived","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawPartialStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

let web3;
let contract;
let userAddress;

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('connectWalletBtn').addEventListener('click', connectWallet);
  document.getElementById('stakeBtn').addEventListener('click', stakeBNB);
  document.getElementById('withdrawAllBtn').addEventListener('click', withdrawAll);
  document.getElementById('withdrawAmountBtn').addEventListener('click', withdrawAmount);
  document.getElementById('claimBtn').addEventListener('click', claimRewards);
});

async function connectWallet() {
  if (!window.ethereum) return alert('MetaMask no está instalado.');
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    userAddress = accounts[0];

    contract = new web3.eth.Contract(contractABI, contractAddress);
    document.getElementById('walletAddress').textContent = formatAddress(userAddress);

    await loadAllStats();
    await loadUserStats();
    await loadRankings();

    setInterval(() => {
      loadAllStats();
      loadUserStats();
      loadRankings();
    }, 30000);

  } catch (error) {
    console.error('Error al conectar la wallet:', error);
  }
}

// Cargar estadísticas
async function loadAllStats() {
  try {
    const stats = await contract.methods.getGlobalStats().call();
    setText('totalStaked', formatBNB(stats._totalStaked));
    setText('totalTreasury', formatBNB(stats._totalTreasury));
    setText('dailyDividend', formatBNB(stats._dailyDividend));
    setText('activeStakers', stats._activeStakers);
    setText('totalDividendsDistributed', formatBNB(stats._totalDividendsDistributed));
    setText('totalBNBStakedHistorical', formatBNB(stats._totalBNBStakedHistorical));
    setText('timeUntilNextDistribution', formatTime(stats._timeUntilNextDistribution));
  } catch (error) {
    console.error('Error al cargar estadísticas globales:', error);
  }
}

async function loadUserStats() {
  try {
    const stats = await contract.methods.getUserStats(userAddress).call();
    setText('userStaked', formatBNB(stats.stakedAmount));
    setText('userPendingRewards', formatBNB(stats.pendingRewards));
    setText('userTotalReceived', formatBNB(stats.totalReceived));
    setText('userDailyEstimate', formatBNB(stats.dailyEstimate));
    setText('userShare', `${(parseFloat(stats.userShare) / 1e16).toFixed(2)} %`);
  } catch (error) {
    console.error('Error al cargar estadísticas de usuario:', error);
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
      const address = topStakers[i];
      if (address === '0x0000000000000000000000000000000000000000') continue;

      const stats = await contract.methods.getUserStats(address).call();
      const li = document.createElement('li');
      li.textContent = `#${i + 1} ${formatAddress(address)} - ${formatBNB(stats.stakedAmount)} BNB`;
      stakeList.appendChild(li);
    }

    for (let i = 0; i < topEarners.length; i++) {
      const address = topEarners[i];
      if (address === '0x0000000000000000000000000000000000000000') continue;

      const stats = await contract.methods.getUserStats(address).call();
      const li = document.createElement('li');
      li.textContent = `#${i + 1} ${formatAddress(address)} - ${formatBNB(stats.totalReceived)} BNB`;
      earnList.appendChild(li);
    }
  } catch (error) {
    console.error('Error al cargar rankings:', error);
  }
}

// Funciones de staking
async function stakeBNB() {
  const amount = document.getElementById('stakeAmountInput').value;
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    return alert('Introduce una cantidad válida de BNB para hacer stake.');
  }

  try {
    const value = web3.utils.toWei(amount, 'ether');
    await contract.methods.stake().send({ from: userAddress, value });
    alert('Stake exitoso');
    await loadUserStats();
    await loadAllStats();
  } catch (error) {
    console.error('Error al hacer stake:', error);
    alert('Error al hacer stake.');
  }
}

async function withdrawAll() {
  try {
    await contract.methods.withdrawAll().send({ from: userAddress });
    alert('Retiro total exitoso');
    await loadUserStats();
    await loadAllStats();
  } catch (error) {
    console.error('Error al retirar:', error);
    alert('Error al retirar.');
  }
}

async function withdrawAmount() {
  const amount = document.getElementById('withdrawAmountInput').value;
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    return alert('Introduce una cantidad válida de BNB para retirar.');
  }

  try {
    const value = web3.utils.toWei(amount, 'ether');
    await contract.methods.withdraw(value).send({ from: userAddress });
    alert('Retiro parcial exitoso');
    await loadUserStats();
    await loadAllStats();
  } catch (error) {
    console.error('Error al retirar cantidad:', error);
    alert('Error al retirar cantidad.');
  }
}

async function claimRewards() {
  try {
    await contract.methods.claimRewards().send({ from: userAddress });
    alert('Recompensas reclamadas');
    await loadUserStats();
    await loadAllStats();
  } catch (error) {
    console.error('Error al reclamar recompensas:', error);
    alert('Error al reclamar recompensas.');
  }
}

// Utilidades
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function formatBNB(value) {
  return parseFloat(web3.utils.fromWei(value, 'ether')).toFixed(4);
}

function formatAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs}h ${mins}m ${secs}s`;
}
