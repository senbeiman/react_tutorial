import React from 'react';
import ReactDOM from 'react-dom';
import Switch from "@material-ui/core/Switch";
import { connect, Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { createLogger } from "redux-logger";
import './index.css';

// action creators
const addHistory = (number) => ({
    type: 'ADD_HISTORY',
    number
    });
const jumpStep = step => ({
    type: 'JUMP_STEP',
    step
});
const toggleSort = () => ({
    type: 'TOGGLE_SORT'
});
// reducers
const game = (
    state = {
        history: [null],
        stepNumber: 0,
        xIsNext: true,
        historyIsAsc: true,
    },
    action
) => {
    switch (action.type) {
        case 'ADD_HISTORY':
            const squares = getSquaresFromHistory(state.history, state.stepNumber);
            if (calculateWinner(squares).winner || squares[action.number]) {
                return state;
            }
            const history = state.history.slice(0, state.stepNumber+1);
            return {
                ...state,
                history: history.concat([action.number]),
                stepNumber: state.stepNumber + 1,
                xIsNext: !state.xIsNext,
            };
        case 'JUMP_STEP':
            return {
                ...state,
                stepNumber: action.step,
                xIsNext: (action.step % 2) === 0,
            };
        case 'TOGGLE_SORT':
            return {
                ...state,
                historyIsAsc: !state.historyIsAsc
            };
        default:
            return state;
    }
};

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {winner: squares[a], lines: lines[i]};
        }
    }
    return {winner: null, lines: []};
}

function getSquaresFromHistory(history, stepNumber){
    const current = history.slice(0, stepNumber + 1);
    let squares = Array(9).fill(null);
    current.forEach((number, index) => {
        squares[number] = (index % 2 === 0) ? 'O' : 'X';
    });
    return squares;
}


const Square = ({ onClick, value, highlight }) => {
    const classNameToAdd = highlight ? 'background-yellow' : '';
    return (
        <button className={`square ${classNameToAdd}`} onClick={onClick} >
            {value}
        </button>
    );
};
const mapSquareStateToProps = (state, ownProps) => {
    const squares = getSquaresFromHistory(state.history, state.stepNumber);
    const winnerInfo = calculateWinner(squares);
    return {
        value: squares[ownProps.number],
        highlight: winnerInfo.lines.indexOf(ownProps.number) !== -1
    }
};
const mapSquareDispatchToProps = (dispatch, ownProps) => {
    return {
        onClick: () => {
            dispatch(addHistory(ownProps.number))
        }
    }
};
const FilledSquare = connect(
    mapSquareStateToProps,
    mapSquareDispatchToProps
)(Square);

const SquareRow = ({ row }) => {
    let squareLines = [];
    for (let i = 0; i < 3; i++) {
        squareLines.push(
            <FilledSquare number={row * 3 + i} key={i}/>
        );
    }
    return <div className="board-row" >{squareLines}</div>;
};

const Board = () => {
    let squareRows = [];
    for (let i = 0; i < 3; i++) {
        squareRows.push(<SquareRow key={i} row={i}/>);
    }
    return <div className="game-board">{squareRows}</div>;
};

const Move = ({ isBold, moveNum, desc, col, row, onClick }) => {
    return (
        <li className={isBold}>
            {moveNum} {col} {row}
            <button onClick={onClick}>{desc}</button>
        </li>
    );
};
const mapMoveStateToProps = (state, ownProps) => {
    return {
        isBold:(state.stepNumber === ownProps.move) ? 'font-bold' : '',
        desc : ownProps.move ? 'Go to move #' + ownProps.move : 'Go to game start',
        moveNum : ownProps.move ? 'move #' + ownProps.move + '>' : '',
        col:(ownProps.number!== null) ? 'col: ' + (ownProps.number % 3 + 1) : '',
        row:(ownProps.number!== null) ? 'row: ' + (Math.floor(ownProps.number / 3) + 1) : ''
    }
};
const mapMoveDispatchToProps = (dispatch, ownProps) => {
    return {
        onClick: () => {
            dispatch(jumpStep(ownProps.move))
        }
    }
};
const CalculatedMove = connect(
    mapMoveStateToProps,
    mapMoveDispatchToProps
)(Move);

let Moves = ({ history, historyIsAsc }) => {
    const moves = history.map((number, index) => (
            <CalculatedMove key={index} number={number} move={index}/>
        )
    );
    const orderedMoves = historyIsAsc ? moves : moves.reverse();
    return <ol>{orderedMoves}</ol>;
};
const mapMovesStateToProps = (state) => {
    return {
        history: state.history,
        historyIsAsc: state.historyIsAsc
    }
};
Moves = connect(mapMovesStateToProps)(Moves);

let GameInfo = ({ status, historyIsAsc, handleChange }) => (
    <div className="game-info">
        <div>{status}</div>
        history order: desc
        <Switch
            checked={historyIsAsc}
            onChange={handleChange}
            value="check"
            color="default"/>
        asc
        <Moves />
    </div>
);
const mapGameInfoStateToProps = (state) => {
    let status;
    const squares = getSquaresFromHistory(state.history, state.stepNumber);
    const winnerInfo = calculateWinner(squares);
    if (winnerInfo.winner) {
        status = 'Winner: ' + winnerInfo.winner;
    } else if (state.stepNumber === 9){
        status = 'Draw';
    } else {
        status = 'Next player: ' + (state.xIsNext ? 'X' : 'O');
    }
    return {
        status,
        historyIsAsc: state.historyIsAsc
    }
};
const mapGameInfoDispatchToProps = (dispatch) => {
    return {
        handleChange: () => {
            dispatch(toggleSort())
        }
    }
};
GameInfo = connect(
    mapGameInfoStateToProps,
    mapGameInfoDispatchToProps
)(GameInfo);

const Game = () => {
    return (
        <div className="game">
            <Board />
            <GameInfo />
        </div>
    );
};
const loggerMiddleware = createLogger();
const store = createStore(game, applyMiddleware(loggerMiddleware));
ReactDOM.render(
    <Provider store={store}>
        <Game />
    </Provider>,
    document.getElementById('root')
);
