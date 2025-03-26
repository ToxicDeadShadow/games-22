let cookies = 0;
let cps = 0;
let upgrades = [];

// Load menu configuration
fetch('menus.json')
    .then(response => response.json())
    .then(data => setupMenus(data));

function setupMenus(menuData) {
    const menuDropdown = document.querySelector('.menu-dropdown');
    menuData.items.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.textContent = item.label;
        menuItem.onclick = () => handleMenuAction(item.action);
        menuDropdown.appendChild(menuItem);
    });
}

function handleMenuAction(action) {
    switch(action) {
        case 'showUpgrades':
            document.querySelector('.upgrades-panel').classList.toggle('hidden');
            break;
        case 'save':
            saveGame();
            break;
        case 'load':
            loadGame();
            break;
    }
}

document.querySelector('.menu-button').addEventListener('click', () => {
    document.querySelector('.menu-dropdown').classList.toggle('active');
});

document.getElementById('cookie-button').addEventListener('click', () => {
    cookies++;
    updateDisplay();
});

function updateDisplay() {
    document.getElementById('cookie-count').textContent = Math.floor(cookies);
    document.getElementById('cps').textContent = cps.toFixed(1);
}

function saveGame() {
    localStorage.setItem('cookieGame', JSON.stringify({
        cookies,
        cps,
        upgrades
    }));
}

function loadGame() {
    const saved = JSON.parse(localStorage.getItem('cookieGame'));
    if (saved) {
        cookies = saved.cookies;
        cps = saved.cps;
        upgrades = saved.upgrades;
        updateDisplay();
    }
}

// Auto-save every 30 seconds
setInterval(saveGame, 30000);

// Update cookies based on CPS
setInterval(() => {
    cookies += cps;
    updateDisplay();
}, 1000);
