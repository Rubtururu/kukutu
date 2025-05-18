// Adaptación del JS al contrato actualizado
const contractAddress = '0x4f395877f7f82b5012F9d4aD092249444A93258e';
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"totalAmount","type":"uint256"}],"name":"DividendsDistributed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"activeStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"distributeDividends","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getGlobalStats","outputs":[{"internalType":"uint256","name":"_totalStaked","type":"uint256"},{"internalType":"uint256","name":"_totalTreasury","type":"uint256"},{"internalType":"uint256","name":"_totalDividendsDistributed","type":"uint256"},{"internalType":"uint256","name":"_totalBNBStakedHistorical","type":"uint256"},{"internalType":"uint256","name":"_dailyDividend","type":"uint256"},{"internalType":"uint256","name":"_activeStakers","type":"uint256"},{"internalType":"uint256","name":"_timeUntilNextDistribution","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopEarners","outputs":[{"internalType":"address[50]","name":"","type":"address[50]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopStakers","outputs":[{"internalType":"address[50]","name":"","type":"address[50]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"totalReceived","type":"uint256"},{"internalType":"uint256","name":"dailyEstimate","type":"uint256"},{"internalType":"uint256","name":"userShare","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakerList","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalBNBStakedHistorical","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalDividendsDistributed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"},{"internalType":"uint256","name":"totalReceived","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawPartialStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

let web3;
let contract;
let userAddress;

window.addEventListener('DOMContentLoaded', async () => {
  const connectBtn = document.getElementById('connectWalletBtn');
  const stakeBtn = document.getElementById('stakeBtn');
  const withdrawBtn = document.getElementById('withdrawBtn');
  const partialWithdrawBtn = document.getElementById('partialWithdrawBtn');
  const claimBtn = document.getElementById('claimBtn');

  connectBtn.addEventListener('click', connectWallet);
  stakeBtn.addEventListener('click', stakeBNB);
  withdrawBtn.addEventListener('click', withdrawAll);
  partialWithdrawBtn.addEventListener('click', withdrawPartial);
  claimBtn.addEventListener('click', claimRewards);
});

async function connectWallet() {
  if (!window.ethereum) return alert('Instala MetaMask');
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
      await loadAllStats();
      await loadUserStats();
      await loadRankings();
    }, 30000);
  } catch (err) {
    console.error(err);
    alert('Error al conectar con MetaMask');
  }
}

async function loadAllStats() {
  try {
    const stats = await contract.methods.getGlobalStats().call();
    document.getElementById('totalStaked').textContent = web3.utils.fromWei(stats._totalStaked, 'ether');
    document.getElementById('totalTreasury').textContent = web3.utils.fromWei(stats._totalTreasury, 'ether');
    document.getElementById('dailyDividend').textContent = web3.utils.fromWei(stats._dailyDividend, 'ether');
    document.getElementById('activeStakers').textContent = stats._activeStakers;
    document.getElementById('totalDividendsDistributed').textContent = web3.utils.fromWei(stats._totalDividendsDistributed, 'ether');
    document.getElementById('totalBNBStakedHistorical').textContent = web3.utils.fromWei(stats._totalBNBStakedHistorical, 'ether');
    document.getElementById('timeUntilNextDistribution').textContent = formatTime(stats._timeUntilNextDistribution);
  } catch (err) {
    console.error('Error al cargar estadísticas globales', err);
  }
}

async function loadUserStats() {
  try {
    const stats = await contract.methods.getUserStats(userAddress).call();
    document.getElementById('userStaked').textContent = web3.utils.fromWei(stats.stakedAmount, 'ether');
    document.getElementById('userPendingRewards').textContent = web3.utils.fromWei(stats.pendingRewards, 'ether');
    document.getElementById('userTotalReceived').textContent = web3.utils.fromWei(stats.totalReceived, 'ether');
    document.getElementById('userDailyEstimate').textContent = web3.utils.fromWei(stats.dailyEstimate, 'ether');
    document.getElementById('userShare').textContent = (parseFloat(stats.userShare) / 1e16).toFixed(2) + ' %';
  } catch (err) {
    console.error('Error al cargar estadísticas de usuario', err);
  }
}

async function loadRankings() {
  try {
    const topStakers = await contract.methods.getTopStakers().call();
    const topEarners = await contract.methods.getTopEarners().call();

    const stakeList = document.getElementById('stakeRankingList');
    const dividendList = document.getElementById('dividendRankingList');
    stakeList.innerHTML = '';
    dividendList.innerHTML = '';

    for (let i = 0; i < topStakers.length; i++) {
      if (topStakers[i] === '0x0000000000000000000000000000000000000000') continue;
      const stats = await contract.methods.getUserStats(topStakers[i]).call();
      const li = document.createElement('li');
      li.textContent = `#${i + 1} ${topStakers[i]} - ${web3.utils.fromWei(stats.stakedAmount, 'ether')} BNB`;
      stakeList.appendChild(li);
    }

    for (let i = 0; i < topEarners.length; i++) {
      if (topEarners[i] === '0x0000000000000000000000000000000000000000') continue;
      const stats = await contract.methods.getUserStats(topEarners[i]).call();
      const li = document.createElement('li');
      li.textContent = `#${i + 1} ${topEarners[i]} - ${web3.utils.fromWei(stats.totalReceived, 'ether')} BNB`;
      dividendList.appendChild(li);
    }
  } catch (err) {
    console.error('Error al cargar rankings', err);
  }
}

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs}h ${mins}m ${secs}s`;
}

// Función para hacer stake
async function stakeBNB() {
  const amount = document.getElementById('stakeAmount').value;
  if (!amount || isNaN(amount) || Number(amount) <= 0) return alert('Ingresa una cantidad válida');
  try {
    await contract.methods.stake().send({
      from: userAddress,
      value: web3.utils.toWei(amount, 'ether')
    });
    await loadUserStats();
    await loadAllStats();
    alert('Stake realizado con éxito');
  } catch (err) {
    console.error('Error al hacer stake', err);
    alert('Error al hacer stake');
  }
}

// Función para retirar todo
async function withdrawAll() {
  try {
    await contract.methods.withdraw().send({ from: userAddress });
    await loadUserStats();
    await loadAllStats();
    alert('Retiro completo realizado');
  } catch (err) {
    console.error('Error al retirar', err);
    alert('Error al retirar');
  }
}

// Función para retirar una parte
async function withdrawPartial() {
  const amount = document.getElementById('partialWithdrawAmount').value;
  if (!amount || isNaN(amount) || Number(amount) <= 0) return alert('Ingresa una cantidad válida');
  try {
    const weiAmount = web3.utils.toWei(amount, 'ether');
    await contract.methods.withdrawPartial(weiAmount).send({ from: userAddress });
    await loadUserStats();
    await loadAllStats();
    alert('Retiro parcial realizado');
  } catch (err) {
    console.error('Error al retirar parcialmente', err);
    alert('Error al retirar parcialmente');
  }
}

// Función para reclamar recompensas
async function claimRewards() {
  try {
    await contract.methods.claimRewards().send({ from: userAddress });
    await loadUserStats();
    alert('Recompensas reclamadas');
  } catch (err) {
    console.error('Error al reclamar recompensas', err);
    alert('Error al reclamar recompensas');
  }
}
