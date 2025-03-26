const UPGRADES = {
    click: [
        { id: 'click1', name: 'Better Clicking', baseCost: 10, power: 1 },
        { id: 'click2', name: 'Double Click', baseCost: 50, power: 2 },
        { id: 'click3', name: 'Triple Click', baseCost: 200, power: 3 },
        { id: 'click4', name: 'Mega Click', baseCost: 1000, power: 5 },
        { id: 'click5', name: 'Ultra Click', baseCost: 5000, power: 10 },
        { id: 'click6', name: 'Master Click', baseCost: 20000, power: 20 }
    ],
    auto: [
        { id: 'auto1', name: 'Auto Clicker', baseCost: 50, power: 1 },
        { id: 'auto2', name: 'Cookie Helper', baseCost: 200, power: 2 },
        { id: 'auto3', name: 'Cookie Factory', baseCost: 1000, power: 5 },
        { id: 'auto4', name: 'Cookie Bank', baseCost: 5000, power: 10 },
        { id: 'auto5', name: 'Cookie Empire', baseCost: 20000, power: 20 },
        { id: 'auto6', name: 'Cookie Universe', baseCost: 100000, power: 50 }
    ],
    special: [
        { id: 'special1', name: 'Golden Touch', baseCost: 1000, multiplier: 1.5 },
        { id: 'special2', name: 'Cookie Rain', baseCost: 5000, multiplier: 2 },
        { id: 'special3', name: 'Cookie Storm', baseCost: 20000, multiplier: 3 },
        { id: 'special4', name: 'Cookie Magic', baseCost: 100000, multiplier: 5 },
        { id: 'special5', name: 'Cookie Time', baseCost: 500000, multiplier: 10 },
        { id: 'special6', name: 'Cookie Space', baseCost: 2000000, multiplier: 20 }
    ]
};

let playerUpgrades = {};
let globalMultiplier = 1;

let cookies = 0;
let clickPower = 1;
let autoClickerCount = 0;
let clickUpgradeCost = 10;
let autoClickerCost = 50;

let menuData = null;

// Fetch menu configuration
fetch('menus.json')
    .then(response => response.json())
    .then(data => {
        menuData = data;
        setupMenus();
    });

const cookieElement = document.getElementById('cookie');
const cookieCountElement = document.getElementById('cookie-count');
const perClickElement = document.getElementById('per-click');
const perSecondElement = document.getElementById('per-second');
const clickUpgradeButton = document.getElementById('click-upgrade');
const autoClickButton = document.getElementById('auto-click');
const clickCostElement = document.getElementById('click-cost');
const autoCostElement = document.getElementById('auto-cost');

function updateDisplay() {
    cookieCountElement.textContent = Math.floor(cookies);
    perClickElement.textContent = clickPower;
    perSecondElement.textContent = autoClickerCount;
    
    clickUpgradeButton.disabled = cookies < clickUpgradeCost;
    autoClickButton.disabled = cookies < autoClickerCost;
    updateAllUpgrades();
}

function addCookie(event) {
    let amount = clickPower * globalMultiplier;
    cookies += amount;
    updateDisplay();
    
    cookieElement.classList.add('clicked');
    createParticles(event);
    setTimeout(() => cookieElement.classList.remove('clicked'), 100);
}

function createParticles(e) {
    const particles = document.getElementById('particles');
    for(let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.innerHTML = '✨';
        
        const x = e.clientX;
        const y = e.clientY;
        const destinationX = x + (Math.random() - 0.5) * 100;
        const destinationY = y + (Math.random() - 0.5) * 100;
        
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particles.appendChild(particle);
        
        requestAnimationFrame(() => {
            particle.style.transform = `translate(${destinationX - x}px, ${destinationY - y}px)`;
            particle.style.opacity = '0';
            setTimeout(() => particles.removeChild(particle), 1000);
        });
    }
}

function buyClickUpgrade() {
    if (cookies >= clickUpgradeCost) {
        cookies -= clickUpgradeCost;
        clickPower += 1;
        clickUpgradeCost = Math.round(clickUpgradeCost * 1.5);
        clickCostElement.textContent = clickUpgradeCost;
        updateDisplay();
    }
}

function buyAutoClicker() {
    if (cookies >= autoClickerCost) {
        cookies -= autoClickerCost;
        autoClickerCount += 1;
        autoClickerCost = Math.round(autoClickerCost * 1.5);
        autoCostElement.textContent = autoClickerCost;
        updateDisplay();
    }
}

cookieElement.addEventListener('click', addCookie);
clickUpgradeButton.addEventListener('click', buyClickUpgrade);
autoClickButton.addEventListener('click', buyAutoClicker);

// Auto clicker loop
setInterval(() => {
    cookies += autoClickerCount;
    updateDisplay();
}, 1000);

// Initial display update
updateDisplay();

function setupMenus() {
    const gameMenu = document.getElementById('game-menu');
    const viewMenu = document.getElementById('view-menu');
    const upgradesPanel = document.getElementById('upgrades-panel');

    gameMenu.addEventListener('click', () => toggleMenu('game'));
    viewMenu.addEventListener('click', () => toggleMenu('view'));

    document.querySelector('.close-btn').addEventListener('click', () => {
        upgradesPanel.classList.remove('visible');
    });
}

