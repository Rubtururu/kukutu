// Conexión Web3 y ABI
let contract;
let userAddress;
const contractAddress = "0x4f395877f7f82b5012F9d4aD092249444A93258e";
const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"totalAmount","type":"uint256"}],"name":"DividendsDistributed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"activeStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"distributeDividends","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getGlobalStats","outputs":[{"internalType":"uint256","name":"_totalStaked","type":"uint256"},{"internalType":"uint256","name":"_totalTreasury","type":"uint256"},{"internalType":"uint256","name":"_totalDividendsDistributed","type":"uint256"},{"internalType":"uint256","name":"_totalBNBStakedHistorical","type":"uint256"},{"internalType":"uint256","name":"_dailyDividend","type":"uint256"},{"internalType":"uint256","name":"_activeStakers","type":"uint256"},{"internalType":"uint256","name":"_timeUntilNextDistribution","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopEarners","outputs":[{"internalType":"address[50]","name":"","type":"address[50]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopStakers","outputs":[{"internalType":"address[50]","name":"","type":"address[50]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"totalReceived","type":"uint256"},{"internalType":"uint256","name":"dailyEstimate","type":"uint256"},{"internalType":"uint256","name":"userShare","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakerList","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalBNBStakedHistorical","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalDividendsDistributed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"},{"internalType":"uint256","name":"totalReceived","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawPartialStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

window.addEventListener("load", async () => {
  if (typeof window.ethereum !== "undefined") {
    const web3 = new Web3(window.ethereum);
    await ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    userAddress = accounts[0];
    contract = new web3.eth.Contract(abi, contractAddress);
    loadDashboard();
    setInterval(loadDashboard, 60000); // Actualiza cada minuto
  } else {
    alert("Por favor instala MetaMask para usar esta dApp");
  }
});

async function loadDashboard() {
  try {
    const [totalStats, userStats, topStakers, topEarners] = await Promise.all([
      contract.methods.getAllStats().call(),
      contract.methods.getUserStats(userAddress).call(),
      contract.methods.getTopStakers().call(),
      contract.methods.getTopEarners().call(),
    ]);

    updateGlobalStats(totalStats);
    updateUserStats(userStats);
    updateRanking("top-stakers", topStakers);
    updateRanking("top-earners", topEarners);
  } catch (err) {
    console.error("Error al cargar estadísticas:", err);
  }
}

function updateGlobalStats(stats) {
  document.getElementById("total-staked").innerText = `${parseFloat(Web3.utils.fromWei(stats[0])).toFixed(4)} BNB`;
  document.getElementById("total-treasury").innerText = `${parseFloat(Web3.utils.fromWei(stats[1])).toFixed(4)} BNB`;
  document.getElementById("daily-dividends").innerText = `${parseFloat(Web3.utils.fromWei(stats[2])).toFixed(4)} BNB/día`;
  document.getElementById("active-stakers").innerText = `${stats[3]} usuarios`;
}

function updateUserStats(stats) {
  document.getElementById("user-staked").innerText = `${parseFloat(Web3.utils.fromWei(stats[0])).toFixed(4)} BNB`;
  document.getElementById("pending-rewards").innerText = `${parseFloat(Web3.utils.fromWei(stats[1])).toFixed(4)} BNB`;
  document.getElementById("daily-estimate").innerText = `${parseFloat(Web3.utils.fromWei(stats[2])).toFixed(4)} BNB`;
  document.getElementById("user-share").innerText = `${(parseFloat(stats[3]) / 1e16).toFixed(2)} %`;
  document.getElementById("next-distribution").innerText = `${Math.floor(stats[4] / 3600)}h ${(Math.floor(stats[4] / 60) % 60)}m`;
}

function updateRanking(tableId, rankingData) {
  const table = document.getElementById(tableId);
  table.innerHTML = "<tr><th>#</th><th>Usuario</th><th>Cantidad</th></tr>";
  rankingData.forEach((entry, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${i + 1}</td><td>${entry.user}</td><td>${parseFloat(Web3.utils.fromWei(entry.amount)).toFixed(4)} BNB</td>`;
    table.appendChild(row);
  });
}

// Acciones del usuario
async function stakeBNB() {
  const amount = document.getElementById("stake-amount").value;
  if (!amount || parseFloat(amount) <= 0) return alert("Cantidad inválida");
  try {
    await contract.methods.stake().send({ from: userAddress, value: Web3.utils.toWei(amount) });
    loadDashboard();
  } catch (e) {
    console.error("Error al hacer stake:", e);
  }
}

async function withdrawStake() {
  try {
    await contract.methods.withdrawStake().send({ from: userAddress });
    loadDashboard();
  } catch (e) {
    console.error("Error al retirar stake:", e);
  }
}

async function withdrawRewards() {
  try {
    await contract.methods.withdrawRewards().send({ from: userAddress });
    loadDashboard();
  } catch (e) {
    console.error("Error al retirar recompensas:", e);
  }
}

async function withdrawPartialStake() {
  const amount = document.getElementById("withdraw-amount").value;
  if (!amount || parseFloat(amount) <= 0) return alert("Cantidad inválida");
  try {
    await contract.methods.withdrawPartialStake(Web3.utils.toWei(amount)).send({ from: userAddress });
    loadDashboard();
  } catch (e) {
    console.error("Error al retirar parcial:", e);
  }
}
