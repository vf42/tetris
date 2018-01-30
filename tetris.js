/**
 * The Tetris logics and rendering implementation. 
 */


/*
 * Global game settings.
 */
var GAME_CFG = {
        matrixWidth: 10,
        matrixHeight: 20, // 18?
        mainBrickStyle: new GradientBrickStyle(),
        nextBrickStyle: new GradientBrickStyleTransparentBG(),
};


/**
 * Enum defining the colors of the bricks, depending on the figure.
 */
var BrickTypes = {
    N: "N", // Empty brick.
    I: "I",
    J: "J",
    L: "L",
    O: "O",
    S: "S",
    T: "T",
    Z: "Z"
};
var EMPTY = BrickTypes.N;


/**
 * Represents state and rotation of one piece brick.
 */
function Brick(pieceType, relx, rely) {
    this.type = BrickTypes[pieceType];
    this.relx = relx; // Relative to the piece.
    this.rely = rely; // Relative to the piece.
    
    // Peform a clockwise rotation against the center of the piece. 
    this.rotateR = function() {
        var newx = -this.rely;
        var newy = this.relx;
        this.relx = newx;
        this.rely = newy;
    }
    // Undo the clockwise rotation (perform the anti-clockwise rotation).
    this.rotateL = function() {
        var newx = this.rely;
        var newy = -this.relx;
        this.relx = newx;
        this.rely = newy;
    }
}


/**
 * Different tetris pieces.
 */
function Piece(x, y, bricks) {
    this.x = x;
    this.y = y;
    this.bricks = bricks;
    
    this.rotateR = function() {
        this.bricks.forEach(function(b) {b.rotateR()});
    }
    this.rotateL = function() {
        this.bricks.forEach(function(b) {b.rotateL()});
    }
}
// I-shaped piece.
function IPiece(x, y) {
    Piece.call(this, x, y, [
        new Brick("I", 0, -1),
        new Brick("I", 0,  0),
        new Brick("I", 0,  1),
        new Brick("I", 0,  2),
        ]);
}
IPiece.prototype = new Piece();
//J-shaped piece.
function JPiece(x, y) {
    Piece.call(this, x, y, [
        new Brick("J", 0, -1),
        new Brick("J", 0,  0),
        new Brick("J", 0,  1),
        new Brick("J", 1, -1),
        ]);
}
JPiece.prototype = new Piece();
// L-shaped piece.
function LPiece(x, y) {
    Piece.call(this, x, y, [
        new Brick("L", 0, -1),
        new Brick("L", 0,  0),
        new Brick("L", 0,  1),
        new Brick("L", 1,  1),
        ]);
}
LPiece.prototype = new Piece();
// O-shaped piece.
function OPiece(x, y) {
    Piece.call(this, x, y, [
        new Brick("O", 0,  0),
        new Brick("O", 1,  0),
        new Brick("O", 0,  1),
        new Brick("O", 1,  1),
        ]);
    // Don't rotate.
    this.rotateR = function() {}
    this.rotateL = function() {}
}
OPiece.prototype = new Piece();
// S-shaped piece.
function SPiece(x, y) {
    Piece.call(this, x, y, [
        new Brick("S", 0,  0),
        new Brick("S", 1,  0),
        new Brick("S",-1,  1),
        new Brick("S", 0,  1),
        ]);        
}
SPiece.prototype = new Piece();
// T-shaped piece.
function TPiece(x, y) {
    Piece.call(this, x, y, [
        new Brick("T", -1, 0),
        new Brick("T", 0, 0),
        new Brick("T", 1, 0),
        new Brick("T", 0, 1),
        ]);
}
TPiece.prototype = new Piece();
// Z-shaped piece.
function ZPiece(x, y) {
    Piece.call(this, x, y, [
        new Brick("Z",-1,  0),
        new Brick("Z", 0,  0),
        new Brick("Z", 0,  1),
        new Brick("Z", 1,  1),
        ]);
}
ZPiece.prototype = new Piece();

