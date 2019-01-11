import { AppWidget } from "../main/hsml-appwidget";
import { Hsmls, Hsml } from "../main/hsml";
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
            button("-", () => events.emit("dec", 1)),
            button("+", () => events.emit("inc", 2)),
            " ",
            button("xxx", () => events.emit("xxx")),
        ]],
        ["div", [
            AppWidget.hsmlFnc<AppState>(sectionView, state, events)
            // subpage(state, events)
        ]]
        // ["div@c_name", { view: subpage, state, events }]
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

function button(label: string, cb: (e: Event) => void): Hsml {
    return ["button", { click: cb }, [label]];
}

const appState: AppState = {
    title: "Counter",
    count: 77
};

const app = new AppWidget<AppState>(appWiew, appState);

// flux dispatcher
app.events
    .any((data, container, event) => {
        console.log("event:", event, data, container);
    })
    .on("inc", (num, container) => {
        container.events.emit("dec", 1);
    })
    .on("inc", (num, container) => {
        container.state.count += num;
        container.update();
    })
    .on("dec", (num, container) => {
        const s = container.state;
        s.count -= num;
        container.state = s;
    });
    // .many(
    //     {
    //         inc: (num, container) => {
    //             container.events.emit("dec", 1);
    //         },
    //         dec: (num, container) => {
    //             const s = container.state;
    //             s.count -= num;
    //             container.state = s;
    //         }
    //     },
    //     {
    //         inc: (num, container) => {
    //             container.state.count += num;
    //             container.update();
    //         }
    //     }
    // );

app.mount(document.getElementById("app"));

(self as any).app = app;
