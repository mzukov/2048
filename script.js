// script.js

class Game2048 {
    constructor(size = 4) {
        this.size = size;
        this.score = 0;
        this.board = this._createEmptyBoard();
        this._addRandomTile();
        this._addRandomTile();
    }

    _createEmptyBoard() {
        return Array.from({ length: this.size }, () => Array(this.size).fill(0));
    }

    _getEmptyCells() {
        const empty = [];
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.board[r][c] === 0) empty.push({ row: r, col: c });
            }
        }
        return empty;
    }

    _addRandomTile() {
        const empty = this._getEmptyCells();
        if (empty.length === 0) return;
        const { row, col } = empty[Math.floor(Math.random() * empty.length)];
        this.board[row][col] = Math.random() < 0.9 ? 2 : 4;
    }

    _compress(row) {
        return row.filter(x => x !== 0).concat(Array(this.size - row.filter(x => x !== 0).length).fill(0));
    }

    _merge(row) {
        for (let i = 0; i < row.length - 1; i++) {
            if (row[i] !== 0 && row[i] === row[i + 1]) {
                row[i] *= 2;
                this.score += row[i];
                row[i + 1] = 0;
                i++;
            }
        }
        return row;
    }

    _operateRow(row) {
        return this._compress(this._merge(this._compress(row)));
    }

    moveLeft() {
        let changed = false;
        for (let r = 0; r < this.size; r++) {
            const newRow = this._operateRow(this.board[r]);
            if (!this._arraysEqual(this.board[r], newRow)) {
                this.board[r] = newRow;
                changed = true;
            }
        }
        if (changed) this._addRandomTile();
        return changed;
    }

    moveRight() {
        this._reverseRows();
        const changed = this.moveLeft();
        this._reverseRows();
        return changed;
    }

    moveUp() {
        this._transpose();
        const changed = this.moveLeft();
        this._transpose();
        return changed;
    }

    moveDown() {
        this._transpose();
        this._reverseRows();
        const changed = this.moveLeft();
        this._reverseRows();
        this._transpose();
        return changed;
    }

    _reverseRows() {
        this.board.forEach(row => row.reverse());
    }

    _transpose() {
        for (let r = 0; r < this.size; r++) {
            for (let c = r + 1; c < this.size; c++) {
                [this.board[r][c], this.board[c][r]] = [this.board[c][r], this.board[r][c]];
            }
        }
    }

    _arraysEqual(a, b) {
        return a.length === b.length && a.every((x, i) => x === b[i]);
    }

    isGameOver() {
        if (this._getEmptyCells().length > 0) return false;

        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size - 1; c++) {
                if (this.board[r][c] === this.board[r][c + 1]) return false;
            }
        }

        for (let c = 0; c < this.size; c++) {
            for (let r = 0; r < this.size - 1; r++) {
                if (this.board[r][c] === this.board[r + 1][c]) return false;
            }
        }

        return true;
    }
}

class GameView {
    constructor(containerSelector, scoreSelector) {
        this.gridContainer = document.querySelector(containerSelector);
        this.scoreDisplay = document.querySelector(scoreSelector);
        this.cells = [];
        this._cacheCells();
    }

    _cacheCells() {
        this.cells = Array.from(this.gridContainer.querySelectorAll(".cell"));
    }

    renderBoard(board) {
        for (let r = 0; r < board.length; r++) {
            for (let c = 0; c < board.length; c++) {
                const cell = this.gridContainer.querySelector(`[data-pos='${r}-${c}']`);
                const value = board[r][c];
                cell.textContent = value === 0 ? "" : value;
                cell.className = "cell";
                if (value !== 0) cell.classList.add(`tile-${value}`);
            }
        }
    }

    updateScore(score) {
        this.scoreDisplay.textContent = score;
    }
}

class GameController {
    constructor(size, containerSelector, scoreSelector) {
        this.game = new Game2048(size);
        this.view = new GameView(containerSelector, scoreSelector);
        this._bindEvents();
        this.render();
    }

    _bindEvents() {
        document.addEventListener("keydown", (e) => this._handleMove(e.key));
        const restartBtn = document.getElementById("restart");
        if (restartBtn) {
            restartBtn.addEventListener("click", () => this._restart());
        }
    }

    _handleMove(key) {
        const moves = {
            ArrowLeft: () => this.game.moveLeft(),
            ArrowRight: () => this.game.moveRight(),
            ArrowUp: () => this.game.moveUp(),
            ArrowDown: () => this.game.moveDown()
        };

        const moveFn = moves[key];
        if (moveFn && moveFn()) {
            this.render();
            if (this.game.isGameOver()) {
                setTimeout(() => alert("Game over!"), 100);
            }
        }
    }

    _restart() {
        this.game = new Game2048(this.game.size);
        this.render();
    }

    render() {
        this.view.renderBoard(this.game.board);
        this.view.updateScore(this.game.score);
    }
}

// Инициализация
window.addEventListener("DOMContentLoaded", () => {
    new GameController(4, ".grid-container", "#score");
});
