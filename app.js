const CONTRACT_ADDRESS = "0x4f395877f7f82b5012F9d4aD092249444A93258e";
const ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"totalAmount","type":"uint256"}],"name":"DividendsDistributed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"activeStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"distributeDividends","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getGlobalStats","outputs":[{"internalType":"uint256","name":"_totalStaked","type":"uint256"},{"internalType":"uint256","name":"_totalTreasury","type":"uint256"},{"internalType":"uint256","name":"_totalDividendsDistributed","type":"uint256"},{"internalType":"uint256","name":"_totalBNBStakedHistorical","type":"uint256"},{"internalType":"uint256","name":"_dailyDividend","type":"uint256"},{"internalType":"uint256","name":"_activeStakers","type":"uint256"},{"internalType":"uint256","name":"_timeUntilNextDistribution","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopEarners","outputs":[{"internalType":"address[50]","name":"","type":"address[50]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopStakers","outputs":[{"internalType":"address[50]","name":"","type":"address[50]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"totalReceived","type":"uint256"},{"internalType":"uint256","name":"dailyEstimate","type":"uint256"},{"internalType":"uint256","name":"userShare","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakerList","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalBNBStakedHistorical","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalDividendsDistributed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"},{"internalType":"uint256","name":"totalReceived","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawPartialStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

let web3, contract, userAddress;

window.addEventListener("load", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

    window.ethereum.on("accountsChanged", async () => {
      await connectWallet();
    });

    await connectWallet();
  } else {
    alert("MetaMask no está instalado.");
  }
});

async function connectWallet() {
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    userAddress = accounts[0];
    document.getElementById("walletAddress").innerText = shortenAddress(userAddress);
    await loadStats();
  } catch (error) {
    console.error("Error al conectar wallet:", error);
  }
}

function shortenAddress(addr) {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function formatBNB(value) {
  try {
    return Number(web3.utils.fromWei(value, "ether")).toFixed(4);
  } catch {
    return "0.0000";
  }
}

function formatTime(seconds) {
  seconds = Number(seconds);
  if (isNaN(seconds) || seconds <= 0) return "-";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

async function loadStats() {
  try {
    setLoading(true);

    const global = await contract.methods.getGlobalStats().call();
    const user = await contract.methods.getUserStats(userAddress).call();
    const topStakers = await contract.methods.getTopStakers().call();
    const topEarners = await contract.methods.getTopEarners().call();

    // Global stats
    document.getElementById("totalStaked").innerText = formatBNB(global._totalStaked);
    document.getElementById("treasury").innerText = formatBNB(global._totalTreasury);
    document.getElementById("dividendPool").innerText = formatBNB(global._totalDividendsDistributed);
    document.getElementById("totalRewards").innerText = formatBNB(global._totalDividendsDistributed);
    document.getElementById("totalUsers").innerText = global._activeStakers;
    document.getElementById("nextReward").innerText = formatTime(global._timeUntilNextDistribution);

    // User stats
    document.getElementById("myStake").innerText = formatBNB(user.stakedAmount);
    document.getElementById("myRewards").innerText = formatBNB(user.pendingRewards);
    document.getElementById("dailyEstimate").innerText = formatBNB(user.dailyEstimate);

    // Rankings
    renderRanking(topStakers, "topStakers", "stake");
    renderRanking(topEarners, "topEarners", "rewards");

  } catch (error) {
    console.error("Error cargando estadísticas:", error);
  } finally {
    setLoading(false);
  }
}

function renderRanking(list, elementId, type) {
  const container = document.getElementById(elementId);
  container.innerHTML = "";

  list.forEach((address, index) => {
    const li = document.createElement("li");
    li.textContent = `#${index + 1} ${shortenAddress(address)}`;
    container.appendChild(li);
  });

  if (list.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No hay datos disponibles.";
    container.appendChild(li);
  }
}

function setLoading(state) {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = state ? "block" : "none";
}

async function stake() {
  const input = document.getElementById("stakeAmount");
  const amount = input.value;

  if (!amount || Number(amount) <= 0) return alert("Cantidad inválida.");

  try {
    input.disabled = true;
    await contract.methods.stake().send({
      from: userAddress,
      value: web3.utils.toWei(amount, "ether"),
    });
    alert("Stake exitoso.");
    input.value = "";
    await loadStats();
  } catch (error) {
    alert("Error al hacer stake: " + error.message);
  } finally {
    input.disabled = false;
  }
}

async function withdrawPartial() {
  const input = document.getElementById("withdrawAmount");
  const amount = input.value;

  if (!amount || Number(amount) <= 0) return alert("Cantidad inválida.");

  try {
    input.disabled = true;
    await contract.methods.withdrawPartialStake(web3.utils.toWei(amount, "ether")).send({
      from: userAddress,
    });
    alert("Retiro parcial exitoso.");
    input.value = "";
    await loadStats();
  } catch (error) {
    alert("Error al retirar: " + error.message);
  } finally {
    input.disabled = false;
  }
}

async function withdrawAll() {
  try {
    await contract.methods.withdrawStake().send({ from: userAddress });
    alert("Retiro total exitoso.");
    await loadStats();
  } catch (error) {
    alert("Error al retirar todo: " + error.message);
  }
}

async function claimRewards() {
  try {
    await contract.methods.withdrawRewards().send({ from: userAddress });
    alert("Recompensas reclamadas.");
    await loadStats();
  } catch (error) {
    alert("Error al reclamar recompensas: " + error.message);
  }
}