// Returns a random piece.
randomPiece = function() {
    var piece;
    switch (Math.floor(Math.random() * 100000) % 7) {
    case 0: piece = new IPiece(2, 2); break;
    case 1: piece = new JPiece(2, 2); break;
    case 2: piece = new LPiece(2, 2); break;
    case 3: piece = new OPiece(2, 2); break;
    case 4: piece = new SPiece(2, 2); break;
    case 5: piece = new TPiece(2, 2); break;
    case 6: piece = new ZPiece(2, 2); break;
    }
    // Random rotation.
    var rots = 2 * (piece instanceof IPiece || piece instanceof SPiece || piece instanceof ZPiece)
            + 3 * (piece instanceof LPiece || piece instanceof TPiece || piece instanceof JPiece);
    if (rots > 0) {
        var rotCount = Math.floor(Math.random() * 100000) % rots;
        for (var i = 0; i < rotCount; i++) {
            piece.rotateL();
        }
    }
    return piece;
}

/**
 * Represents the state of Tetris matrix
 */
function MatrixState(width, height) {
    this.width = width;
    this.height = height;
    this.matrix = []
    
    this.emptyRow = function() {
        var row = []
        for (var j = 0; j < this.width; j++) {
            row[j] = BrickTypes.N;
        }
        return row;
    }
    
    // Initialize the matrix with empty state.
    for (var i = 0; i < this.height; i++) {
        
        this.matrix[i] = this.emptyRow();
    }
    
    // Check if there is a free place to move a given piece by a given offset.
    this.canMove = function(piece, offset) {
        state = this;
        var canMove = true;
        piece.bricks.forEach(function(b) {
            var newx = piece.x + b.relx + offset;
            if (newx < 0 || newx >= state.width
                    || piece.y + b.rely >= state.height
                    // It is ALLOWED to be out of upper bounds.
                    || (piece.y + b.rely >= 0 && state.matrix[piece.y + b.rely][newx] != EMPTY)) {
                canMove = false;
            }
        });
        return canMove;
    }
    // Check if the piece collides with anything in its current state.
    this.checkCollision = function(piece) {
        return !this.canMove(piece, 0);
    }
    // Check if there is a space for the piece to go down.
    this.canFall = function(piece) {
        state = this;
        var canFall = true;
        piece.bricks.forEach(function(b) {
            var newy = piece.y + b.rely + 1;
            if (newy >= state.height
                    || (newy >= 0 && state.matrix[newy][piece.x + b.relx] != EMPTY)) {
                canFall = false;
            }
        });
        return canFall;
    }
    
    // Check if the piece is out of matrix horizontal bounds and return the offset value. 
    this.checkHorizontalBounds = function(piece) {
        var width = this.width;
        var offset = 0;
        piece.bricks.forEach(function(b) {
            var x = piece.x + b.relx;
            // We may safely assume that one or more bricks may get out of bounds only to the left or right,
            // not both sides of the matrix.
            if (x < 0 && x < offset) {
                offset = x;
            } else if (x >= width && x - width + 1 > offset) {
                offset = x - width + 1;
            }
            // TODO: Check also for filled bricks collision - this is also a reason to offset after rotation.
        });
        return offset;
    }
    
    // Merge the piece into the state.
    this.mergePiece = function(piece) {
        state = this;
        piece.bricks.forEach(function(b) {
            var x = piece.x + b.relx;
            var y = piece.y + b.rely;
            if (x >= 0 && x < state.width && y >= 0 && y < state.height) {
                state.matrix[y][x] = b.type;
            }
        });
    }

    // Clear the filled up lines, returning the indexes of cleared lines.
    this.clearLines = function() {
        clearedIdxs = [];
        newmatrix = [];
        //for (var i = this.height - 1; i >= 0; i--) {
        for (var i = 0; i < this.height; i++) {
            var lineSum = 0;
            this.matrix[i].forEach(function(c) {
                if (c != EMPTY) {
                    lineSum += 1;
                }
            });
            if (lineSum == this.width) {
                clearedIdxs.push(i);
            } else {
                newmatrix.push(this.matrix[i]);
            }
        }
        // Create new empty rows at the top.
        for (var i = 0; i < clearedIdxs.length; i++) {
            newmatrix.splice(0, 0, this.emptyRow());
        }
        this.matrix = newmatrix;
        return clearedIdxs;
    }
}


/**
 * Renders the Tetris matrix using given state object in the parent div.
 */
