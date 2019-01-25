import { XWidget, Action, Manage } from "../src/hsml-xwidget";
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

class App extends XWidget<AppState> {

    state = {
        title: "Counter",
        count: 77
    };

    view = (state: AppState, action: Action, manage: Manage): Hsmls => {
        return [
            ["h2", state.title],
            ["p", [
                "Title: ",
                ["input",
                    {
                        type: "text",
                        value: state.title,
                        // on: ["input", Actions.title, e => (e.target as HTMLInputElement).value]
                        on: ["input", Actions.title]
                    }
                ],
            ]],
            ["p", [
                ["em", "Count"], ": ", state.count,
                " ",
                ["button", { on: ["click", Actions.dec, 1] }, "-"],
                ["button", { on: ["click", Actions.inc, 2] }, "+"]
            ]],
            state.title
                ? ["div", state.title ? manage<AppState>(App1, state) : "app"]
                : ""
            // ["div",
            //     // { _widget: this.app1 }
            //     // this.app1
            //     // XWidget.hsml(App1)
            //     state.title ? XWidget.hsml<AppState>(App1, state) : "app"
            // ]
        ];
    }

    onMount = (widget: XWidget<AppState>): void => {
        console.log("mount", this.type, XWidget.mounted);
    }

    onUmount = (widget: XWidget<AppState>): void => {
        console.log("umount", this.type, XWidget.mounted);
    }

    onAction = (action: string, data: any,
                { state, update, action: actionSend }: XWidget<AppState>): void => {
        console.log("action:", action, data);
        switch (action) {

            case Actions.title:
                update({ title: ((data as Event).target as HTMLInputElement).value });
                break;

            case Actions.inc:
                update({ count: state.count + data as number });
                setTimeout(actionSend, 1e3, Actions.dec, 1); // async call
                break;

            case Actions.dec:
                update({ count: state.count - data as number });
                break;

            default:
                this.actionGlobal(action, data);
                break;
        }
    }
}

class App1 extends XWidget<AppState> {

    state = {
        title: "Counter sec",
        count: 33
    };

    view = (state: AppState, action: Action): Hsmls => {
        return [
            ["h3", state.title],
            ["p", [
                ["em", "Count"], ": ", state.count,
                " ",
                ["button", { on: ["click", Actions.xXx] }, Actions.xXx]
            ]]
        ];
    }

    onMount = (): void => {
        console.log("mount", this.type, XWidget.mounted);
    }

    onUmount = (): void => {
        console.log("umount", this.type, XWidget.mounted);
    }

    onAction = (action: string, data: any): void => {
        console.log("action:", action, data);
        switch (action) {

            case Actions.xXx:
                console.log(Actions.xXx);
                break;

            default:
                this.actionGlobal(action, data);
                break;
        }
    }

}

const app = new App().mount(document.getElementById("app"));

(self as any).app = app;
