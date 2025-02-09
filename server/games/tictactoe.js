class tictactoe {
    constructor(){
        this.turn = 1;
        this.board = [
            ['.','.','.'],
            ['.','.','.'],
            ['.','.','.']
        ]
    }

    reset(){
        this.turn = 1;
        this.board = [
            ['.','.','.'],
            ['.','.','.'],
            ['.','.','.']
        ]
    }

    getBoard(){
        return this.board;
    }

    isTie(){
        if(isWin()) return false;
        var f = false;
        for(var i=0;i<3;i++){
            for(var j=0;j<3;j++){
                f |= this.board[i][j] == '.';
            }
        }
        return !f;
    }

    isWin(){
        const lines = [
            [[0,0],[0,1],[0,2]],
            [[1,0],[1,1],[1,2]],
            [[2,0],[2,1],[2,2]],
            [[0,0],[1,0],[2,0]],
            [[0,1],[1,1],[2,1]],
            [[0,2],[1,2],[2,2]],
            [[0,0],[1,1],[2,2]],
            [[2,0],[1,1],[0,2]],
        ];

        for(const line of lines){
            var res = checkLine(line[0], line[1], line[2]);
            if(res != 0) return res;
        }

        return 0;
    }

    switchTurn(){
        this.turn = 3 - this.turn;
    }

    playersMark(){
        return 'OX'[this.turn-1];
    }

    checkLine(pos, pos2, pos3){
        if(this.board[pos[0]][pos[1]] != this.board[pos2[0]][pos2[1]]) return 0;
        if(this.board[pos[0]][pos[1]] != this.board[pos3[0]][pos3[1]]) return 0;
        if(this.board[pos[0]][pos[1]] == '.') return 0;
        if(this.board[pos[0]][pos[1]] == 'O') return 1;
        if(this.board[pos[0]][pos[1]] == 'X') return 2;   
    }

    // Returns following:
    // 0 - successful move
    // 1 - opposite player's turn
    // 2 - field is occupied
    // 3 - player1 won
    // 4 - player2 won
    // 5 - draw
    attemptMove(pos, player){
        if(player != this.turn) return 1;
        if(this.board[pos[0]][pos[1]] != '.') return 2;
        this.board[pos[0]][pos[1]] = this.playersMark();
        if(this.isTie()) return 5;
        if(this.isWin()) return 3 + this.turn - 1;
        this.switchTurn();
        return 0;
    }
}