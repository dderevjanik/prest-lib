import { AppWidget, Action } from "../src/hsml-appwidget";
import { Hsmls } from "../src/hsml";

interface AppState {
    title: string;
    count: number;
}

enum Actions {
    title = "title",
    dec = "dec",
    inc = "inc",
    xXx = "xXx"
}

function appView(state: AppState, action: Action<AppState>): Hsmls {
    return [
        ["h2", [state.title]],
        ["p", [
            "Title: ",
            ["input",
                {
                    type: "text",
                    value: state.title,
                    on: ["input", Actions.title, e => (e.target as HTMLInputElement).value]
                }
            ],
        ]],
        ["p", [
            ["em", ["Count"]], ": ", state.count,
            " ",
            ["button", { on: ["click", Actions.dec, 1] }, ["-"]],
            ["button", { on: ["click", Actions.inc, 2] }, ["+"]]
        ]],
        ["div",
            AppWidget.manage<AppState>("section", sectionView, state, action)
        ]
        // ["div@section", { view: subpage, state, events }]
    ];
}

function sectionView(state: AppState, action: Action): Hsmls {
    return [
        ["h3", [state.title]],
        ["p", [
            ["em", ["Count"]], ": ", state.count,
            " ",
            ["button", { on: ["click", Actions.xXx] }, ["xXx"]]
        ]]
    ];
}

const appState: AppState = {
    title: "Counter",
    count: 77
};

const action: Action = (name: string, data: any, widget: AppWidget) => {
    console.log("action:", name, data, widget);
    switch (name) {

        case Actions.title:
            widget.state.title = data as string;
            widget.update();
            break;

        case Actions.inc:
            widget.state.count += data as number;
            widget.update();
            setTimeout(widget.action, 1e3, "dec", 1, widget); // async call
            break;

        case Actions.dec:
            const s = widget.state;
            s.count -= data as number;
            widget.update();
            break;

        default:
            console.warn("action unhandled:", name, data, widget);
            break;
    }
};

const app = new AppWidget<AppState>("app", appView, appState, action);

app.mount(document.getElementById("app"));

(self as any).app = app;
