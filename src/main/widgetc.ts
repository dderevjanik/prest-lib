import { Widget } from "./widget";
import { JsonMLs, JsonMLFnc } from "./jsonml";
import { Events } from "./events";

// export type Action = (e: string, data?: any) => void;
// export type Component<S> = (state: S, action: Action) => JsonMLs;
export type Component<S> = (state: S, events: Events<WidgetC<S>>) => JsonMLs;

export class WidgetC<S = any> extends Widget {

    static jsonMlFnc<S>(component: Component<S>, state: S, events: Events): JsonMLFnc {
        return (e: Element) => {
            // console.log("--->", e, (e as any).widget);
            if ((e as any).widget) {
                const w = (e as any).widget as WidgetC;
                w.state = state;
            } else {
                const w = new WidgetC<S>(component, state, events);
                w.mount(e);
            }
            return true;
        };
    }

    private _component: Component<S>;
    private _state: S;

    readonly events: Events<WidgetC<S>>;

    constructor(component: Component<S>,
                state: S,
                events?: Events) {
        super("WidgetC");
        this._state = state;
        this._component = component;
        this.events = events ? events : new Events<WidgetC<S>>(this);
    }

    onMount(): void {
        this.events.emit("_mount", this);
    }

    onUmount(): void {
        this.events.emit("_umount", this);
    }

    set state(state: S) {
        this._state = state;
        this.update();
    }

    get state(): S {
        return this._state;
    }

    render(): JsonMLs {
        // console.log("--->", "render");
        // return this._component(this._state, this.action);
        return this._component(this._state, this.events);
    }

    // private action = (e: string, data?: any) => this.events.emit(e, data);

}
