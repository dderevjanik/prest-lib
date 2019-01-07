import { jsonmls2idomPatch } from "../main/jsonml-idom";
import { JsonMLs, JsonML } from "../main/jsonml";

type Component<State> = (state: State, dispatch: Dispatch) => JsonMLs;

type Dispatch = (event: string, data?: any) => void;

type Action<State> = (event: string, data: any, state: State, dispatch: Dispatch) => State;

function render<State>(element: HTMLElement,
                       component: Component<State>,
                       state: State,
                       dispatch: Dispatch): void {
    (render as any).scheduled || ((render as any).scheduled = null);
    if (!state) return;
    if (!(render as any).scheduled) {
        (render as any).scheduled = setTimeout(() => {
            const jsonml = component(state, dispatch);
            // console.log("render", jsonml);
            jsonmls2idomPatch(element, jsonml);
            (render as any).scheduled = null;
        }, 0);
    }
}

function dispatcher<State>(element: HTMLElement,
                           component: Component<State>,
                           state: State,
                           action: Action<State>
                ): Dispatch {
    const dispatch = (event: string, data?: any): void => {
        // console.log("\ndispatch", event, data);
        const stateNew = action(event, data, state, dispatch);
        // console.log("state", stateNew);
        render(element, component, stateNew, dispatch);
    };
    return dispatch;
}

// ----------------------------------------------------------------------------

const appState = {
    title: "Counter",
    count: 0
};

type AppState = typeof appState;

function app(state: AppState, dispatch: Dispatch): JsonMLs {
    return [
        ["h2", state.title],
        ["p",
            ["em", "Count"], ": ", state.count.toString(),
            " ",
            button("-", () =>  dispatch("dec", 1)),
            button("+", () => dispatch("inc", 2)),
            " ",
            button("xxx", () => dispatch("xxx")),
        ],
    ];
}

function button(label: string, cb: (e: Event) => void): JsonML {
    return ["button", { click: cb }, label];
}

function action(event: string, data: any, state: AppState, dispatch: Dispatch): any {
    // console.log("reduce", event, data);
    switch (event) {
        case "inc":
            state.count += data;
            break;
        case "dec":
            state.count -= data;
            setTimeout(dispatch, 1e3, "dec_async", 1);
            break;
        case "dec_async":
            state.count -= data;
            break;
        default:
            console.warn("unhandled event", event, data);
            return null;
    }
    return state;
}

const appElement = document.getElementById("app");

const dispatch = dispatcher<AppState>(appElement, app, appState, action);

render(appElement, app, appState, dispatch);

dispatch("event", {});
