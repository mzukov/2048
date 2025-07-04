import {sendScore} from './api.js';

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
                [this.board[r][c], this.board[c][r]] = [this.board[c][r], this.board[r][c]];
            }
        }
    }

    _canMakeMove() {
        if (this._getEmptyCells().length > 0) {
            return true;
        }

        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size - 1; c++) {
                if (this.board[r][c] !== 0 && this.board[r][c] === this.board[r][c + 1]) {
                    return true;
                }
            }
        }

        for (let c = 0; c < this.size; c++) {
            for (let r = 0; r < this.size - 1; r++) {
                if (this.board[r][c] !== 0 && this.board[r][c] === this.board[r + 1][c]) {
                    return true;
                }
            }
        }

        return false;
    }


    saveState() {
        localStorage.setItem('game2048State', JSON.stringify({board: this.board, score: this.score}));
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
        this.scoreBtn = document.getElementById('check-score');
        this.restart = document.getElementById('restart');

        this.overlay.classList.add('hidden');
        this._bind();
        this._update();
    }

    _bindTouch() {
        let startX, startY;
        const grid = document.querySelector('.grid-container');

        grid.addEventListener('touchstart', e => {
            if (e.touches.length === 1) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }
            e.preventDefault();
        }, { passive: false });

        grid.addEventListener('touchmove', e => {
            e.preventDefault();
        }, { passive: false });

        grid.addEventListener('touchend', e => {
            if (!startX || !startY) return;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;

            const dx = endX - startX;
            const dy = endY - startY;

            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);

            let direction = null;

            if (Math.max(absDx, absDy) > 30) {
                if (absDx > absDy) {
                    direction = dx > 0 ? 'ArrowRight' : 'ArrowLeft';
                } else {
                    direction = dy > 0 ? 'ArrowDown' : 'ArrowUp';
                }

                this._move(direction);
            }

            startX = startY = null;
            e.preventDefault();
        }, { passive: false });
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

        this.scoreBtn.addEventListener('click', () => {
            this.overlay.classList.add('hidden');
            this.game.resetGame();
            this._update();
            window.location.href = 'scores.html'
        })

        this._bindTouch();
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

            const hasWon = this.game.hasWon();
            const canMakeMove = this.game._canMakeMove();

            if (hasWon) {
                this._end('Вы выиграли!');
                this._sendFinalScore();
            } else if (!canMakeMove) {
                this._end('Игра окончена!');
                this._sendFinalScore();
            }
        }
    }

    async _sendFinalScore() {
        const playerName = localStorage.getItem('playerName') || 'Гость';
        const finalScore = this.game.score;

        console.log(`Игра окончена! Имя: ${playerName}, Счет: ${finalScore}`);

        try {
            await sendScore(playerName, finalScore);
            console.log('Счет успешно отправлен на сервер.');
        } catch (error) {
            console.error('Не удалось отправить счет на сервер:', error);
            alert('Не удалось сохранить ваш счет на доске лидеров.');
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