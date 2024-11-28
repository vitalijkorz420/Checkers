const board = document.getElementById('board');
const resetButton = document.getElementById('resetButton');
let selectedPiece = null;
let currentPlayer = 'white';
let mustCapturePieces = [];
for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
        const cell = document.createElement('div');
        cell.className = `cell ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
        cell.dataset.row = row;
        cell.dataset.col = col;
        board.appendChild(cell);
    }
}
function setupPieces() {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            cell.innerHTML = '';
            if ((row < 3 || row > 4) && (row + col) % 2 !== 0) {
                const piece = document.createElement('div');
                piece.className = `piece ${row < 3 ? 'black-piece' : 'white-piece'}`;
                cell.appendChild(piece);
            }
        }
    }
}
setupPieces();
function updateMustCapturePieces() {
    mustCapturePieces = [];
    document.querySelectorAll(`.${currentPlayer}-piece`).forEach((piece) => {
        const parentCell = piece.parentElement;
        document.querySelectorAll('.cell').forEach((cell) => {
            if (isCaptureMove(piece, cell)) mustCapturePieces.push(piece);
        });
    });
}
function highlightMoves(piece) {
    clearHighlights();
    document.querySelectorAll('.cell').forEach((cell) => {
        if (isValidMove(piece, cell) || isCaptureMove(piece, cell)) {
            cell.classList.add('highlight');
        }
    });
}
function clearHighlights() {
    document.querySelectorAll('.cell.highlight').forEach((cell) => {
        cell.classList.remove('highlight');
    });
}
function checkWin() {
    const whitePieces = document.querySelectorAll('.white-piece');
    const blackPieces = document.querySelectorAll('.black-piece');
    const whiteBlocked = Array.from(whitePieces).every(function(piece) {
        return isBlocked(piece);
    });
    const blackBlocked = Array.from(blackPieces).every(function(piece) {
        return isBlocked(piece);
    });
    if (whitePieces.length === 0 || whiteBlocked) {
        alert('Чорні виграли!');
        resetGame();
    } else if (blackPieces.length === 0 || blackBlocked) {
        alert('Білі виграли!');
        resetGame();
    }
}
function isBlocked(piece) {
    const cells = document.querySelectorAll('.cell');
    return Array.from(cells).every(function(cell) {
        return !isValidMove(piece, cell) && !isCaptureMove(piece, cell);
    });
}
function resetGame() {
    setupPieces();
    currentPlayer = 'white';
    selectedPiece = null;
    mustCapturePieces = [];
    clearHighlights();
}
function isValidMove(selectedPiece, targetCell) {
    const oldCell = selectedPiece.parentElement;
    const oldRow = parseInt(oldCell.dataset.row);
    const oldCol = parseInt(oldCell.dataset.col);
    const newRow = parseInt(targetCell.dataset.row);
    const newCol = parseInt(targetCell.dataset.col);
    const isDamka = selectedPiece.classList.contains('damka');
    if (isDamka) {
        return (
            Math.abs(newRow - oldRow) === Math.abs(newCol - oldCol) &&
            targetCell.children.length === 0
        );
    } else {
        const direction = selectedPiece.classList.contains('white-piece') ? -1 : 1;
        return (
            Math.abs(newRow - oldRow) === 1 &&
            Math.abs(newCol - oldCol) === 1 &&
            newRow - oldRow === direction &&
            targetCell.children.length === 0
        );
    }
}
function makeDamka(piece) {
    piece.classList.add('damka');
}
function isCaptureMove(selectedPiece, targetCell) {
    const oldCell = selectedPiece.parentElement;
    const oldRow = parseInt(oldCell.dataset.row);
    const oldCol = parseInt(oldCell.dataset.col);
    const newRow = parseInt(targetCell.dataset.row);
    const newCol = parseInt(targetCell.dataset.col);
    const isDamka = selectedPiece.classList.contains('damka');
    if (isDamka) {
        const rowDiff = newRow - oldRow;
        const colDiff = newCol - oldCol;
        if (Math.abs(rowDiff) === Math.abs(colDiff)) {
            const rowStep = rowDiff / Math.abs(rowDiff);
            const colStep = colDiff / Math.abs(colDiff);
            let middlePieceFound = false;
            for (let i = 1; i < Math.abs(rowDiff); i++) {
                const middleRow = oldRow + rowStep * i;
                const middleCol = oldCol + colStep * i;
                const middleCell = document.querySelector(
                    `.cell[data-row="${middleRow}"][data-col="${middleCol}"]`
                );
                if (middleCell.children.length > 0) {
                    const opponentPiece = middleCell.children[0];
                    if (
                        opponentPiece &&
                        opponentPiece.classList.contains(
                            currentPlayer === 'white' ? 'black-piece' : 'white-piece'
                        )
                    ) {
                        if (middlePieceFound) return false; 
                        middlePieceFound = true;
                    } else {
                        return false;
                    }
                }
            }
            return middlePieceFound && targetCell.children.length === 0;
        }
    } else {
        const middleRow = (oldRow + newRow) / 2;
        const middleCol = (oldCol + newCol) / 2;
        if (
            Math.abs(newRow - oldRow) === 2 &&
            Math.abs(newCol - oldCol) === 2 &&
            targetCell.children.length === 0
        ) {
            const middleCell = document.querySelector(
                `.cell[data-row="${middleRow}"][data-col="${middleCol}"]`
            );
            const opponentPiece = middleCell.children[0];
            return (
                opponentPiece &&
                opponentPiece.classList.contains(
                    currentPlayer === 'white' ? 'black-piece' : 'white-piece'
                )
            );
        }
    }
    return false;
}
function makeCapture(selectedPiece, targetCell) {
    const oldCell = selectedPiece.parentElement;
    const oldRow = parseInt(oldCell.dataset.row);
    const oldCol = parseInt(oldCell.dataset.col);
    const newRow = parseInt(targetCell.dataset.row);
    const newCol = parseInt(targetCell.dataset.col);
    const rowDiff = newRow - oldRow;
    const colDiff = newCol - oldCol;
    const step = Math.abs(rowDiff);
    const rowStep = rowDiff / step;
    const colStep = colDiff / step;
    for (let i = 1; i < step; i++) {
        const middleRow = oldRow + rowStep * i;
        const middleCol = oldCol + colStep * i;
        const middleCell = document.querySelector(
            `.cell[data-row="${middleRow}"][data-col="${middleCol}"]`
        );
        if (middleCell.children.length > 0) {
            const opponentPiece = middleCell.children[0];
            if (opponentPiece) {
                middleCell.removeChild(opponentPiece);
            }
        }
    }
    targetCell.appendChild(selectedPiece);
    clearHighlights();
    checkForDamka(selectedPiece);
    checkWin();
    updateMustCapturePieces();
    if (
        selectedPiece.classList.contains('damka') &&
        mustCapturePieces.length > 0 &&
        mustCapturePieces.includes(selectedPiece)
    ) {
        alert('Дамка може продовжити побиття!');
        highlightMoves(selectedPiece);
    } else {
        currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
        selectedPiece = null;
    }
}
function checkForDamka(piece) {
    const row = parseInt(piece.parentElement.dataset.row);
    if (
        (row === 0 && piece.classList.contains('white-piece')) ||
        (row === 7 && piece.classList.contains('black-piece'))
    ) {
        makeDamka(piece);
    }
}
function isBlocked(piece) {
    const cells = Array.from(document.querySelectorAll('.cell')); 
    return !cells.some(function(cell) {
        return isValidMove(piece, cell) || isCaptureMove(piece, cell);
    });
}
board.addEventListener('click', (event) => {
    const target = event.target;
    updateMustCapturePieces();
    if (target.classList.contains('piece') && target.classList.contains(`${currentPlayer}-piece`)) {
        if (mustCapturePieces.length > 0 && !mustCapturePieces.includes(target)) {
            alert('Треба зробити обов’язкове побиття!');
            return;
        }
        selectedPiece = target;
        highlightMoves(selectedPiece);
    } else if (
        selectedPiece &&
        target.classList.contains('cell') &&
        target.classList.contains('black')
    ) {
        const oldCell = selectedPiece.parentElement;
        const oldRow = parseInt(oldCell.dataset.row);
        const oldCol = parseInt(oldCell.dataset.col);
        const newRow = parseInt(target.dataset.row);
        const newCol = parseInt(target.dataset.col);
        if (isCaptureMove(selectedPiece, target)) {
            const middleRow = (oldRow + newRow) / 2;
            const middleCol = (oldCol + newCol) / 2;
            const middleCell = document.querySelector(
                `.cell[data-row="${middleRow}"][data-col="${middleCol}"]`
            );
            const opponentPiece = middleCell.children[0];
            if (opponentPiece) {
                middleCell.removeChild(opponentPiece);
            }
            target.appendChild(selectedPiece);
            checkForDamka(selectedPiece);
            clearHighlights();
            checkWin();
            updateMustCapturePieces();
            if (mustCapturePieces.length > 0 && mustCapturePieces.includes(selectedPiece)) {
                alert('Ви повинні продовжити захоплення!');
                return;
            } else {
                currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
                selectedPiece = null;
            }
        } else if (isValidMove(selectedPiece, target) && mustCapturePieces.length === 0) {
            target.appendChild(selectedPiece);
            checkForDamka(selectedPiece);
            clearHighlights();
            checkWin();
            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
            selectedPiece = null;
        }
    }
});
resetButton.addEventListener('click', () => {
    resetGame();
    updateMustCapturePieces();
});