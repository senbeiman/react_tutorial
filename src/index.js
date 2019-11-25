import React from 'react';
import ReactDOM from 'react-dom';
import Switch from "@material-ui/core/Switch";
import './index.css';

function Square(props) {
    const classNameToAdd = props.highlight ? 'background-yellow' : '';
    return (
        <button className={`square ${classNameToAdd}`} onClick={props.onClick} >
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                highlight={this.props.highlightLines.indexOf(i) !== -1}
                key={i}
            />
        );
    }
    repeatSquareRow(row) {
        let squares = [];
        for (let i = 0; i < 3; i++) {
            squares.push(this.renderSquare(row * 3 + i));
        }
        return <div className="board-row" key={row}>{squares}</div>;
    }
    render() {
        let squareRows = [];
        for (let i = 0; i < 3; i++) {
            squareRows.push(this.repeatSquareRow(i));
        }
        return <div>{squareRows}</div>;
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                squareNumber: null,
            }],
            stepNumber: 0,
            xIsNext: true,
            historyIsAsc: true,
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares).winner || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
                squareNumber: i,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    handleChange() {
        this.setState({historyIsAsc: !this.state.historyIsAsc,});
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winnerInfo = calculateWinner(current.squares);
        const moves = history.map((step, move) => {
            const desc = move ?
                'Go to move #' + move :
                'Go to game start';
            const col = (step.squareNumber !== null) ? 'col: ' + (step.squareNumber % 3 + 1) : '';
            const row = (step.squareNumber !== null) ? 'row: ' + (Math.floor(step.squareNumber / 3) + 1) : '';
            const isBold = (this.state.stepNumber === move) ? 'font-bold' : '';
            const moveNum = move ? 'move #' + move + '>' : '';
            return (
                <li key={move} className={isBold}>
                    {moveNum} {col} {row}
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });
        const orderedMoves = this.state.historyIsAsc ? moves : moves.reverse();
        let status;
        if (winnerInfo.winner) {
            status = 'Winner: ' + winnerInfo.winner;
        } else if (this.state.stepNumber === 9){
            status = 'Draw';
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        highlightLines={winnerInfo.lines}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                        history order: desc
                        <Switch
                        checked={this.state.historyIsAsc}
                        onChange={() => this.handleChange()}
                        value="check"
                        color="default"/>
                        asc
                    <ol>{orderedMoves}</ol>
                </div>
            </div>
    );
    }
}
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
// ========================================

ReactDOM.render(
<Game />,
    document.getElementById('root')
);