function MatrixView(parent, state, brickStyle) {
    this.parent = parent;
    this.pid = this.parent.attr("id");
    this.state = state;
    this.brickStyle = brickStyle;
    
    this.brickWidth = this.parent.width() / this.state.width;
    this.brickHeight = this.parent.height() / this.state.height;
    
    // Create placeholder divs for bricks.
    var parentPos = this.parent.position();
    for (var i = 0; i < this.state.height; i++) {
        for (var j = 0; j < this.state.width; j++) {
            var elemid = this.pid + "_" + i + "_" + j;
            if ($('#' + elemid).length == 0) {
                elem = $("<div></div>").attr("id", elemid)
                    .css("position", "absolute")
                    .css("left", j * this.brickWidth)
                    .css("top", i * this.brickHeight)
                    .css("width", this.brickWidth)
                    .css("height", this.brickHeight);
                brickStyle.N(elem);
                this.parent.append(elem);
            }
        }
    }
    
    // Render the state of the matrix.
    this.drawState = function () {
        for (y = 0; y < this.state.height; y++) {
            for (x = 0; x < this.state.width; x++) {
                this.brickStyle[this.state.matrix[y][x]]($("#" + this.pid + "_" + y + "_" + x));
            }
        }
    }
    
    // Render the piece on top of the state.
    this.drawPiece = function(piece) {
        var pid = this.pid;
        var brickStyle = this.brickStyle;
        piece.bricks.forEach(function(b) {
            var absx = piece.x + b.relx;
            var absy = piece.y + b.rely;
            brickStyle[b.type]($("#" + pid + "_" + absy + "_" + absx));
        });
    }
} 


/**
 * Implements the scoring system and controls game difficulty.
 */
function GameProgress() {
    this.level = 1;
    this.points = 0;
    this.lines = 0;
    
    this.b2b = 0;
    this.comboScore = 0;
    
    this.actionDelay = 48;
    
    // Update the score when the peace is falling down.
    this.onPieceFall = function() {
        // No points are currently given.
    }
    this.onSoftDrop = function() {
        this.points += 1;
    }
    this.onHardDrop = function(distance) {
        this.points += 2 * distance;
    }
    
    // Update the score after the piece is dropped (must be called even if no 
    this.onPieceStop = function(clearedLineCount) {
        switch (clearedLineCount) {
        case 0:
            this.b2b = 0;
            break;
        case 1:
            this.b2b = 0;
            this.points += 100 * this.level;
            break;
        case 2:
            this.b2b = 0;
            this.points += 300 * this.level;
            break;
        case 3:
            this.b2b = 0;
            this.points += 500 * this.level;
            break;
        case 4:
            this.points += 800 * this.level;
            this.b2b += 1;
            if (this.b2b >= 2) {
                this.points += 0.5 * 800 * this.b2b * this.level;
            }
            break;
        }
        this.lines += clearedLineCount;
        this.checkLevelup();
    }
    
    // Check for levelup.
    this.checkLevelup = function() {
        var nextLevelClears = 10 * this.level;
        if (this.lines >= nextLevelClears) {
            this.actionDelay = this.actionDelay - this.getActionDelayDelta();
            this.level += 1;
        }
    }
    
    this.getActionDelayDelta = function() {
        if (this.level <= 3) {
            return 4;
        } else if (this.level <= 9) {
            return 3;
        } else if (this.level <= 14) {
            return 2;
        } else if (this.level <= 19) {
            return 1;
        } else {
            return 0;
        }
    }
    
    // Return the action delay (in ticks) depending on level.
    this.getActionDelay = function() {
        return this.actionDelay;
    }
}


/**
 * Stores all the stuff required for the game.
 */
