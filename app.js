let web3;
let contract;
let userAddress;

const contractAddress = "0x4f395877f7f82b5012F9d4aD092249444A93258e"; // Pega aquí tu dirección del contrato
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"totalAmount","type":"uint256"}],"name":"DividendsDistributed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"activeStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"distributeDividends","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getGlobalStats","outputs":[{"internalType":"uint256","name":"_totalStaked","type":"uint256"},{"internalType":"uint256","name":"_totalTreasury","type":"uint256"},{"internalType":"uint256","name":"_totalDividendsDistributed","type":"uint256"},{"internalType":"uint256","name":"_totalBNBStakedHistorical","type":"uint256"},{"internalType":"uint256","name":"_dailyDividend","type":"uint256"},{"internalType":"uint256","name":"_activeStakers","type":"uint256"},{"internalType":"uint256","name":"_timeUntilNextDistribution","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopEarners","outputs":[{"internalType":"address[50]","name":"","type":"address[50]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopStakers","outputs":[{"internalType":"address[50]","name":"","type":"address[50]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"totalReceived","type":"uint256"},{"internalType":"uint256","name":"dailyEstimate","type":"uint256"},{"internalType":"uint256","name":"userShare","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakerList","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalBNBStakedHistorical","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalDividendsDistributed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"},{"internalType":"uint256","name":"totalReceived","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawPartialStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}] // Pega aquí tu ABI completo

window.addEventListener("load", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(contractABI, contractAddress);

    document.getElementById("connectWallet").onclick = connectWallet;

    await loadGlobalStats();
    await loadRankings();
  } else {
    alert("Instala MetaMask para usar esta dApp.");
  }
});

async function connectWallet() {
  try {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    userAddress = accounts[0];
    document.getElementById("walletAddress").innerText = userAddress;
    await loadUserStats();
  } catch (error) {
    console.error("Error al conectar wallet:", error);
  }
}

async function loadGlobalStats() {
  try {
    const stats = await contract.methods.getGlobalStats().call();

    document.getElementById("totalStaked").innerText = web3.utils.fromWei(stats.totalStaked, "ether") + " BNB";
    document.getElementById("totalTreasury").innerText = web3.utils.fromWei(stats.totalTreasury, "ether") + " BNB";
    document.getElementById("totalDividends").innerText = web3.utils.fromWei(stats.totalDividends, "ether") + " BNB";
    document.getElementById("historicalStaked").innerText = web3.utils.fromWei(stats.historicalStaked, "ether") + " BNB";
    document.getElementById("dailyDividend").innerText = web3.utils.fromWei(stats.dailyDividend, "ether") + " BNB";
    document.getElementById("activeStakers").innerText = stats.activeStakers;
    document.getElementById("timeUntilDistribution").innerText = formatSeconds(stats.timeUntilDistribution);
  } catch (error) {
    console.error("Error al cargar estadísticas globales:", error);
  }
}

async function loadUserStats() {
  try {
    const stats = await contract.methods.getUserStats(userAddress).call();

    document.getElementById("userStake").innerText = web3.utils.fromWei(stats.stakedAmount, "ether") + " BNB";
    document.getElementById("pendingRewards").innerText = web3.utils.fromWei(stats.pendingRewards, "ether") + " BNB";
    document.getElementById("totalReceived").innerText = web3.utils.fromWei(stats.totalReceived, "ether") + " BNB";
    document.getElementById("dailyEstimate").innerText = web3.utils.fromWei(stats.dailyEstimate, "ether") + " BNB";
    document.getElementById("userShare").innerText = parseFloat(stats.userShare).toFixed(4) + " %";
  } catch (error) {
    console.error("Error al cargar estadísticas del usuario:", error);
  }
}

async function loadRankings() {
  try {
    const stakers = await contract.methods.getTopStakers().call();
    const earners = await contract.methods.getTopEarners().call();

    const stakersList = document.getElementById("topStakers");
    const earnersList = document.getElementById("topEarners");

    stakersList.innerHTML = "";
    earnersList.innerHTML = "";

    stakers.forEach((entry, index) => {
      const li = document.createElement("li");
      li.textContent = `${entry.user} - ${web3.utils.fromWei(entry.amount, "ether")} BNB`;
      stakersList.appendChild(li);
    });

    earners.forEach((entry, index) => {
      const li = document.createElement("li");
      li.textContent = `${entry.user} - ${web3.utils.fromWei(entry.totalEarned, "ether")} BNB`;
      earnersList.appendChild(li);
    });
  } catch (error) {
    console.error("Error al cargar rankings:", error);
  }
}

function formatSeconds(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

// FUNCIONES DE ACCIÓN

async function stakeBNB() {
  const amount = document.getElementById("stakeAmount").value;
  if (!amount || amount <= 0) return alert("Ingresa una cantidad válida");

  try {
    await contract.methods.stake().send({
      from: userAddress,
      value: web3.utils.toWei(amount, "ether"),
    });
    await loadGlobalStats();
    await loadUserStats();
  } catch (error) {
    console.error("Error al hacer stake:", error);
  }
}

async function withdrawPartial() {
  const amount = document.getElementById("withdrawPartialAmount").value;
  if (!amount || amount <= 0) return alert("Ingresa una cantidad válida");

  try {
    await contract.methods.withdrawPartial(web3.utils.toWei(amount, "ether")).send({
      from: userAddress,
    });
    await loadGlobalStats();
    await loadUserStats();
  } catch (error) {
    console.error("Error al retirar parcialmente:", error);
  }
}

async function withdrawAll() {
  try {
    await contract.methods.withdrawAll().send({ from: userAddress });
    await loadGlobalStats();
    await loadUserStats();
  } catch (error) {
    console.error("Error al retirar todo:", error);
  }
}

async function claimRewards() {
  try {
    await contract.methods.claimRewards().send({ from: userAddress });
    await loadGlobalStats();
    await loadUserStats();
  } catch (error) {
    console.error("Error al reclamar recompensas:", error);
  }
}

async function distributeDividends() {
  try {
    await contract.methods.distributeDividends().send({ from: userAddress });
    await loadGlobalStats();
  } catch (error) {
    console.error("Error al distribuir dividendos:", error);
  }
}
