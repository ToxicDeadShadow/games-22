const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

let cookies = 0;
let cps = 0;
let currentUser = null;

let upgrades = {
    cursor: {
        name: "Cursor",
        baseCost: 15,
        cps: 0.1,
        multiplier: 1.15,
        description: "Automatically clicks the cookie.",
        icon: "🖱️",
        owned: 0,
        cost: 15
    },
    grandma: {
        name: "Grandma",
        baseCost: 100,
        cps: 1,
        multiplier: 1.15,
        description: "A nice grandma to bake more cookies.",
        icon: "👵",
        owned: 0,
        cost: 100
    },
    farm: {
        name: "Cookie Farm",
        baseCost: 1100,
        cps: 8,
        multiplier: 1.15,
        description: "Grows cookie plants from cookie seeds.",
        icon: "🌾",
        owned: 0,
        cost: 1100
    },
    factory: {
        name: "Cookie Factory",
        baseCost: 12000,
        cps: 47,
        multiplier: 1.15,
        description: "Mass produces cookies.",
        icon: "🏭",
        owned: 0,
        cost: 12000
    },
    mine: {
        name: "Cookie Mine",
        baseCost: 130000,
        cps: 260,
        multiplier: 1.15,
        description: "Mines chocolate chips from the earth.",
        icon: "⛏️",
        owned: 0,
        cost: 130000
    },
    lab: {
        name: "Research Lab",
        baseCost: 1400000,
        cps: 1400,
        multiplier: 1.15,
        description: "Develops new cookie recipes.",
        icon: "🧪",
        owned: 0,
        cost: 1400000
    },
    portal: {
        name: "Cookie Portal",
        baseCost: 20000000,
        cps: 7800,
        multiplier: 1.15,
        description: "Opens portals to the cookie dimension.",
        icon: "🌀",
        owned: 0,
        cost: 20000000
    },
    timeMachine: {
        name: "Time Machine",
        baseCost: 123456789,
        cps: 45000,
        multiplier: 1.15,
        description: "Collects cookies from the past and future.",
        icon: "⏰",
        owned: 0,
        cost: 123456789
    }
};

async function handleLogin() {
    const username = document.getElementById('username-input').value.trim();
    if (username.length < 3) {
        alert('Username must be at least 3 characters long');
        return;
    }
    
    const banStatus = await checkBanStatus(username);
    if (banStatus.banned) {
        alert(`You are banned! Reason: ${banStatus.reason}\nExpires: ${banStatus.expires || 'Never'}`);
        return;
    }
    
    // Save username persistently
    localStorage.setItem('cookieClickerUsername', username);
    currentUser = username;
    
    hideLoginModal();
    loadGame();
}

function hideLoginModal() {
    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('login-overlay').style.display = 'none';
}

function checkExistingLogin() {
    const savedUsername = localStorage.getItem('cookieClickerUsername');
    if (savedUsername) {
        currentUser = savedUsername;
        hideLoginModal();
        loadGame();
        return true;
    }
    return false;
}

function optimizeForMobile() {
    document.body.classList.add('mobile');
    
    // Adjust for mobile touch
    const cookie = document.getElementById('cookie');
    cookie.style.touchAction = 'manipulation';
    
    // Prevent zoom on double tap
    document.documentElement.style.touchAction = 'manipulation';
    
    // Prevent pull to refresh
    document.body.style.overscrollBehavior = 'none';
    
    // Ensure proper viewport height on mobile
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    window.addEventListener('resize', () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    });
}

function saveGame() {
    if (!currentUser) return;
    localStorage.setItem(`cookieGame_${currentUser}`, JSON.stringify({
        cookies,
        upgrades,
        username: currentUser
    }));
}

function loadGame() {
    if (!currentUser) return;
    const saved = JSON.parse(localStorage.getItem(`cookieGame_${currentUser}`));
    if (saved) {
        cookies = saved.cookies;
        upgrades = saved.upgrades;
        calculateCPS();
        updateDisplay();
    }
}

function resetGame() {
    if (confirm('Are you sure you want to reset your progress?')) {
        cookies = 0;
        initGame();
    }
}

function toggleUpgrades() {
    const shop = document.querySelector('.shop');
    shop.style.display = shop.style.display === 'none' ? 'block' : 'none';
}

function toggleMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    const menu = document.getElementById('main-menu');
    menu.classList.toggle('show');
}

function toggleUpgradesWindow() {
    const window = document.getElementById('upgrades-window');
    window.classList.toggle('show');
    updateUpgradesList();
}

function updateUpgradesList() {
    const list = document.getElementById('upgrades-list');
    list.innerHTML = '';
    
    Object.entries(upgrades).forEach(([key, upgrade]) => {
        const upgradeDiv = document.createElement('div');
        upgradeDiv.className = 'upgrade';
        upgradeDiv.innerHTML = `
            <div class="upgrade-icon">${upgrade.icon}</div>
            <div class="upgrade-info">
                <div class="upgrade-name">${upgrade.name}</div>
                <div class="upgrade-description">${upgrade.description}</div>
                <div class="upgrade-stats">
                    <div>Cost: ${Math.floor(upgrade.cost)} cookies</div>
                    <div>CPS: +${upgrade.cps}</div>
                    <div>Owned: ${upgrade.owned}</div>
                </div>
            </div>
            <button onclick="buyUpgrade('${key}')"${cookies < upgrade.cost ? ' disabled' : ''}>Buy</button>
        `;
        list.appendChild(upgradeDiv);
    });
}

