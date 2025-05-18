const web3 = new Web3(window.ethereum);
const contractAddress = "0x4f395877f7f82b5012F9d4aD092249444A93258e";
const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"totalAmount","type":"uint256"}],"name":"DividendsDistributed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"activeStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"distributeDividends","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getGlobalStats","outputs":[{"internalType":"uint256","name":"_totalStaked","type":"uint256"},{"internalType":"uint256","name":"_totalTreasury","type":"uint256"},{"internalType":"uint256","name":"_totalDividendsDistributed","type":"uint256"},{"internalType":"uint256","name":"_totalBNBStakedHistorical","type":"uint256"},{"internalType":"uint256","name":"_dailyDividend","type":"uint256"},{"internalType":"uint256","name":"_activeStakers","type":"uint256"},{"internalType":"uint256","name":"_timeUntilNextDistribution","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopEarners","outputs":[{"internalType":"address[50]","name":"","type":"address[50]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopStakers","outputs":[{"internalType":"address[50]","name":"","type":"address[50]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"totalReceived","type":"uint256"},{"internalType":"uint256","name":"dailyEstimate","type":"uint256"},{"internalType":"uint256","name":"userShare","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakerList","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalBNBStakedHistorical","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalDividendsDistributed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"},{"internalType":"uint256","name":"totalReceived","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawPartialStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];
const contract = new web3.eth.Contract(abi, contractAddress);

async function connectWallet() {
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    window.userAddress = accounts[0];
    document.getElementById("wallet-address").textContent = window.userAddress;
    await loadStats();
    await loadUserStats();
    await loadTopLists();
    await drawDividendChart();
    await loadCountdown();
  } catch (error) {
    console.error("Wallet connection failed:", error);
  }
}

async function loadStats() {
  try {
    const totalStaked = await contract.methods.totalStaked().call();
    const totalTreasury = await contract.methods.totalTreasury().call();
    const totalDividend = await contract.methods.getTotalDailyDividend().call();
    const users = await contract.methods.getStakingUsersCount().call();

    document.getElementById("total-staked").textContent = web3.utils.fromWei(totalStaked) + " BNB";
    document.getElementById("total-treasury").textContent = web3.utils.fromWei(totalTreasury) + " BNB";
    document.getElementById("total-dividends").textContent = web3.utils.fromWei(totalDividend) + " BNB";
    document.getElementById("total-users").textContent = users;
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}

async function loadUserStats() {
  try {
    const userStake = await contract.methods.stakedAmount(window.userAddress).call();
    const userShare = await contract.methods.getUserShare(window.userAddress).call();
    const userPending = await contract.methods.getPendingRewards(window.userAddress).call();
    const dailyEstimate = await contract.methods.getUserDailyDividendEstimate(window.userAddress).call();

    document.getElementById("user-staked").textContent = web3.utils.fromWei(userStake) + " BNB";
    document.getElementById("user-share").textContent = userShare + " %";
    document.getElementById("user-rewards").textContent = web3.utils.fromWei(userPending) + " BNB";
    document.getElementById("user-daily").textContent = web3.utils.fromWei(dailyEstimate) + " BNB";
  } catch (error) {
    console.error("Error loading user stats:", error);
  }
}

async function stakeBNB() {
  const amount = document.getElementById("stake-amount").value;
  if (!amount || isNaN(amount)) return alert("Invalid amount");
  try {
    await contract.methods.stake().send({ from: window.userAddress, value: web3.utils.toWei(amount) });
    await loadStats();
    await loadUserStats();
    await loadCountdown();
  } catch (error) {
    console.error("Staking failed:", error);
  }
}

async function withdrawAll() {
  try {
    await contract.methods.withdrawAll().send({ from: window.userAddress });
    await loadStats();
    await loadUserStats();
    await loadCountdown();
  } catch (error) {
    console.error("Withdraw all failed:", error);
  }
}

async function withdrawPartial() {
  const amount = document.getElementById("withdraw-amount").value;
  if (!amount || isNaN(amount)) return alert("Invalid amount");
  try {
    await contract.methods.withdrawPartial(web3.utils.toWei(amount)).send({ from: window.userAddress });
    await loadStats();
    await loadUserStats();
    await loadCountdown();
  } catch (error) {
    console.error("Partial withdrawal failed:", error);
  }
}

async function claimRewards() {
  try {
    await contract.methods.claimRewards().send({ from: window.userAddress });
    await loadStats();
    await loadUserStats();
    await loadCountdown();
  } catch (error) {
    console.error("Claim failed:", error);
  }
}

async function loadTopLists() {
  try {
    const topStakers = await contract.methods.getTopStakers().call();
    const topEarners = await contract.methods.getTopEarners().call();

    const stakersTable = document.getElementById("top-stakers");
    stakersTable.innerHTML = topStakers.map(([addr, amount], i) =>
      `<tr><td>#${i + 1}</td><td>${addr}</td><td>${web3.utils.fromWei(amount)} BNB</td></tr>`
    ).join("");

    const earnersTable = document.getElementById("top-earners");
    earnersTable.innerHTML = topEarners.map(([addr, amount], i) =>
      `<tr><td>#${i + 1}</td><td>${addr}</td><td>${web3.utils.fromWei(amount)} BNB</td></tr>`
    ).join("");
  } catch (error) {
    console.error("Error loading top lists:", error);
  }
}

async function drawDividendChart() {
  try {
    const { labels, values } = await contract.methods.getHistoricalDailyDividends().call();

    const data = {
      labels,
      datasets: [{
        label: 'BNB Dividend Pool',
        data: values.map(v => web3.utils.fromWei(v)),
        backgroundColor: 'rgba(0, 200, 255, 0.6)',
        borderColor: 'rgba(0, 200, 255, 1)',
        fill: true,
        tension: 0.4
      }]
    };

    const config = {
      type: 'line',
      data,
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };

    const ctx = document.getElementById('dividend-chart').getContext('2d');
    if (window.dividendChart) window.dividendChart.destroy();
    window.dividendChart = new Chart(ctx, config);
  } catch (error) {
    console.error("Error drawing chart:", error);
  }
}

function updateCountdown(secondsRemaining) {
  const countdownEl = document.getElementById("next-distribution");
  if (!countdownEl) return;

  function formatTime(secs) {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  countdownEl.textContent = formatTime(secondsRemaining);

  const interval = setInterval(() => {
    secondsRemaining--;
    if (secondsRemaining <= 0) {
      clearInterval(interval);
      countdownEl.textContent = "00:00:00";
      return;
    }
    countdownEl.textContent = formatTime(secondsRemaining);
  }, 1000);
}

async function loadCountdown() {
  if (!window.userAddress) return;
  try {
    const seconds = await contract.methods.getTimeUntilNextDistribution(window.userAddress).call();
    updateCountdown(parseInt(seconds));
  } catch (error) {
    console.error("Error loading countdown:", error);
  }
}

// Auto update every 30 seconds
setInterval(async () => {
  await loadStats();
  await loadUserStats();
  await loadTopLists();
  await drawDividendChart();
  await loadCountdown();
}, 30000);

// Auto connect if MetaMask already connected
window.addEventListener('load', async () => {
  if (window.ethereum && window.ethereum.selectedAddress) {
    await connectWallet();
  }
});