function toggleMenu(menuId) {
    const menu = menuData.mainMenu.find(m => m.label.toLowerCase() === menuId);
    if (!menu) return;

    // Remove any existing menu
    const existingMenu = document.querySelector('.dropdown-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }

    // Create and show new menu
    const menuElement = document.createElement('div');
    menuElement.className = 'dropdown-menu';
    
    menu.items.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'dropdown-item';
        menuItem.textContent = item.label;
        menuItem.addEventListener('click', () => {
            handleMenuAction(item.id);
            menuElement.remove();
        });
        menuElement.appendChild(menuItem);
    });

    const menuButton = document.getElementById(`${menuId}-menu`);
    menuButton.appendChild(menuElement);

    // Close menu when clicking outside
    const closeMenu = (e) => {
        if (!menuElement.contains(e.target) && !menuButton.contains(e.target)) {
            menuElement.remove();
            document.removeEventListener('click', closeMenu);
        }
    };
    
    // Delay adding click listener to prevent immediate closure
    setTimeout(() => {
        document.addEventListener('click', closeMenu);
    }, 0);
}

function handleMenuAction(actionId) {
    switch(actionId) {
        case 'toggleUpgrades':
            document.getElementById('upgrades-panel').classList.toggle('visible');
            break;
        case 'save':
            saveGame();
            break;
        case 'load':
            loadGame();
            break;
        case 'reset':
            resetGame();
            break;
    }
}

function saveGame() {
    const gameData = {
        cookies,
        clickPower,
        autoClickerCount,
        clickUpgradeCost,
        autoClickerCost,
        playerUpgrades,
        globalMultiplier
    };
    localStorage.setItem('cookieGame', JSON.stringify(gameData));
}

function loadGame() {
    const savedData = localStorage.getItem('cookieGame');
    if (savedData) {
        const gameData = JSON.parse(savedData);
        cookies = gameData.cookies;
        clickPower = gameData.clickPower;
        autoClickerCount = gameData.autoClickerCount;
        clickUpgradeCost = gameData.clickUpgradeCost;
        autoClickerCost = gameData.autoClickerCost;
        playerUpgrades = gameData.playerUpgrades || {};
        globalMultiplier = gameData.globalMultiplier || 1;
        updateDisplay();
        updateAllUpgrades();
    }
}

function resetGame() {
    if (confirm('Are you sure you want to reset the game?')) {
        cookies = 0;
        clickPower = 1;
        autoClickerCount = 0;
        clickUpgradeCost = 10;
        autoClickerCost = 50;
        globalMultiplier = 1;
        playerUpgrades = {};
        initializeUpgrades();
        updateDisplay();
        localStorage.removeItem('cookieGame');
    }
}

function initializeUpgrades() {
    const upgradeList = document.getElementById('upgrade-list');
    Object.keys(UPGRADES).forEach(category => {
        UPGRADES[category].forEach(upgrade => {
            playerUpgrades[upgrade.id] = { level: 0, cost: upgrade.baseCost };
            const upgradeElement = createUpgradeElement(upgrade, category);
            upgradeList.appendChild(upgradeElement);
        });
    });
}

function createUpgradeElement(upgrade, category) {
    const div = document.createElement('div');
    div.className = `upgrade-item ${category}`;
    div.innerHTML = `
        <button id="${upgrade.id}" class="upgrade-btn">
            ${upgrade.name} (Level: <span class="level">0</span>)<br>
            Cost: <span class="cost">${upgrade.baseCost}</span>
        </button>
    `;
    div.querySelector('button').addEventListener('click', () => buyUpgrade(upgrade, category));
    return div;
}

function buyUpgrade(upgrade, category) {
    const playerUpgrade = playerUpgrades[upgrade.id];
    if (cookies >= playerUpgrade.cost) {
        cookies -= playerUpgrade.cost;
        playerUpgrade.level++;
        playerUpgrade.cost = Math.round(upgrade.baseCost * Math.pow(1.5, playerUpgrade.level));
        
        switch(category) {
            case 'click':
                clickPower += upgrade.power;
                break;
            case 'auto':
                autoClickerCount += upgrade.power;
                break;
            case 'special':
                globalMultiplier += (upgrade.multiplier - 1) * 0.1;
                break;
        }
        
        updateUpgradeDisplay(upgrade.id, playerUpgrade);
        updateDisplay();
    }
}

function updateUpgradeDisplay(id, upgrade) {
    const button = document.getElementById(id);
    if (button) {
        button.querySelector('.level').textContent = upgrade.level;
        button.querySelector('.cost').textContent = upgrade.cost;
        
        // Update button state
        button.disabled = cookies < upgrade.cost;
        button.closest('.upgrade-item').classList.toggle('available', cookies >= upgrade.cost);
    }
}

function updateAllUpgrades() {
    Object.entries(playerUpgrades).forEach(([id, upgrade]) => {
        updateUpgradeDisplay(id, upgrade);
    });
}

document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const category = btn.dataset.category;
        document.querySelectorAll('.upgrade-item').forEach(item => {
            item.style.display = item.classList.contains(category) ? 'block' : 'none';
        });
    });
});

// Initialize upgrades immediately after DOM content loads
document.addEventListener('DOMContentLoaded', () => {
    initializeUpgrades();
    showCategory('click'); // Show click upgrades by default
    loadGame(); // Load saved game if exists
});

function showCategory(category) {
    document.querySelectorAll('.upgrade-item').forEach(item => {
        item.style.display = item.classList.contains(category) ? 'block' : 'none';
    });
}
