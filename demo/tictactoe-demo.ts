import { AppWidget, Action } from "../src/hsml-appwidget";
import { Hsmls, Hsml } from "../src/hsml";

interface AppState {
    board: string[][];
    turn: number;
}

// interface CLICK {
//     x: number;
//     y: number;
// }

const initState: AppState = {
    board: [
        [" ", " ", " "],
        [" ", " ", " "],
        [" ", " ", " "]
    ],
    turn: 0
}

const action: Action = (name: string, data: any, widget: AppWidget) => {
    console.log("action", name, data, widget);
    if (name === "CLICK") {
        widget.state.board[data.y][data.x] = data.playerTurn ? "X" : "O";
        widget.state.turn = data.playerTurn ? 0 : 1;
        widget.update();
    }
}

function board(board: AppState["board"], playerTurn: number): Hsml {
    console.log(board);
    return ["div",
        board.map((row, y) => [
            "div",
            row.map((col, x) => ["button", {
                on: ["click", "CLICK", { x, y, playerTurn }]
            }, [col === " " ? "." : col]] as Hsml)
        ] as Hsml)
    ];
}

function appView(state: AppState, action: Action<AppState>): Hsmls {
    console.log(state);
    return [
        ["h1", ["Tic-Tac-Toe Demo"]],
        ["div", [
            board(state.board, state.turn)
        ]],
        ["div", [`PLAYER ${state.turn}`]]
    ];
}

const app = new AppWidget("app", appView, initState, action);
app.mount(document.getElementById("app"));
(self as any).app = app;
