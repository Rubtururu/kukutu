// app.js

// Dirección y ABI del contrato (pon aquí la ABI real y dirección de tu contrato)
const CONTRACT_ADDRESS = "0x4f395877f7f82b5012F9d4aD092249444A93258e";
const CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"totalAmount","type":"uint256"}],"name":"DividendsDistributed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"activeStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"distributeDividends","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getGlobalStats","outputs":[{"internalType":"uint256","name":"_totalStaked","type":"uint256"},{"internalType":"uint256","name":"_totalTreasury","type":"uint256"},{"internalType":"uint256","name":"_totalDividendsDistributed","type":"uint256"},{"internalType":"uint256","name":"_totalBNBStakedHistorical","type":"uint256"},{"internalType":"uint256","name":"_dailyDividend","type":"uint256"},{"internalType":"uint256","name":"_activeStakers","type":"uint256"},{"internalType":"uint256","name":"_timeUntilNextDistribution","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopEarners","outputs":[{"internalType":"address[50]","name":"","type":"address[50]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopStakers","outputs":[{"internalType":"address[50]","name":"","type":"address[50]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"totalReceived","type":"uint256"},{"internalType":"uint256","name":"dailyEstimate","type":"uint256"},{"internalType":"uint256","name":"userShare","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakerList","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalBNBStakedHistorical","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalDividendsDistributed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"},{"internalType":"uint256","name":"totalReceived","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawPartialStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

let web3;
let contract;
let accounts = [];

const elements = {
  connectWalletBtn: document.getElementById("connectWalletBtn"),
  walletAddress: document.getElementById("walletAddress"),

  totalStaked: document.getElementById("totalStaked"),
  totalTreasury: document.getElementById("totalTreasury"),
  dividendPool: document.getElementById("dividendPool"),
  totalDailyDividends: document.getElementById("totalDailyDividends"),
  totalUsers: document.getElementById("totalUsers"),

  userStaked: document.getElementById("userStaked"),
  pendingRewards: document.getElementById("pendingRewards"),
  dailyDividendEstimate: document.getElementById("dailyDividendEstimate"),
  timeUntilNextDistribution: document.getElementById("timeUntilNextDistribution"),
  userBonuses: document.getElementById("userBonuses"),

  rankingByStake: document.getElementById("rankingByStake"),
  rankingByDividends: document.getElementById("rankingByDividends"),

  stakeAmount: document.getElementById("stakeAmount"),
  withdrawAmount: document.getElementById("withdrawAmount"),
  stakeBtn: document.getElementById("stakeBtn"),
  withdrawBtn: document.getElementById("withdrawBtn"),
  claimRewardsBtn: document.getElementById("claimRewardsBtn"),

  historicalChartCanvas: document.getElementById("historicalChart")
};

async function connectWallet() {
  if (window.ethereum) {
    try {
      accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      web3 = new Web3(window.ethereum);
      contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

      elements.walletAddress.textContent = accounts[0];
      elements.connectWalletBtn.style.display = "none";

      await loadAllData();
      setupEventListeners();
    } catch (error) {
      alert("Error al conectar la wallet: " + error.message);
    }
  } else {
    alert("Por favor instala MetaMask para usar esta aplicación.");
  }
}

async function loadAllData() {
  try {
    await loadGlobalStats();
    await loadUserStats();
    await loadRankings();
    initChart();
  } catch (error) {
    console.error("Error cargando datos:", error);
  }
}

async function loadGlobalStats() {
  elements.totalStaked.textContent = "Cargando...";
  elements.totalTreasury.textContent = "Cargando...";
  elements.dividendPool.textContent = "Cargando...";
  elements.totalDailyDividends.textContent = "Cargando...";
  elements.totalUsers.textContent = "Cargando...";

  const totalStaked = await contract.methods.totalStaked().call();
  const totalTreasury = await contract.methods.totalTreasury().call();
  // Suponiendo que dividendPool y totalDailyDividends se obtienen así:
  const dividendPool = await contract.methods.getDividendPool().call(); // Cambiar según contrato
  const totalDailyDividends = await contract.methods.getTotalDailyDividend().call();
  const totalUsers = await contract.methods.totalUsers().call();

  elements.totalStaked.textContent = web3.utils.fromWei(totalStaked, "ether");
  elements.totalTreasury.textContent = web3.utils.fromWei(totalTreasury, "ether");
  elements.dividendPool.textContent = web3.utils.fromWei(dividendPool, "ether");
  elements.totalDailyDividends.textContent = web3.utils.fromWei(totalDailyDividends, "ether");
  elements.totalUsers.textContent = totalUsers;
}

async function loadUserStats() {
  if (!accounts.length) return;

  elements.userStaked.textContent = "Cargando...";
  elements.pendingRewards.textContent = "Cargando...";
  elements.dailyDividendEstimate.textContent = "Cargando...";
  elements.timeUntilNextDistribution.textContent = "Cargando...";
  elements.userBonuses.textContent = "Cargando...";

  const user = accounts[0];
  const userStaked = await contract.methods.getUserStake(user).call();
  const pendingRewards = await contract.methods.getPendingRewards(user).call();
  const dailyDividendEstimate = await contract.methods.getUserDailyDividendEstimate(user).call();
  const timeUntilNextDistribution = await contract.methods.getTimeUntilNextDistribution(user).call();
  const userBonuses = await contract.methods.getUserBonuses(user).call();

  elements.userStaked.textContent = web3.utils.fromWei(userStaked, "ether");
  elements.pendingRewards.textContent = web3.utils.fromWei(pendingRewards, "ether");
  elements.dailyDividendEstimate.textContent = web3.utils.fromWei(dailyDividendEstimate, "ether");
  elements.timeUntilNextDistribution.textContent = formatSeconds(timeUntilNextDistribution);
  elements.userBonuses.textContent = userBonuses || "Ninguna";
}

async function loadRankings() {
  elements.rankingByStake.innerHTML = "<li>Cargando...</li>";
  elements.rankingByDividends.innerHTML = "<li>Cargando...</li>";

  const topStake = await contract.methods.getTopStakeholders(50).call();
  const topDividends = await contract.methods.getTopDividendReceivers(50).call();

  elements.rankingByStake.innerHTML = "";
  elements.rankingByDividends.innerHTML = "";

  topStake.forEach((user, i) => {
    const amount = web3.utils.fromWei(user.amount, "ether");
    const addr = user.address;
    const li = document.createElement("li");
    li.textContent = `${addr} — ${amount} BNB`;
    elements.rankingByStake.appendChild(li);
  });

  topDividends.forEach((user, i) => {
    const amount = web3.utils.fromWei(user.amount, "ether");
    const addr = user.address;
    const li = document.createElement("li");
    li.textContent = `${addr} — ${amount} BNB`;
    elements.rankingByDividends.appendChild(li);
  });
}

function formatSeconds(seconds) {
  seconds = Number(seconds);
  if (seconds <= 0) return "Ahora";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return `${h}h ${m}m ${s}s`;
}

function setupEventListeners() {
  elements.stakeBtn.addEventListener("click", async () => {
    const amount = elements.stakeAmount.value;
    if (!amount || amount <= 0) return alert("Introduce una cantidad válida para stakear");
    await stakeBNB(amount);
  });

  elements.withdrawBtn.addEventListener("click", async () => {
    const amount = elements.withdrawAmount.value;
    if (!amount || amount <= 0) return alert("Introduce una cantidad válida para retirar");
    await withdrawBNB(amount);
  });

  elements.claimRewardsBtn.addEventListener("click", async () => {
    await claimRewards();
  });
}

async function stakeBNB(amount) {
  try {
    const valueWei = web3.utils.toWei(amount, "ether");
    await contract.methods.stake().send({ from: accounts[0], value: valueWei });
    alert("Stake realizado con éxito!");
    await loadUserStats();
    await loadGlobalStats();
  } catch (error) {
    alert("Error haciendo stake: " + error.message);
  }
}

async function withdrawBNB(amount) {
  try {
    const valueWei = web3.utils.toWei(amount, "ether");
    await contract.methods.withdraw(valueWei).send({ from: accounts[0] });
    alert("Retiro realizado con éxito!");
    await loadUserStats();
    await loadGlobalStats();
  } catch (error) {
    alert("Error haciendo retiro: " + error.message);
  }
}

async function claimRewards() {
  try {
    await contract.methods.claimRewards().send({ from: accounts[0] });
    alert("Recompensas reclamadas con éxito!");
    await loadUserStats();
    await loadGlobalStats();
  } catch (error) {
    alert("Error reclamando recompensas: " + error.message);
  }
}

// Inicializa la gráfica con Chart.js (datos simulados para que luego adaptes)
function initChart() {
  const ctx = elements.historicalChartCanvas.getContext("2d");

  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Día 1", "Día 2", "Día 3", "Día 4", "Día 5", "Día 6", "Día 7"],
      datasets: [
        {
          label: "BNB Staked",
          data: [1, 2, 2.5, 3, 3.2, 3.5, 4],
          borderColor: "rgba(75,192,192,1)",
          fill: false,
          tension: 0.1,
        },
        {
          label: "Dividendos Distribuidos",
          data: [0.1, 0.15, 0.2, 0.18, 0.22, 0.25, 0.3],
          borderColor: "rgba(255,99,132,1)",
          fill: false,
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      interaction: {
        mode: "index",
        intersect: false,
      },
      stacked: false,
      plugins: {
        title: {
          display: true,
          text: "Histórico de Staking y Dividendos (últimos 7 días)",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

elements.connectWalletBtn.addEventListener("click", connectWallet);
