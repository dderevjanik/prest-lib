import { jsonmls2idomPatch } from "../main/jsonml-idom";
import { JsonMLs, JsonML } from "../main/jsonml";

const state = {
    title: "Counter",
    count: 0
};

let renderScheduled: number = null;
function dispatch(event: string, data?: any): void {
    console.log("\ndispatch", event, data);
    const stateNew = reduce(state, dispatch, event, data);
    console.log("state", stateNew);
    if (stateNew && !renderScheduled) {
        renderScheduled = setTimeout(() => {
            render(stateNew);
            renderScheduled = null;
        }, 0);
    }
}

function reduce(state: any,
                dispatch: (event: string, data: any) => void,
                event: string,
                data: any): any {
    console.log("reduce", event, data);
    switch (event) {
        case "inc":
            state.count += data;
            break;
        case "dec":
            state.count -= data;
            setTimeout(() => dispatch("dec-async", 1), 0);
            break;
        case "dec-async":
            state.count -= data;
            return null;
        default:
            console.warn("unhandled event", event, data);
            return null;
    }
    return state;
}

function app(state: any, dispatch: (event: string, data?: any) => void): JsonMLs {
    function dec() { dispatch("dec", 1); }
    function inc() { dispatch("inc", 2); }
    function xxx() { dispatch("xxx"); }
    return [
        ["h2", state.title],
        ["p",
            ["em", "Count"], ": ", state.count.toString(),
            " ",
            button("-", dec),
            button("+", inc),
            " ",
            button("xxx", xxx),
        ],
    ];
}

function button(label: string, cb: (e: Event) => void): JsonML {
    return ["button", { click: cb }, label];
}

const appElement = document.getElementById("app");

function render(state: any): void {
    const jsonml = app(state, dispatch);
    console.log("render", jsonml);
    jsonmls2idomPatch(appElement, jsonml);
}

render(state);
