import { WidgetE } from "../main/widgete";
import { JsonMLs, JsonML } from "../main/jsonml";

interface State {
    title: string;
    count: number;
}

class AppWidget extends WidgetE<State> {

    constructor(state: State) {
        super("AppWidget", state);
    }

    render(): JsonMLs {
        return [
            ["h2", this._state.title],
            ["p", this._state.count.toString()],
            button("-", this.dec),
            button("+", this.inc)
        ];
    }

    private dec = () => {
        this.events.emit("dec", 2);
    }

    private inc = () => {
        this.events.emit("inc", 2);
    }

}

function button(label: string, cb: (e: Event) => void): JsonML {
    return ["button", { click: cb }, label];
}

const app = new AppWidget({ title: "Counter", count: 77 })
    .mount(document.getElementById("app"));

// flux dispatcher
app.events
    .on("", (data, widget, event) => {
        console.log("event:", data, event, widget);
    })
    .on("inc", (num, widget) => {
        widget.events.emit("dec", 1);
    })
    .on("inc", (num, widget) => {
        widget.getState().count += num;
        widget.update();
    })
    .on("dec", (num, widget) => {
        const s = widget.getState();
        s.count -= num;
        widget.setState(s);
    });
    // .cbs(
    //     {
    //         inc: (num, widget) => {
    //             widget.events.emit("dec", 1);
    //         },
    //         dec: (num, widget) => {
    //             const s = widget.getState();
    //             s.count -= num;
    //             widget.setState(s);
    //         }
    //     },
    //     {
    //         inc: (num, widget) => {
    //             widget.getState().count += num;
    //             widget.update();
    //         }
    //     }
    // );

(self as any).app = app;
