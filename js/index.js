document.getElementById('startBtn').addEventListener('click', () => {
    const nameInput = document.getElementById('name');
    const name = nameInput.value.trim();
    if (!name) return nameInput.focus();

    localStorage.setItem('playerName', name);
    localStorage.removeItem('game2048State');
    window.location.href = 'game.html';
});