function Tetris(matrixParent, nextPeaceParent) {
    this.state = new MatrixState(GAME_CFG.matrixWidth, GAME_CFG.matrixHeight);
    this.view = new MatrixView(matrixParent, this.state, GAME_CFG.mainBrickStyle);
    
    this.nextPieceState = new MatrixState(6, 6);
    this.nextPieceView = new MatrixView(nextPeaceParent, this.nextPieceState, GAME_CFG.nextBrickStyle);
    
    this.piece = randomPiece();
    this.piece.y = 1;
    this.piece.x = this.state.width / 2 - 1;
    this.nextPiece = randomPiece();
    
    this.actionQueue = [];
    
    this.gameProgress = new GameProgress();

    
    this.draw = function() {
        this.view.drawState();
        this.view.drawPiece(this.piece);
        this.nextPieceView.drawState(this.nextPieceState);
        this.nextPieceView.drawPiece(this.nextPiece);
    }
    
    /*
     * Movement caused by user input.
     */
    this.rotateR = function() {
        // 1. Perform the rotation.
        this.piece.rotateR();
        // 2. Check if the piece if out of matrix bounds.
        var offset = this.state.checkHorizontalBounds(this.piece);
        // 3. If it is, move it back to the bounds.
        if (offset != 0) {
            this.piece.x -= offset;
        }
        // 4. Check if the piece is colliding with non-empty bricks in matrix.
        if (this.state.checkCollision(this.piece)) {
            // 5. If it does, undo the rotation and the movement.
            this.piece.x += offset;
            this.piece.rotateL();
        }
    }
    this.rotateL = function() {
        // 1. Perform the rotation.
        this.piece.rotateL();
        // 2. Check if the piece if out of matrix bounds.
        var offset = this.state.checkHorizontalBounds(this.piece);
        // 3. If it is, move it back to the bounds.
        if (offset != 0) {
            this.piece.x -= offset;
        }
        // 4. Check if the piece is colliding with non-empty bricks in matrix.
        if (this.state.checkCollision(this.piece)) {
            // 5. If it does, undo the rotation and the movement.
            this.piece.x += offset;
            this.piece.rotateR();
        }
    }
    this.moveLeft = function() {
        if (this.state.canMove(this.piece, -1)) {
            this.piece.x -= 1;
        }
    }
    this.moveRight = function() {
        if (this.state.canMove(this.piece, 1)) {
            this.piece.x += 1;
        }
    }
    this.softDrop = function() {
        if (this.state.canFall(this.piece)) {
            this.piece.y += 1;
        }
        this.gameProgress.onSoftDrop();
    }
    this.hardDrop = function() {
        distance = 0;
        while (this.state.canFall(this.piece)) {
            distance += 1;
            this.piece.y += 1;
        }
        this.gameProgress.onHardDrop(distance);
    }
    
    /*
     * Perform actions not caused by user input.
     * Returns if the game may continue (false is Game Over).
     */
    this.gameEvents = function() {
        // Fall the piece.
        if (this.state.canFall(this.piece)) {
            this.piece.y += 1;
            this.gameProgress.onPieceFall();
        } else {
            // Clear the lines.
            this.state.mergePiece(this.piece);
            clearResult = this.state.clearLines();
            this.gameProgress.onPieceStop(clearResult.length);
            // Get next piece.
            this.piece = this.nextPiece;
            this.piece.x = this.state.width / 2 - 1;
            this.piece.y = 0;
            this.nextPiece = randomPiece();
            // If current piece is colliding right at this moment, this is the game over.
            if (this.state.checkCollision(this.piece)) {
                return false;
            }
        }
        return true;
    }
}


/**
 * Handling of the keyboard input.
 */
// Only listing the codes we won't ignore in the game.
var KeyCodes = {
        13: 'enter',
        32: 'space',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        88: 'x',
        90: 'z'
        }
var kboard = new function() {
    this.keySequence = [];
    this.pressedKeys = {};

    this.keydown = function(e) {
        var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
        if (KeyCodes[keyCode]) {
            e.preventDefault();
            this.keySequence.push(keyCode);
            this.pressedKeys[KeyCodes[keyCode]] = true;
        }
    }
    this.keyup = function(e) {
        var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
        if (KeyCodes[keyCode]) {
            e.preventDefault();
            this.pressedKeys[KeyCodes[keyCode]] = false;
        }
    }
    
    // Check if there are pressed keys in the queue.
    this.hasKeys = function() {
        return this.keySequence.length > 0;
    }
    
    // Return next key to process.
    this.nextKey = function() {
        var key = KeyCodes[this.keySequence.shift()];
        if (key != undefined) {
            var result = {};
            result[key] = true;
            return result;
        } else {
            return undefined;
        }
    }
}
document.onkeydown = function(e) {
    kboard.keydown(e);
}
document.onkeyup = function(e) {
    kboard.keyup(e);
}


/*
 * Global stuff.
 */

