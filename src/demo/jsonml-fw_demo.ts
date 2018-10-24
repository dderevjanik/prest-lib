import { jsonmls2idomPatch } from "../main/jsonml-idom";
import { JsonMLs, JsonML } from "../main/jsonml";

class Store<State> {
    private _state: State;
    private _onChange: (state: State) => void;
    constructor(state: State) {
        this._state = state;
    }
    getState(): State {
        return this._state;
    }
    setState(state: State): void {
        this._state = state;
        this._onChange && this._onChange(this._state);
    }
    onChange(onChange: (state: State) => void): void {
        this._onChange = onChange;
    }
}

type Dispatch = (event: string, data?: any) => void;

type Action<State> = (state: State, data: any, dispatch: Dispatch, event: string) => State;

type Reducer<State> = { [name: string]: Action<State> };

type Component<State> = (state: State, dispatch: Dispatch) => JsonMLs;

class Dispatcher<State> {
    private _store: Store<State>;
    private _reducer: Reducer<State>;
    private _dispatch: (event: string, data: any) => void;
    constructor(store: Store<State>, reducer: Reducer<State>) {
        this._store = store;
        this._reducer = reducer;
        this._dispatch = (event: string, data: any) => this.dispatch(event, data);

    }
    dispatch(event: string, data: any): void {
        // console.log(event);
        const reducer = this._reducer[event];
        if (reducer) {
            const stateNew = reducer(this._store.getState(), data, this._dispatch, event);
            if (stateNew) {
                this._store.setState(stateNew);
            }
        } else {
            console.error("no handler for:", event, data);
        }
    }
}

class Renderer<State> {
    private _e: HTMLElement;
    private _component: Component<State>;
    // private _dispatcher: Dispatcher<State>;
    private _scheduled: number;
    constructor(e: HTMLElement,
                component: Component<State>
                // dispatcher: Dispatcher<State>
                ) {
        this._e = e;
        this._component = component;
        // this._dispatcher = dispatcher;
    }
    render(state: State, dispatch: Dispatch): void {
        if (!state) return;
        if (!this._scheduled) {
            this._scheduled = setTimeout(() => {
                const jsonml = this._component(state, dispatch);
                // console.log("render", jsonml);
                jsonmls2idomPatch(this._e, jsonml);
                this._scheduled = null;
            }, 0);
        }
    }
}

function mount<State>(element: HTMLElement,
                      state: State,
                      component: Component<State>,
                      reducer: Reducer<State>): Dispatch {
    const store = new Store<State>(state);
    const dispatcher = new Dispatcher<State>(store, reducer);
    const dispatch = (event: string, data: any) => dispatcher.dispatch(event, data);
    const renderer = new Renderer<State>(element, component);
    store.onChange(state => renderer.render(state, dispatch));
    renderer.render(state, dispatch);
    return (event: string, data?: any) => dispatcher.dispatch(event, data);
}

// ----------------------------------------------------------------------------

const appState = {
    title: "Title",
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

const appReducer: Reducer<AppState> = {
    inc: (state: AppState, data: any, dispatch: Dispatch, event: string): AppState => {
        state.count += data;
        return state;
    },
    dec: (state: AppState, data: any, dispatch: Dispatch, event: string): AppState => {
        state.count -= data;
        setTimeout(() => dispatch("dec_async", 1), 1e3);
        return state;
    },
    dec_async: (state: AppState, data: any, dispatch: Dispatch, event: string): AppState => {
        state.count -= data;
        return state;
    }
};

const appElement = document.getElementById("app");

const dispatch = mount<AppState>(appElement, appState, app, appReducer);

dispatch("event", {});
