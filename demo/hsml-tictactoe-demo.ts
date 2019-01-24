import { YWidget, Action } from "../src/hsml-ywidget";
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

class App extends YWidget<AppState> {

    state = {
        board: [
            [NBSP, NBSP, NBSP],
            [NBSP, NBSP, NBSP],
            [NBSP, NBSP, NBSP]
        ],
        turn: 0
    };

    constructor() {
        super("App");
    }

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

    onAction(action: string, data: any): void {
        console.log("action", action, data);
        switch (action) {

            case Actions.mark:
                this.state.board[data.y][data.x] = data.turn ? CROS : CIRC;
                this.state.turn = data.turn ? 0 : 1;
                this.update();
                break;

            default:
                console.warn("action unhandled:", action, data, this);
                break;
        }
    }

}


const app = new App().mount(document.getElementById("app"));

(self as any).app = app;
