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
        ["p", state.count.toString()],
        button<number>({ label: "-", event: { type: "dec", data: 2 } }, events),
        button<number>({ label: "+", event: { type: "inc", data: 2 } }, events)
    ];
}

interface ButtonState<T> {
    label: string;
    event: {
        type: string;
        data: T;
    };
}

function button<T>(state: ButtonState<T>, events: Events): JsonML {
    const { type, data } = state.event;
    return ["button", { click: () => events.emit(type, data) }, state.label];
}

const app = new WidgetC<PageState>({ title: "Counter", count: 77 }, page);

// flux dispatcher
app.events
    .on("", (data, widget, event) => {
        console.log("event:", data, event, widget);
    })
    .on("inc", (num, app) => {
        app.events.emit("dec", 1);
    })
    .on("inc", (num, app) => {
        app.state.count += num;
        app.update();
    })
    .on("dec", (num, app) => {
        const s = app.state;
        s.count -= num;
        app.state = s;
    });
    // .cbs(
    //     {
    //         inc: (num, app) => {
    //             app.events.emit("dec", 1);
    //         },
    //         dec: (num, app) => {
    //             const s = app.state;
    //             s.count -= num;
    //             app.state = s;
    //         }
    //     },
    //     {
    //         inc: (num, app) => {
    //             app.state.count += num;
    //             app.update();
    //         }
    //     }
    // );

app.mount(document.getElementById("app"));

(self as any).app = app;
