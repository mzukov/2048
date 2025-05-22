class Game2048 {
    constructor(size = 4) {
        this.size = size;
        this.score = 0;
        this.board = this._createEmptyBoard();
        this._loadState();
        if (this.board.every(row => row.every(cell => cell === 0))) {
            this._addRandomTile();
            this._addRandomTile();
        }
    }

    hasWon() {
        return this.board.some(row => row.includes(2048));
    }

    _createEmptyBoard() {
        return Array.from({length: this.size}, () => Array(this.size).fill(0));
    }

    _getEmptyCells() {
        const empty = [];
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.board[r][c] === 0) empty.push({row: r, col: c});
            }
        }
        return empty;
    }

    _addRandomTile() {
        const empty = this._getEmptyCells();
        if (!empty.length) return;
        const {row, col} = empty[Math.floor(Math.random() * empty.length)];
        this.board[row][col] = Math.random() < 0.9 ? 2 : 4;
    }

    _compress(row) {
        const filtered = row.filter(x => x !== 0);
        return filtered.concat(Array(this.size - filtered.length).fill(0));
    }

    _merge(row) {
        for (let i = 0; i < row.length - 1; i++) {
            if (row[i] && row[i] === row[i + 1]) {
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
            if (newRow.join() !== this.board[r].join()) {
                this.board[r] = newRow;
                changed = true;
            }
        }
        if (changed) this._addRandomTile();
        return changed;
    }

    moveRight() {
        this.board.forEach(row => row.reverse());
        const moved = this.moveLeft();
        this.board.forEach(row => row.reverse());
        return moved;
    }

    moveUp() {
        this._transpose();
        const moved = this.moveLeft();
        this._transpose();
        return moved;
    }

    moveDown() {
        this._transpose();
        this.board.forEach(row => row.reverse());
        const moved = this.moveLeft();
        this.board.forEach(row => row.reverse());
        this._transpose();
        return moved;
    }

    _transpose() {
        for (let r = 0; r < this.size; r++) {
            for (let c = r + 1; c < this.size; c++) {
                [this.board[r][c], this.board[c][r]] =
                    [this.board[c][r], this.board[r][c]];
            }
        }
    }

    saveState() {
        localStorage.setItem('game2048State',
            JSON.stringify({board: this.board, score: this.score}));
    }

    _loadState() {
        const state = JSON.parse(localStorage.getItem('game2048State'));
        if (state) {
            this.board = state.board;
            this.score = state.score;
        }
    }

    resetGame() {
        this.board = this._createEmptyBoard();
        this.score = 0;
        this._addRandomTile();
        this._addRandomTile();
        localStorage.removeItem('game2048State');
    }
}

class GameView {
    constructor(selector, scoreSelector) {
        this.grid = document.querySelector(selector);
        this.scoreEl = document.querySelector(scoreSelector);
    }

    render(board, score) {
        board.forEach((row, r) => {
            row.forEach((val, c) => {
                const cell = this.grid.querySelector(`[data-pos='${r}-${c}']`);
                cell.textContent = val === 0 ? '' : val;
                cell.className = 'cell';
                if (val) cell.classList.add(`tile-${val}`);
            });
        });
        this.scoreEl.textContent = score;
    }
}

class GameController {
    constructor() {
        this.game = new Game2048(4);
        this.view = new GameView('.grid-container', '#score');
        this.overlay = document.getElementById('overlay');
        this.msg = document.getElementById('end-message');
        this.playBtn = document.getElementById('play-again');
        this.restart = document.getElementById('restart');

        this.overlay.classList.add('hidden');
        this._bind();
        this._update();
    }

    _bind() {
        document.addEventListener('keydown', e => this._move(e.key));
        this.restart.addEventListener('click', () => {
            this.overlay.classList.add('hidden');
            this.game.resetGame();
            this._update();
        });
        this.playBtn.addEventListener('click', () => {
            this.overlay.classList.add('hidden');
            this.game.resetGame();
            this._update();
        });
    }

    _move(key) {
        const moves = {
            ArrowLeft: () => this.game.moveLeft(),
            ArrowRight: () => this.game.moveRight(),
            ArrowUp: () => this.game.moveUp(),
            ArrowDown: () => this.game.moveDown()
        };
        if (moves[key] && moves[key]()) {
            this._update();
            this.game.saveState();

            if (this.game.hasWon()) {
                this._end('You win!');
            } else if (
                this.game._getEmptyCells().length === 0 &&
                !this.game.hasWon()
            ) {
                // Game over → сразу сохраняем и редиректим
                const name = localStorage.getItem('playerName') || 'Гость';
                const scores = JSON.parse(localStorage.getItem('scores') || '[]');
                scores.push({name, score: this.game.score});
                localStorage.setItem('scores', JSON.stringify(scores));

                window.location.href = 'scores.html';
            }
        }
    }


    _update() {
        this.view.render(this.game.board, this.game.score);
    }

    _end(text) {
        this.msg.textContent = text;
        this.overlay.classList.remove('hidden');
    }
}

window.addEventListener('DOMContentLoaded', () => new GameController());