// Add click handler to close menu when clicking outside
document.addEventListener('click', (event) => {
    const menu = document.getElementById('main-menu');
    if (!event.target.closest('.menu-item') && !event.target.closest('.dropdown')) {
        menu.classList.remove('show');
    }
});

function updateDisplay() {
    document.getElementById('cookie-count').textContent = Math.floor(cookies);
    document.getElementById('cps').textContent = cps.toFixed(1);
    updateUpgradesList();
}

function buyUpgrade(type) {
    const upgrade = upgrades[type];
    if (cookies >= upgrade.cost) {
        cookies -= upgrade.cost;
        upgrade.owned++;
        upgrade.cost *= upgrade.multiplier;
        calculateCPS();
        updateDisplay();
    }
}

function calculateCPS() {
    cps = 0;
    for (const [key, upgrade] of Object.entries(upgrades)) {
        cps += upgrade.cps * upgrade.owned;
    }
}

document.getElementById('cookie').addEventListener('click', () => {
    cookies++;
    document.getElementById('cookie').classList.add('cookie-click');
    setTimeout(() => {
        document.getElementById('cookie').classList.remove('cookie-click');
    }, 100);
    updateDisplay();
});

setInterval(() => {
    cookies += cps / 10;
    updateDisplay();
}, 100);

function minimizeWindow() {
    // Placeholder for minimize functionality
    console.log('Minimize clicked');
}

function maximizeWindow() {
    document.documentElement.requestFullscreen().catch(err => {
        console.log('Error attempting to enable fullscreen:', err);
    });
}

function closeWindow() {
    if (confirm('Are you sure you want to close the game? Make sure to save first!')) {
        window.close();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initGame();
    
    // Only show login if no existing user found
    if (!checkExistingLogin()) {
        document.getElementById('login-modal').style.display = 'block';
        document.getElementById('login-overlay').style.display = 'block';
    }
    
    if (isMobile) {
        optimizeForMobile();
    }
    
    document.querySelector('.minimize').addEventListener('click', minimizeWindow);
    document.querySelector('.maximize').addEventListener('click', maximizeWindow);
    document.querySelector('.close').addEventListener('click', closeWindow);
});

function initGame() {
    upgrades = {
        cursor: {
            name: "Cursor",
            baseCost: 15,
            cps: 0.1,
            multiplier: 1.15,
            description: "Automatically clicks the cookie.",
            icon: "🖱️",
            owned: 0,
            cost: 15
        },
        grandma: {
            name: "Grandma",
            baseCost: 100,
            cps: 1,
            multiplier: 1.15,
            description: "A nice grandma to bake more cookies.",
            icon: "👵",
            owned: 0,
            cost: 100
        },
        farm: {
            name: "Cookie Farm",
            baseCost: 1100,
            cps: 8,
            multiplier: 1.15,
            description: "Grows cookie plants from cookie seeds.",
            icon: "🌾",
            owned: 0,
            cost: 1100
        },
        factory: {
            name: "Cookie Factory",
            baseCost: 12000,
            cps: 47,
            multiplier: 1.15,
            description: "Mass produces cookies.",
            icon: "🏭",
            owned: 0,
            cost: 12000
        },
        mine: {
            name: "Cookie Mine",
            baseCost: 130000,
            cps: 260,
            multiplier: 1.15,
            description: "Mines chocolate chips from the earth.",
            icon: "⛏️",
            owned: 0,
            cost: 130000
        },
        lab: {
            name: "Research Lab",
            baseCost: 1400000,
            cps: 1400,
            multiplier: 1.15,
            description: "Develops new cookie recipes.",
            icon: "🧪",
            owned: 0,
            cost: 1400000
        },
        portal: {
            name: "Cookie Portal",
            baseCost: 20000000,
            cps: 7800,
            multiplier: 1.15,
            description: "Opens portals to the cookie dimension.",
            icon: "🌀",
            owned: 0,
            cost: 20000000
        },
        timeMachine: {
            name: "Time Machine",
            baseCost: 123456789,
            cps: 45000,
            multiplier: 1.15,
            description: "Collects cookies from the past and future.",
            icon: "⏰",
            owned: 0,
            cost: 123456789
        }
    };
    
    updateDisplay();
    document.getElementById('upgrades-window').classList.add('show');
}

// Auto-save every 30 seconds
setInterval(saveGame, 30000);

// Add touch event support
document.getElementById('cookie').addEventListener('touchstart', (e) => {
    e.preventDefault();
    cookies++;
    document.getElementById('cookie').classList.add('cookie-click');
    setTimeout(() => {
        document.getElementById('cookie').classList.remove('cookie-click');
    }, 100);
    updateDisplay();
});

// Add admin functions
function banPlayer(username, reason, duration = null) {
    if (currentUser && isAdmin(currentUser)) {
        const banData = {
            username,
            reason,
            timestamp: Date.now(),
            expires: duration ? Date.now() + duration : null
        };
        addBan(banData);
    }
}

function isAdmin(username) {
    const admins = ['admin', 'moderator']; // Add your admin usernames here
    return admins.includes(username);
}

async function checkBanStatus(username) {
    const response = await fetch('banned_players.js');
    const bans = await response.json();
    
    const ban = bans.find(b => b.username === username);
    if (!ban) return { banned: false };
    
    if (ban.expires && Date.now() > ban.expires) {
        return { banned: false };
    }
    
    return {
        banned: true,
        reason: ban.reason,
        expires: ban.expires ? new Date(ban.expires).toLocaleString() : 'Never'
    };
}