var GameStates = {
        PLAY: "play",
        PAUSE: "pause",
        GAME_OVER: "game_over",
}

var tetris = undefined;
var gameTickCounter = 0;
var moveTickCounter = 0;
var moveLock = false;
var gameState = GameStates.PLAY;
var actionLoops = [];

var gameStateTransitions = new function() {
    this.play2pause = function() {
        gameState = GameStates.PAUSE;
        $("#matrix").css("visibility", "hidden");
        $("#pause").css("visibility", "visible");
    }
    this.pause2play = function() {
        gameState = GameStates.PLAY;
        $("#matrix").css("visibility", "visible");
        $("#pause").css("visibility", "hidden");
    }
    this.play2gameOver = function() {
        gameState = GameStates.GAME_OVER;
        $("#matrix").css("visibility", "hidden");
        $("#game_over").css("visibility", "visible");
    }
    this.gameOver2play = function() {
        gameState = GameStates.PLAY;
        $("#matrix").css("visibility", "visible");
        $("#game_over").css("visibility", "hidden");
    }
}

/**
 * Redraw everything.
 */
function drawLoop() {
    tetris.draw();
    
    // Write out current stats.
    $("#level").text(tetris.gameProgress.level);
    $("#points").text(tetris.gameProgress.points);
    $("#lines").text(tetris.gameProgress.lines);
    
    requestAnimFrame(drawLoop);
}

/**
 * Peform actions - user input and game events.
 */
function actionLoop() {
    actionLoops[gameState]();
    var actionTimeout = setTimeout(actionLoop, 16);
}


/**
 * Init the game and start the loop.
 */
function tetrisInit() {
    tetris = new Tetris($("#matrix"), $("#nextpiece"));
    drawLoop();
    actionLoop();
}

/**
 * Reset the game.
 */
function tetrisReset() {
    tetris = new Tetris($("#matrix"), $("#nextpiece"));
    gameTickCounter = 0;
    moveTickCounter = 0;
    moveLock = false;
}

/**
 * Action loop for PLAY state.
 */
actionLoops[GameStates.PLAY] = function() {
    /*
     * Hanle discrete input.
     */
    while (!moveLock && kboard.hasKeys()) {
        var key = kboard.nextKey();
        if (key.up || key.x) {
            tetris.rotateR();
        } else if (key.z) {
            tetris.rotateL();
        } else if (key.left) {
            tetris.moveLeft();
        }  else if (key.right) {
            tetris.moveRight();
        } else if (key.down) {
            tetris.softDrop();
        } else if (key.space) {
            tetris.hardDrop();
            // Hard drop locks the input for current piece until next game events update.
            gameTickCounter += 60;
            moveLock = true;
        } else if (key.enter) {
            // Move to pause state.
            gameStateTransitions.play2pause();
            return;
        } 
    }
    // Continous key movement.
    if (kboard.pressedKeys.left || kboard.pressedKeys.right) {
        ++moveTickCounter;
    } else {
        moveTickCounter = 0;
    }
    if (moveTickCounter >= 25) {
        moveTickCounter = 17;
        if (kboard.pressedKeys.left) {
            tetris.moveLeft();
        }
        if (kboard.pressedKeys.right) {
            tetris.moveRight();
        }
    }
    
    /*
     * Game events.
     */
    if (++gameTickCounter >= tetris.gameProgress.getActionDelay()) {
        // Reset state.
        gameTickCounter = 0;
        moveLock = false;
        // Process events.
        if (!tetris.gameEvents()) {
            gameStateTransitions.play2gameOver();
        }
    }
}

/**
 * Action loop for PAUSE state.
 */
actionLoops[GameStates.PAUSE] = function() {
    while (!moveLock && kboard.hasKeys()) {
        if (kboard.nextKey().enter) {
            // Move to pause state.
            gameStateTransitions.pause2play();
            return;
        } 
    }
}

/**
 * Action loop for GAME OVER state.
 */
actionLoops[GameStates.GAME_OVER] = function() {
    while (!moveLock && kboard.hasKeys()) {
        if (kboard.nextKey().enter) {
            // Reset the Tetris state.
            tetrisReset();
            // Move to pause state.
            gameStateTransitions.gameOver2play();
            return;
        } 
    }
}
