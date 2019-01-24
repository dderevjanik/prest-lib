import { XWidget, Action } from "../src/hsml-xwidget";
import { Hsmls, Hsml } from "../src/hsml";

const NBSP = "\u00A0";
const CIRC = "\u25EF";
const CROS = "\u2A2F";

interface AppState {
    board: string[][];
    turn: number;
}

enum Actions {
    mark = "mark"
}

class App extends XWidget<AppState> {

    constructor() {
        super("App");
    }

    state = {
        board: [
            [NBSP, NBSP, NBSP],
            [NBSP, NBSP, NBSP],
            [NBSP, NBSP, NBSP]
        ],
        turn: 0
    };

    view(state: AppState, action: Action): Hsmls {
        return [
            ["h1", "Tic-Tac-Toe Demo"],
            ["p", [
                "Player: ", state.turn ? CROS : CIRC
            ]],
            ["div", state.board.map<Hsml>((row, y) =>
                ["div", row.map<Hsml>((col, x) =>
                    ["button",
                        {
                            styles: {
                                fontFamily: "monospace",
                                fontSize: "300%",
                                display: "inline-block",
                                width: "2em", height: "2em"
                            },
                            on: ["click", Actions.mark, { x, y, turn: state.turn }]
                        },
                        [
                            col === NBSP ? NBSP : col
                        ]
                    ])
                ])
            ]
        ];
    }

    onAction(action: string, data: any, widget: XWidget<AppState>): void {
        console.log("action", action, data);
        switch (action) {

            case Actions.mark:
                widget.state.board[data.y][data.x] = data.turn ? CROS : CIRC;
                widget.state.turn = data.turn ? 0 : 1;
                widget.update();
                break;

            default:
                console.warn("action unhandled:", action, data, this);
                break;
        }
    }

}


const app = new App().mount(document.getElementById("app"));

(self as any).app = app;
