import { AppWidget, Action } from "../src/hsml-appwidget";
import { Hsmls, Hsml } from "../src/hsml";

const NBSP = "\u00A0";
const CIRC = "\u25EF";
const CROS = "\u2A2F";

interface AppState {
    board: string[][];
    turn: number;
}

const initState: AppState = {
    board: [
        [NBSP, NBSP, NBSP],
        [NBSP, NBSP, NBSP],
        [NBSP, NBSP, NBSP]
    ],
    turn: 0
};

enum Actions {
    mark = "mark"
}

const action: Action = (name: string, data: any, widget: AppWidget) => {
    console.log("action", name, data, widget);
    switch (name) {

        case Actions.mark:
            widget.state.board[data.y][data.x] = data.playerTurn ? CROS : CIRC;
            widget.state.turn = data.playerTurn ? 0 : 1;
            widget.update();
            break;

        default:
            console.warn("action unhandled:", name, data, widget);
            break;
    }
};

function boardView(board: AppState["board"], playerTurn: number): Hsmls {
    console.log(board);
    return [
        ["div", board.map<Hsml>((row, y) =>
            ["div", row.map<Hsml>((col, x) =>
                ["button",
                    {
                        styles: {
                            fontFamily: "monospace",
                            fontSize: "300%",
                            display: "inline-block",
                            width: "2em", height: "2em"
                        },
                        on: ["click", Actions.mark, { x, y, playerTurn }]
                    },
                    [
                        col === NBSP ? NBSP : col
                    ]
                ])
            ])
        ]
    ];
}

function appView(state: AppState, action: Action<AppState>): Hsmls {
    console.log(state);
    return [
        ["h1", ["Tic-Tac-Toe Demo"]],
        ["p", ["Player: ", state.turn ? CROS : CIRC]],
        ["p", boardView(state.board, state.turn)]
    ];
}

const app = new AppWidget("app", appView, initState, action);

app.mount(document.getElementById("app"));

(self as any).app = app;
