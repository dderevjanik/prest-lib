import { WidgetC } from "../main/widgetc";
import { JsonMLs, JsonML } from "../main/jsonml";
import { Events } from "../main/events";

interface PageState {
    title: string;
    count: number;
}

function page(state: PageState, events: Events): JsonMLs {
    return [
        ["h2", state.title],
        ["p",
            ["em", "Count"], ": ", state.count.toString(),
            " ",
            button("-", () => events.emit("dec", 1)),
            button("+", () => events.emit("inc", 2)),
            " ",
            button("xxx", () => events.emit("xxx")),
        ],
        ["div",
            WidgetC.jsonMlFnc<PageState>(subpage, state, events)
        ]
    ];
}

// function subpage(state: PageState, action: Action): JsonMLs {
function subpage(state: PageState, events: Events): JsonMLs {
    return [
        ["h3", state.title],
        ["p",
            ["em", "Count"], ": ", state.count.toString(),
        ]
    ];
}

function button(label: string, cb: (e: Event) => void): JsonML {
    return ["button", { click: cb }, label];
}

const state: PageState = {
    title: "Counter",
    count: 77
};

const app = new WidgetC<PageState>(page, state);

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
