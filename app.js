const contractAddress = "0x4f395877f7f82b5012F9d4aD092249444A93258e"; // reemplaza si cambia
const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"totalAmount","type":"uint256"}],"name":"DividendsDistributed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"activeStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"distributeDividends","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getGlobalStats","outputs":[{"internalType":"uint256","name":"_totalStaked","type":"uint256"},{"internalType":"uint256","name":"_totalTreasury","type":"uint256"},{"internalType":"uint256","name":"_totalDividendsDistributed","type":"uint256"},{"internalType":"uint256","name":"_totalBNBStakedHistorical","type":"uint256"},{"internalType":"uint256","name":"_dailyDividend","type":"uint256"},{"internalType":"uint256","name":"_activeStakers","type":"uint256"},{"internalType":"uint256","name":"_timeUntilNextDistribution","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopEarners","outputs":[{"internalType":"address[50]","name":"","type":"address[50]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTopStakers","outputs":[{"internalType":"address[50]","name":"","type":"address[50]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"totalReceived","type":"uint256"},{"internalType":"uint256","name":"dailyEstimate","type":"uint256"},{"internalType":"uint256","name":"userShare","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakerList","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalBNBStakedHistorical","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalDividendsDistributed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"},{"internalType":"uint256","name":"totalReceived","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawPartialStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];
let contract;
let accounts;

window.addEventListener('load', async () => {
  if (typeof window.ethereum !== 'undefined') {
    window.web3 = new Web3(window.ethereum);
    try {
      accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      document.getElementById('walletAddress').textContent = accounts[0];
      contract = new web3.eth.Contract(abi, contractAddress);
      loadStats();
    } catch (error) {
      console.error("User denied account access or error:", error);
    }
  } else {
    alert("MetaMask no detectado");
  }
});

document.getElementById('connectWallet').onclick = async () => {
  accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  document.getElementById('walletAddress').textContent = accounts[0];
  contract = new web3.eth.Contract(abi, contractAddress);
  loadStats();
};

async function loadStats() {
  try {
    const global = await contract.methods.getGlobalStats().call();
    const user = await contract.methods.getUserStats(accounts[0]).call();
    const topStakers = await contract.methods.getTopStakers().call();
    const topEarners = await contract.methods.getTopEarners().call();

    document.getElementById('totalStaked').textContent = web3.utils.fromWei(global.totalStaked, 'ether') + " BNB";
    document.getElementById('totalTreasury').textContent = web3.utils.fromWei(global.totalTreasury, 'ether') + " BNB";
    document.getElementById('totalDividends').textContent = web3.utils.fromWei(global.totalDividends, 'ether') + " BNB";
    document.getElementById('historicalStaked').textContent = web3.utils.fromWei(global.historicalStaked, 'ether') + " BNB";
    document.getElementById('dailyDividend').textContent = web3.utils.fromWei(global.totalDailyDividend, 'ether') + " BNB";
    document.getElementById('activeStakers').textContent = global.activeStakers;
    document.getElementById('timeUntilDistribution').textContent = formatSeconds(global.timeUntilNextDistribution);

    document.getElementById('userStake').textContent = web3.utils.fromWei(user.userStake, 'ether') + " BNB";
    document.getElementById('pendingRewards').textContent = web3.utils.fromWei(user.pendingRewards, 'ether') + " BNB";
    document.getElementById('totalReceived').textContent = web3.utils.fromWei(user.totalReceived, 'ether') + " BNB";
    document.getElementById('dailyEstimate').textContent = web3.utils.fromWei(user.dailyEstimate, 'ether') + " BNB";
    document.getElementById('userShare').textContent = (parseFloat(user.userShare) * 100).toFixed(4) + " %";

    const stakerList = document.getElementById('topStakers');
    const earnerList = document.getElementById('topEarners');
    stakerList.innerHTML = "";
    earnerList.innerHTML = "";

    topStakers.forEach(u => {
      const li = document.createElement("li");
      li.textContent = `${u.addr.slice(0, 6)}...${u.addr.slice(-4)} - ${web3.utils.fromWei(u.amount, 'ether')} BNB`;
      stakerList.appendChild(li);
    });

    topEarners.forEach(u => {
      const li = document.createElement("li");
      li.textContent = `${u.addr.slice(0, 6)}...${u.addr.slice(-4)} - ${web3.utils.fromWei(u.amount, 'ether')} BNB`;
      earnerList.appendChild(li);
    });

  } catch (err) {
    console.error("Error loading stats:", err);
  }
}

function formatSeconds(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

async function stakeBNB() {
  const amount = document.getElementById('stakeAmount').value;
  if (!amount) return alert("Introduce una cantidad");
  try {
    await contract.methods.stake().send({
      from: accounts[0],
      value: web3.utils.toWei(amount, 'ether')
    });
    loadStats();
  } catch (err) {
    console.error("Stake error:", err);
  }
}

async function withdrawAll() {
  try {
    await contract.methods.withdrawAll().send({ from: accounts[0] });
    loadStats();
  } catch (err) {
    console.error("Withdraw all error:", err);
  }
}

async function withdrawPartial() {
  const amount = document.getElementById('withdrawPartialAmount').value;
  if (!amount) return alert("Introduce una cantidad a retirar");
  try {
    await contract.methods.withdrawPartial(web3.utils.toWei(amount, 'ether')).send({ from: accounts[0] });
    loadStats();
  } catch (err) {
    console.error("Withdraw partial error:", err);
  }
}

async function claimRewards() {
  try {
    await contract.methods.claimRewards().send({ from: accounts[0] });
    loadStats();
  } catch (err) {
    console.error("Claim rewards error:", err);
  }
}

async function distributeDividends() {
  try {
    await contract.methods.distributeDividends().send({ from: accounts[0] });
    loadStats();
  } catch (err) {
    console.error("Distribute error:", err);
  }
}
