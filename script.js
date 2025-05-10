const SIZE = 4;
let board = [];
let score = 0;

// Получаем элементы DOM
const gridContainer = document.querySelector(".grid-container");
const scoreDisplay = document.getElementById("score");
const restartBtn = document.getElementById("restart");

const overlay = document.getElementById("overlay");
const endMessage = document.getElementById("end-message");
const playAgainBtn = document.getElementById("play-again");

playAgainBtn.addEventListener("click", () => {
    overlay.classList.add("hidden");
    startGame();
});


// Запуск игры
restartBtn.addEventListener("click", startGame);
startGame();

function startGame() {
    board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
    score = 0;
    updateScore();
    addRandomTile();
    addRandomTile();
    updateBoardView();
    overlay.classList.add("hidden");
}


function updateScore() {
    scoreDisplay.textContent = score;
}

function updateBoardView() {
    // Очистим все ячейки
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            const cell = document.querySelector(`[data-pos="${row}-${col}"]`);
            const value = board[row][col];

            cell.textContent = value === 0 ? "" : value;
            cell.className = "cell";
            if (value) cell.classList.add(`tile-${value}`);
        }
    }
}

function addRandomTile() {
    const emptyCells = [];

    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (board[row][col] === 0) {
                emptyCells.push({row, col});
            }
        }
    }

    if (emptyCells.length === 0) return;

    const {row, col} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[row][col] = Math.random() < 0.9 ? 2 : 4;
}

document.addEventListener("keydown", handleKey);

function handleKey(event) {
    let moved = false;

    switch (event.key) {
        case "ArrowLeft":
            moved = moveLeft();
            break;
        case "ArrowRight":
            moved = moveRight();
            break;
        case "ArrowUp":
            moved = moveUp();
            break;
        case "ArrowDown":
            moved = moveDown();
            break;
    }

    if (moved) {
        addRandomTile();
        updateBoardView();

        if (has2048()) {
            showEnd("You win!");
        } else if (isGameOver()) {
            showEnd("Game over!");
        }
    }

}

function moveLeft() {
    let moved = false;

    for (let row = 0; row < SIZE; row++) {
        let currentRow = board[row].filter(val => val !== 0); // убираем нули
        for (let i = 0; i < currentRow.length - 1; i++) {
            if (currentRow[i] === currentRow[i + 1]) {
                currentRow[i] *= 2;
                score += currentRow[i];
                currentRow[i + 1] = 0;
                i++; // пропускаем следующий
                moved = true;
            }
        }

        currentRow = currentRow.filter(val => val !== 0); // снова убираем нули
        while (currentRow.length < SIZE) currentRow.push(0);
        if (!arraysEqual(board[row], currentRow)) moved = true;
        board[row] = currentRow;
    }

    updateScore();
    return moved;
}

function moveRight() {
    reverseRows();
    const moved = moveLeft();
    reverseRows();
    return moved;
}

function moveUp() {
    transpose();
    const moved = moveLeft();
    transpose();
    return moved;
}

function moveDown() {
    transpose();
    reverseRows();
    const moved = moveLeft();
    reverseRows();
    transpose();
    return moved;
}

function transpose() {
    for (let row = 0; row < SIZE; row++) {
        for (let col = row + 1; col < SIZE; col++) {
            [board[row][col], board[col][row]] = [board[col][row], board[row][col]];
        }
    }
}

function isGameOver() {
    // Есть хотя бы одна пустая ячейка?
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (board[row][col] === 0) return false;

            // Можно объединить вправо?
            if (col < SIZE - 1 && board[row][col] === board[row][col + 1]) return false;

            // Можно объединить вниз?
            if (row < SIZE - 1 && board[row][col] === board[row + 1][col]) return false;
        }
    }

    // Нет пустых и нет одинаковых рядом — игра окончена
    return true;
}

if (moved) {
    addRandomTile();
    updateBoardView();

    if (isGameOver()) {
        setTimeout(() => alert("Game over!"), 100);
    }
}


function reverseRows() {
    for (let row = 0; row < SIZE; row++) {
        board[row].reverse();
    }
}


function arraysEqual(a, b) {
    return a.length === b.length && a.every((val, i) => val === b[i]);
}

function has2048() {
    return board.flat().includes(2048);
}

function showEnd(message) {
    endMessage.textContent = message;
    overlay.classList.remove("hidden");
}
