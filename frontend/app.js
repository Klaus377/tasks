// === ВСТАВЬ СЮДА АДРЕС СВОЕГО КОНТРАКТА ===
const CONTRACT_ADDRESS = "0xFCC54fa05bdA0A9E560c40F3cE894cf2A52c3AdD";

const ABI = [
  "function createTask(string) public",
  "function toggleCompleted(uint) public",
  "function getTaskCount() view returns (uint)",
  "function getTask(uint) view returns (string, bool)",
  "event TaskCreated(uint indexed taskId, string content)",
  "event TaskCompleted(uint indexed taskId, bool completed)"
];

let provider, signer, contract, account;

const connectBtn = document.getElementById("connectBtn");
const accountEl = document.getElementById("account");
const newTaskInput = document.getElementById("newTaskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");

connectBtn.onclick = async () => {
  if (!window.ethereum) {
    alert("Установите MetaMask!");
    return;
  }

  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    account = await signer.getAddress();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    accountEl.textContent = `Подключено: ${account.slice(0,6)}...${account.slice(-4)}`;
    connectBtn.style.display = "none";
    loadTasks();
  } catch (err) {
    alert("Ошибка подключения: " + err.message);
  }
};

async function loadTasks() {
  if (!contract) return;

  const count = await contract.getTaskCount();
  taskCount.textContent = count;
  taskList.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const [content, completed] = await contract.getTask(i);

    const li = document.createElement("li");
    li.className = "task-item" + (completed ? " completed" : "");

    li.innerHTML = `
      <input type="checkbox" ${completed ? "checked" : ""} onchange="toggleTask(${i})">
      <span>${content}</span>
    `;

    taskList.appendChild(li);
  }
}

async function toggleTask(id) {
  if (!contract) return alert("Подключите кошелёк!");

  try {
    const tx = await contract.toggleCompleted(id);
    await tx.wait();
    loadTasks();
  } catch (err) {
    alert("Ошибка: " + err.message);
    loadTasks(); // обновим, если что-то пошло не так
  }
}

addBtn.onclick = async () => {
  if (!contract) return alert("Сначала подключите MetaMask!");

  const content = newTaskInput.value.trim();
  if (!content) return alert("Введите текст задачи!");

  try {
    const tx = await contract.createTask(content);
    await tx.wait();
    newTaskInput.value = "";
    loadTasks();
  } catch (err) {
    alert("Ошибка добавления: " + err.message);
  }
};

// Автозагрузка, если уже подключены
if (window.ethereum?.selectedAddress) {
  connectBtn.click();
}