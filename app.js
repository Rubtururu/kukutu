// app.js

const CONTRACT_ADDRESS = "0x4f395877f7f82b5012F9d4aD092249444A93258e";

// ABI del contrato (simplificada, debes reemplazar con la ABI completa)
const ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"totalAmount","type":"uint256"}],"name":"DividendsDistributed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"activeStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"distributeDividends","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getGlobalStats","outputs":[{"internalType":"uint256","name":"_totalStaked","type":"uint256"},{"internalType":"uint256","name":"_totalTreasury","type":"uint256"},{"internalType":"uint256","name":"_totalDividendsDistributed","type":"uint256"},{"internalType":"uint256","name":"_totalBNBStakedHistorical","type":"uint256"},{"internalType":"uint256","name":"_dailyDividend","type":"uint256"},{"internalType":"uint256","name":"_activeStakers","type":"uint256"},{"internalType":"uint256","name":"_timeUntilNextDistribution","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopEarners","outputs":[{"internalType":"address[50]","name":"","type":"address[50]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopStakers","outputs":[{"internalType":"address[50]","name":"","type":"address[50]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"totalReceived","type":"uint256"},{"internalType":"uint256","name":"dailyEstimate","type":"uint256"},{"internalType":"uint256","name":"userShare","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakerList","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalBNBStakedHistorical","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalDividendsDistributed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"},{"internalType":"uint256","name":"totalReceived","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawPartialStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

let web3, contract, userAddress;

window.addEventListener("load", async () => {
  if (window.ethereum) {
    try {
      web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      userAddress = accounts[0];
      contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

      // Cargar datos iniciales
      await loadStats();

      // Escuchar cambio de cuenta en MetaMask
      window.ethereum.on("accountsChanged", (accounts) => {
        userAddress = accounts[0];
        loadStats();
      });

    } catch (error) {
      alert("Error al conectar MetaMask: " + error.message);
      console.error(error);
    }
  } else {
    alert("MetaMask no detectado. Por favor instala MetaMask.");
  }
});

async function loadStats() {
  try {
    // Mostrar loaders
    setLoading(true);

    // Obtener stats globales y de usuario
    const global = await contract.methods.getGlobalStats().call();
    const user = await contract.methods.getUserStats(userAddress).call();

    // Rankings
    const topStakers = await contract.methods.getTopStakers().call();
    const topEarners = await contract.methods.getTopEarners().call();

    // Mostrar estadísticas globales
    document.getElementById("totalStaked").innerText = formatBNB(global.totalStaked);
    document.getElementById("treasury").innerText = formatBNB(global.totalTreasury);
    document.getElementById("dividendPool").innerText = formatBNB(global.totalDividendPool);
    document.getElementById("totalRewards").innerText = formatBNB(global.totalRewardsDistributed);
    document.getElementById("totalUsers").innerText = global.totalUsers;

    // Mostrar estadísticas usuario
    document.getElementById("myStake").innerText = formatBNB(user.stakedAmount);
    document.getElementById("myRewards").innerText = formatBNB(user.pendingRewards);
    document.getElementById("dailyEstimate").innerText = formatBNB(user.dailyEstimate);
    document.getElementById("nextReward").innerText = formatTime(user.secondsUntilNextDistribution);

    // Renderizar rankings
    renderRanking(topStakers, "topStakers", "stake");
    renderRanking(topEarners, "topEarners", "rewards");

  } catch (error) {
    console.error("Error cargando estadísticas:", error);
    alert("Error cargando datos del contrato. Revisa consola.");
  } finally {
    setLoading(false);
  }
}

function renderRanking(list, elementId, type) {
  const ul = document.getElementById(elementId);
  ul.innerHTML = "";

  list.forEach((entry, index) => {
    let amount = "0";
    if (type === "stake") amount = formatBNB(entry.amountStaked);
    else if (type === "rewards") amount = formatBNB(entry.totalEarned);

    const addr = entry.user;
    const li = document.createElement("li");
    li.textContent = `#${index + 1} ${addr.slice(0, 6)}...${addr.slice(-4)} - ${amount} BNB`;
    ul.appendChild(li);
  });

  if (list.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No hay datos disponibles.";
    ul.appendChild(li);
  }
}

function formatBNB(value) {
  try {
    return Number(web3.utils.fromWei(value, "ether")).toFixed(4);
  } catch {
    return "0";
  }
}

function formatTime(seconds) {
  seconds = Number(seconds);
  if (isNaN(seconds) || seconds <= 0) return "-";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs}h ${mins}m ${secs}s`;
}

async function stake() {
  const input = document.getElementById("stakeAmount");
  const amount = input.value;

  if (!amount || Number(amount) <= 0) {
    alert("Ingresa una cantidad válida para depositar.");
    return;
  }

  try {
    input.disabled = true;
    await contract.methods.stake().send({
      from: userAddress,
      value: web3.utils.toWei(amount, "ether"),
    });
    alert("Stake realizado con éxito.");
    input.value = "";
    loadStats();
  } catch (error) {
    alert("Error al hacer stake: " + error.message);
    console.error(error);
  } finally {
    input.disabled = false;
  }
}

async function withdraw() {
  const input = document.getElementById("withdrawAmount");
  const amount = input.value;

  if (!amount || Number(amount) <= 0) {
    alert("Ingresa una cantidad válida para retirar.");
    return;
  }

  try {
    input.disabled = true;
    await contract.methods.withdraw(web3.utils.toWei(amount, "ether")).send({
      from: userAddress,
    });
    alert("Retiro realizado con éxito.");
    input.value = "";
    loadStats();
  } catch (error) {
    alert("Error al retirar: " + error.message);
    console.error(error);
  } finally {
    input.disabled = false;
  }
}

async function claim() {
  try {
    await contract.methods.claim().send({ from: userAddress });
    alert("Dividendos reclamados con éxito.");
    loadStats();
  } catch (error) {
    alert("Error al reclamar dividendos: " + error.message);
    console.error(error);
  }
}

function setLoading(isLoading) {
  const elems = document.querySelectorAll(".card-value");
  elems.forEach(el => {
    el.style.opacity = isLoading ? "0.5" : "1";
  });
}

// Modo claro/oscuro
function toggleDarkMode() {
  document.documentElement.classList.toggle("dark");
}
