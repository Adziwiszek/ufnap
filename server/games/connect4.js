class Connect4 {
    constructor() {
        this.turn = 1;
        this.board = [];
        this.reset();
    }

    reset() {
        this.turn = 1;
        this.board = [];

        for (let i = 0; i < 6; i++) {
            this.board[i] = [];
            for (let j = 0; j < 7; j++) {
                this.board[i][j] = '.';
            }
        }
    }

    getBoard() {
        return this.board;
    }

    isTie() {
        if (this.isWin()) return false;
        for (let j = 0; j < 7; j++) {
            if (this.board[0][j] === '.') return false; // If there's an empty space in the top row, it's not a tie
        }
        return true;
    }

    isWin() {
        // Check all directions
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 7; j++) {
                const player = this.board[i][j];
                if (player === '.') continue;

                // Check horizontal
                if (j + 3 < 7 && this.checkLine(player, [i, j], [i, j + 1], [i, j + 2], [i, j + 3])) return player === 'O' ? 1 : 2;

                // Check vertical
                if (i + 3 < 6 && this.checkLine(player, [i, j], [i + 1, j], [i + 2, j], [i + 3, j])) return player === 'O' ? 1 : 2;

                // Check diagonal down-right
                if (i + 3 < 6 && j + 3 < 7 && this.checkLine(player, [i, j], [i + 1, j + 1], [i + 2, j + 2], [i + 3, j + 3])) return player === 'O' ? 1 : 2;

                // Check diagonal down-left
                if (i + 3 < 6 && j - 3 >= 0 && this.checkLine(player, [i, j], [i + 1, j - 1], [i + 2, j - 2], [i + 3, j - 3])) return player === 'O' ? 1 : 2;
            }
        }
        return 0;
    }

    switchTurn() {
        this.turn = 3 - this.turn;
    }

    playersMark() {
        return 'OX'[this.turn - 1];
    }

    checkLine(player, pos1, pos2, pos3, pos4) {
        return this.board[pos1[0]][pos1[1]] === player &&
               this.board[pos2[0]][pos2[1]] === player &&
               this.board[pos3[0]][pos3[1]] === player &&
               this.board[pos4[0]][pos4[1]] === player;
    }

    // Returns:
    // 0 - successful move
    // 1 - opposite player's turn
    // 2 - column is full
    // 3 - player1 won
    // 4 - player2 won
    // 5 - draw
    attemptMove(column, player) {
        if (player !== this.turn) return 1;

        // Find lowest available row in the column
        let row = -1;
        for (let i = 5; i >= 0; i--) {
            if (this.board[i][column] === '.') {
                row = i;
                break;
            }
        }

        if (row === -1) return 2; // Column is full

        this.board[row][column] = this.playersMark();
        if (this.isWin()) return 3 + this.turn - 1;
        if (this.isTie()) return 5;
        
        this.switchTurn();
        return 0;
    }
}
