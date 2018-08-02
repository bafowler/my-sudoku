/*
 * Adapted from Peter Norvig's paper "Solving Every Sudoku Puzzle", which can
 * be found at http://norvig.com/sudoku.html
 */

 // constants for every sudoku game
 const rows = "abcdefghi";
 const cols = "012345678";
 const squares = [ ["a0", "a1", "a2", "b0", "b1", "b2", "c0", "c1", "c2"],
                 ["a3", "a4", "a5", "b3", "b4", "b5", "c3", "c4", "c5"],
                 ["a6", "a7", "a8", "b6", "b7", "b8", "c6", "c7", "c8"],
                 ["d0", "d1", "d2", "e0", "e1", "e2", "f0", "f1", "f2"],
                 ["d3", "d4", "d5", "e3", "e4", "e5", "f3", "f4", "f5"],
                 ["d6", "d7", "d8", "e6", "e7", "e8", "f6", "f7", "f8"],
                 ["g0", "g1", "g2", "h0", "h1", "h2", "i0", "i1", "i2"],
                 ["g3", "g4", "g5", "h3", "h4", "h5", "i3", "i4", "i5"],
                 ["g6", "g7", "g8", "h6", "h7", "h8", "i6", "i7", "i8"] ];

/*
 * Create a sudoku game, which is a dictionary that maps cell id to possible
 * cell values. The game will start out with each cell having every impossible
 * value (123456789). Then, assign each "static" cell given by the current game
 * its appropriate value. Search for the solution using guess-and-check. Return
 * the solved game, null if no solution is found.
 */
function solveCurrentGame(currentGame) {
    var game = {};
    for (let row of rows) {
        for (let col of cols) {
            game[row + col] = "123456789";
        }
    }
    for (let cellId in games[gameIndex]) {
        if (!assign(game, cellId, currentGame[cellId])) {
            console.error("Couldn't assign value " + games[gameIndex][cellId] +
            " to cell " + cellId);
        }
    }
    if (!(game = search(game))) {
        game = null;
    }
    return game;
}
/*
 * Return true iff the game is solved (i.e. each cell has only one possible
 * value), false otherwise
 */
function checkSolved(game) {
    for (let cellId in game) {
        if (game[cellId].length != 1) {
            return false;
        }
    }
    return true;
}
/*
 * Return the id of an unsolved cell within a partially solved game that has
 * the least possible values (while still having >1 possible value)
 */
function findMinLengthCellId(game) {
    let minLengthCellId = null;
    let minLength = 10;
    for (let cellId in game) {
        if (game[cellId].length > 1) {
            if (!minLengthCellId ||
                game[cellId].length < minLength) {
                minLength = game[cellId].length;
                minLengthCellId = cellId;
            }
        }
    }
    return minLengthCellId;
}
/*
 * Take a partially completed game and recursively 'search' for the solution
 * by guessing different values for the unsolved cell within the game that has
 * the least possible values and seeing if a contradicition is found. Return
 * the solved game if it is found, false if no solution can be found.
 *
 */
function search(game) {
    if (!game) {
        return false;
    }
    if (checkSolved(game)) {
        return game;
    }

    let minLengthCellId = findMinLengthCellId(game);

    for (let value of game[minLengthCellId]) {
        // create a copy of the game
        let gameCopy = {};
        Object.keys(game).forEach(function(cellId) {
            gameCopy[cellId] = game[cellId];
        })
        // assign one of the possible values
        if (!assign(gameCopy, minLengthCellId, value)) {
            continue;   // contradicition found, move on to the next value
        }
        // take the copy of the game with the 'guessed' value and guess more
        // values using recursion
        gameCopy = search(gameCopy);
        if (gameCopy) {
            return gameCopy;
        }
    }

    return false;
}
/*
 * Assign value to the cell with the given id in the game by eliminating all
 * its other possible values. Return false if a contradiciton is found,
 * true otherwise.
 */
function assign(game, id, value) {
    otherValues = game[id].replace(value, "").split("");
    if (otherValues.every(function(otherValue) {
        return eliminate(game, id, otherValue);
    })) {
        return true;
    } else {
        return false;
    }
}

/*
 * Eliminate value from the cell with the given id's possible values, within
 * the game. If the cell with the given id is reduced to one possible value,
 * recursively eliminate that value from all peers. Check the three units that
 * include the cell with the given id to see if, due to the first elimination,
 * the unit is reduced to only one place for value. If so, assign value to that
 * one possible cell. Return false if a contradiciton is found, true otherwise.
 */
function eliminate(game, id, value) {
    if (game[id].indexOf(value) == -1) {
        return true;    // value already eliminated
    }
    game[id] = game[id].replace(value, "");

    if (game[id].length == 0) {
        return false;   // contradiction: no possible for cell
    } else if (game[id].length == 1) {
        // cell with id is reduced to one value, eliminate it from peers
        let valueToEliminate = game[id];
        let peers = getPeers(game, id);
        if (!peers.every(function(peer){
            return eliminate(game, peer, valueToEliminate);
        })) {
            // contradiction: value could not be eliminated from a certain peer
            return false;
        }
    }
    // check all units to see if they are reduced to one place for value
    let units = getUnits(game, id);
    for (let unit of units) {
        // find all possible places for value within unit
        let places = [];
        for (let cellId of unit) {
            if (game[cellId].indexOf(value) != -1) {
                places.push(cellId);
            }
        }
        if (places.length == 0) {
            return false;   // contradiciton: no place for value within unit
        } else if (places.length == 1) {
            // only one place for value; assign it there
            if (!assign(game, places[0], value)) {
                return false;   // contradiction: value could not be assigned
            }
        }
    }
    return true;
}

/*
 * Return a list of all unique peers for the cell with id in game.
 * A 'peer' is a cell that shares a row, column, or square with another cell.
 */
function getPeers(game, id) {
    let peers = [];
    // get all peers of the same row
    for (let col of cols) {
        if (id[1] != col) {
            peers.push(id[0] + col);
        }
    }
    // get all peers of the same column
    for (let row of rows) {
        if (id[0] != row) {
            peers.push(row + id[1]);
        }
    }
    // get all peers of the same square, if they aren't already a peer due to
    // existing in the same row or column
    for (let arr of squares) {
        if (arr.includes(id)) {
            for (let cellId of arr) {
                if (cellId != id && cellId[0] != id[0] && cellId[1] != id[1]) {
                    peers.push(cellId);
                }
            }
            break;
        }
    }
    return peers;
}

/*
 * Return a list of the three units associated with id (row, column, square) in
 * game. The same cell id can be included in multiple units.
 */
function getUnits(game, id) {
    let units = [[], [], []];
    // get unit[0], the row
    for (let col of cols) {
        units[0].push(id[0] + col);
    }
    // get unit[1], the column
    for (let row of rows) {
        units[1].push(row + id[1]);
    }
    // get unit[2], the square
    for (let arr of squares) {
        if (arr.includes(id)) {
            for (let cellId of arr) {
                units[2].push(cellId);
            }
            break;
        }
    }
    return units;
}
