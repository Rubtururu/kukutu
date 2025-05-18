// Adaptación del JS al contrato actualizado
const contractAddress = '0x4f395877f7f82b5012F9d4aD092249444A93258e';
const contractABI = [
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"totalAmount","type":"uint256"}],"name":"DividendsDistributed","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},
  {"inputs":[],"name":"getGlobalStats","outputs":[{"internalType":"uint256","name":"_totalStaked","type":"uint256"},{"internalType":"uint256","name":"_totalTreasury","type":"uint256"},{"internalType":"uint256","name":"_totalDividendsDistributed","type":"uint256"},{"internalType":"uint256","name":"_totalBNBStakedHistorical","type":"uint256"},{"internalType":"uint256","name":"_dailyDividend","type":"uint256"},{"internalType":"uint256","name":"_activeStakers","type":"uint256"},{"internalType":"uint256","name":"_timeUntilNextDistribution","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"totalReceived","type":"uint256"},{"internalType":"uint256","name":"dailyEstimate","type":"uint256"},{"internalType":"uint256","name":"userShare","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"getTopStakers","outputs":[{"internalType":"address[50]","name":"","type":"address[50]"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"getTopEarners","outputs":[{"internalType":"address[50]","name":"","type":"address[50]"}],"stateMutability":"view","type":"function"}
];

let web3;
let contract;
let userAddress;

window.addEventListener('DOMContentLoaded', async () => {
  const connectBtn = document.getElementById('connectWalletBtn');
  connectBtn.addEventListener('click', connectWallet);
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
