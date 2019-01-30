import { AWidget, Action } from "../src/hsml-awidget";
import { Hsmls } from "../src/hsml";

interface AppState {
    title: string;
    count: number;
}

enum AppActions {
    title = "title",
    dec = "dec",
    inc = "inc",
    xXx = "xXx"
}

class App extends AWidget<AppState> {

    state = {
        title: "Counter",
        count: 77
    };

    view(state: AppState, action: Action): Hsmls {
        return [
            ["h2", state.title],
            ["p", [
                "Title: ",
                ["input",
                    {
                        type: "text",
                        value: state.title,
                        // on: ["input", Actions.title, e => (e.target as HTMLInputElement).value]
                        on: ["input", AppActions.title]
                    }
                ],
            ]],
            ["p", [
                ["em", "Count"], ": ", state.count,
                " ",
                ["button", { on: ["click", AppActions.dec, 1] }, "-"],
                ["button", { on: ["click", AppActions.inc, 2] }, "+"],
                ["button", { on: ["click", AppActions.xXx] }, AppActions.xXx]
            ]]
        ];
    }

    onAction(action: string, data: any,
             { state, update, action: actionLocal, actionGlobal }: AWidget<AppState>): void {
        // console.log("action:", action, data);
        switch (action) {
            case AppActions.title:
                const title = ((data as Event).target as HTMLInputElement).value;
                update({ title });
                break;
            case AppActions.inc:
                update({ count: state.count + data as number });
                setTimeout(actionLocal, 1e3, AppActions.dec, 1); // async call
                break;
            case AppActions.dec:
                update({ count: state.count - data as number });
                break;
            default:
                actionGlobal(action, data);
                break;
        }
    }
}


AWidget.onActionGlobal = (action: string, data: any,
                          { update }: AWidget<AppState>): void => {
    console.log(action, data);
    switch (action) {
        case "xXx": update({ title: "xXx" }); break;
        default: break;
    }
};

const app = new App().mount(document.getElementById("app"));

(self as any).app = app;
