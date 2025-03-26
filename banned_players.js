const bannedPlayers = [
    // Example banned player format:
    // {
    //     username: "player1",
    //     reason: "Cheating",
    //     timestamp: 1234567890,
    //     expires: null  // null means permanent ban
    // }
];

function addBan(banData) {
    bannedPlayers.push(banData);
    saveBans();
}

function removeBan(username) {
    const index = bannedPlayers.findIndex(ban => ban.username === username);
    if (index !== -1) {
        bannedPlayers.splice(index, 1);
        saveBans();
    }
}

function saveBans() {
    // In a real application, this would save to a database
    // For this example, we'll save to localStorage
    localStorage.setItem('bannedPlayers', JSON.stringify(bannedPlayers));
}

function loadBans() {
    const saved = localStorage.getItem('bannedPlayers');
    if (saved) {
        bannedPlayers.length = 0;
        bannedPlayers.push(...JSON.parse(saved));
    }
}

// Initialize bans
loadBans();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        bannedPlayers,
        addBan,
        removeBan
    };
}
