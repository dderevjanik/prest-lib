import { AppWidget } from "../main/hsml-appwidget";
import { Hsmls } from "../main/hsml";
import { Events } from "../main/events";

interface AppState {
    title: string;
    count: number;
}

function appWiew(state: AppState, events: Events): Hsmls {
    return [
        ["h2", [state.title]],
        ["p", [
            ["em", ["Count"]], ": ", state.count,
            " ",
            // button("-", () => events.emit("dec", 1)),
            // button("+", () => events.emit("inc", 2)),
            ["button", { on: ["click", "dec", 1] }, ["-"]],
            ["button", { on: ["click", "inc", 2] }, ["+"]],
            " ",
            // button("xxx", () => events.emit("xxx"))
            ["button", { on: ["click", "xxx"] }, ["xxx"]],
        ]],
        ["div",
            AppWidget.manage<AppState>("section", sectionView, state, events)
        ]
        // ["div@section", { view: subpage, state, events }]
    ];
}

function sectionView(state: AppState, events: Events): Hsmls {
    return [
        ["h3", [state.title]],
        ["p", [
            ["em", ["Count"]], ": ", state.count.toString(),
        ]]
    ];
}

// function button(label: string, cb: (e: Event) => void): Hsml {
//     return ["button", { click: cb }, [label]];
// }

const appState: AppState = {
    title: "Counter",
    count: 77
};

const app = new AppWidget<AppState>("app", appWiew, appState);

// flux dispatcher
app.events
    .any((data, widget, event) => {
        console.log("event:", event, data, widget);
    })
    .on("inc", (num, widget) => {
        widget.events.emit("dec", 1);
    })
    .on("inc", (num, widget) => {
        widget.state.count += num;
        widget.update();
    })
    .on("dec", (num, widget) => {
        const s = widget.state;
        s.count -= num;
        widget.state = s;
    });
    // .many(
    //     {
    //         inc: (num, widget) => {
    //             widget.events.emit("dec", 1);
    //         },
    //         dec: (num, widget) => {
    //             const s = widget.state;
    //             s.count -= num;
    //             widget.state = s;
    //         }
    //     },
    //     {
    //         inc: (num, widget) => {
    //             widget.state.count += num;
    //             widget.update();
    //         }
    //     }
    // );

app.mount(document.getElementById("app"));

(self as any).app = app;
