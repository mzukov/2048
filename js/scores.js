import { API_BASE_URL } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.querySelector('#scoreTable tbody');
    const playAgainButton = document.getElementById('playAgain');

    async function fetchAndDisplayScores() {
        try {
            const response = await fetch(`${API_BASE_URL}/scores/`); 
            
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            
            const scores = await response.json();

            const topScores = scores.sort((a, b) => b.score - a.score).slice(0, 10);

            tbody.innerHTML = '';

            topScores.forEach((row, i) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${i + 1}</td><td>${row.name}</td><td>${row.score}</td>`;
                tbody.appendChild(tr);
            });

        } catch (error) {
            console.error('Ошибка при загрузке счетов:', error);
            tbody.innerHTML = '<tr><td colspan="3">Не удалось загрузить результаты. Пожалуйста, попробуйте позже.</td></tr>';
        }
    }

    await fetchAndDisplayScores();

    if (playAgainButton) {
        playAgainButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
});