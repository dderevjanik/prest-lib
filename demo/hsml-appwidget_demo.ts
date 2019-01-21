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
            AppWidget.hsml("app1")
            // AppWidget.hsml("app1", state)
            // AppWidget.hsml("app1", state, action)
            // AppWidget.hsml<AppState>("app1", app1View, state, action)
        ]
        // ["div@app1"]
        // ["div@app1", { state }]
        // ["div@app1", { state, action }]
        // ["div@app1", { view: subpage, state, action }]
    ];
}

function app1View(state: AppState, action: Action): Hsmls {
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

const app1State: AppState = {
    title: "Counter sec",
    count: 33
};

const appAction: Action = (name: string, data: any, widget: AppWidget) => {
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

AppWidget.register("app", appView, appState, appAction);
AppWidget.register("app1", app1View, app1State, appAction);

const app = AppWidget.create("app");
// const app = new AppWidget<AppState>("app", appView, appState, appAction);

app.mount(document.getElementById("app"));

(self as any).app = app;

// Experiment

// // registera apps
// AppWidget.register("app", appView, appState, appAction);
// AppWidget.register("app1", app1View, app1State, app1Action);
// AppWidget.register("app2", app2View, app2State, app2Action);

// // create root app
// const app = AppWidget.create("app");
// // const app = AppWidget.create("app-not-registered", appView, appState, appAction);

// // const app = AppWidget.apps["app"];

// // mount app
// app.mount(document.getElementById("app"));

// AppWidget.hsml("app");
// AppWidget.hsml("app", appState);

// // in HSML:
// // ["div@appN"]
// // will do this:
// // ["div", AppWidget.hsml("appN") ]
