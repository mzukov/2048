const tbody = document.querySelector('#scoreTable tbody');
const data = JSON.parse(localStorage.getItem('scores') || '[]')
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

data.forEach((row, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i + 1}</td><td>${row.name}</td><td>${row.score}</td>`;
    tbody.appendChild(tr);
});

document.getElementById('playAgain').addEventListener('click', () => {
    window.location.href = 'index.html';
});
