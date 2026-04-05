const clockTime = document.getElementById('clock-time');
const clockDate = document.getElementById('clock-date');
const statusPill = document.getElementById('status-pill');
const linkInputs = document.querySelectorAll('.allowed-link');

// Load Data
chrome.storage.local.get(["allowedLinks"], (data) => {
  if (data.allowedLinks) {
    linkInputs.forEach((input, i) => input.value = data.allowedLinks[i] || "");
  }
});

// Auto-save
linkInputs.forEach(input => {
  input.addEventListener('input', () => {
    const links = Array.from(linkInputs).map(i => i.value);
    chrome.storage.local.set({ allowedLinks: links });
  });
});

// Main Loop
setInterval(() => {
  chrome.alarms.get("focusTimer", (alarm) => {
    if (!alarm) {
      const now = new Date();
      clockTime.innerText = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      clockDate.innerText = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      statusPill.innerText = "Ready";
      statusPill.className = "status-pill";
      return;
    }

    const diff = alarm.scheduledTime - Date.now();
    if (diff > 0) {
      const m = Math.floor(diff / 60000), s = Math.floor((diff % 60000) / 1000);
      clockTime.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
      clockDate.innerText = "Deep Work in Progress";
      statusPill.innerText = "Active";
      statusPill.className = "status-pill status-active";
    }
  });
}, 1000);

document.getElementById('start').onclick = () => {
  const links = Array.from(linkInputs).map(i => i.value).filter(v => v.trim());
  const mins = parseFloat(document.getElementById('minutes').value);
  chrome.storage.local.set({ isActive: true, allowedLinks: links }, () => {
    chrome.alarms.create("focusTimer", { delayInMinutes: mins });
    chrome.runtime.sendMessage({ action: "performSweep" });
  });
};

// STOP - No Password
document.getElementById('stop').onclick = () => {
  chrome.storage.local.set({ isActive: false });
  chrome.alarms.clear("focusTimer");
};