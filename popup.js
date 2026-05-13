const DEFAULT_DURATION = 150;

const dot = document.getElementById('dot');
const statusText = document.getElementById('statusText');
const countdown = document.getElementById('countdown');
const durationInput = document.getElementById('duration');
const btnMute = document.getElementById('btnMute');
const btnUnmute = document.getElementById('btnUnmute');
const presetBtns = document.querySelectorAll('.preset-btn');

let countdownInterval = null;
let activeTabId = null;

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m === 0) return `${s}s`;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

function updateMuteLabel(secs) {
  btnMute.textContent = `Mute for ${formatTime(secs)}`;
}

function setMutedUI(endTime) {
  dot.classList.add('muted');
  statusText.textContent = 'Tab is muted';
  btnUnmute.classList.add('visible');
  btnMute.disabled = true;

  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    const remaining = Math.ceil((endTime - Date.now()) / 1000);
    if (remaining <= 0) {
      clearInterval(countdownInterval);
      setUnmutedUI();
      return;
    }
    countdown.textContent = formatTime(remaining);
  }, 500);

  // run immediately
  const remaining = Math.ceil((endTime - Date.now()) / 1000);
  countdown.textContent = remaining > 0 ? formatTime(remaining) : '';
}

function setUnmutedUI() {
  clearInterval(countdownInterval);
  dot.classList.remove('muted');
  statusText.textContent = 'Tab is active';
  countdown.textContent = '';
  btnUnmute.classList.remove('visible');
  btnMute.disabled = false;
}

function syncPresetHighlight(val) {
  presetBtns.forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.s, 10) === val);
  });
}

// --- init ---
chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  if (!tab) return;
  activeTabId = tab.id;

  chrome.runtime.sendMessage({ type: 'GET_STATE', tabId: tab.id }, (res) => {
    if (res?.endTime && res.endTime > Date.now()) {
      setMutedUI(res.endTime);
    } else {
      setUnmutedUI();
    }
  });
});

// --- preset buttons ---
presetBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const secs = parseInt(btn.dataset.s, 10);
    durationInput.value = secs;
    syncPresetHighlight(secs);
    updateMuteLabel(secs);
  });
});

// --- custom input ---
durationInput.addEventListener('input', () => {
  const val = parseInt(durationInput.value, 10) || DEFAULT_DURATION;
  syncPresetHighlight(val);
  updateMuteLabel(val);
});

// --- mute ---
btnMute.addEventListener('click', () => {
  if (activeTabId == null) return;
  const duration = Math.max(1, parseInt(durationInput.value, 10) || DEFAULT_DURATION);
  chrome.runtime.sendMessage(
    { type: 'MUTE_TAB', tabId: activeTabId, duration },
    (res) => { if (res?.endTime) setMutedUI(res.endTime); }
  );
});

// --- unmute ---
btnUnmute.addEventListener('click', () => {
  if (activeTabId == null) return;
  chrome.runtime.sendMessage({ type: 'UNMUTE_TAB', tabId: activeTabId }, () => {
    setUnmutedUI();
  });
});

// init label
updateMuteLabel(DEFAULT_DURATION);
