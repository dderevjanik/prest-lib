import { Widget } from "./widget";
import { JsonMLs } from "../main/jsonml";
import { Events } from "./events";

export type Component<S> = (state: S, events: Events<WidgetC<S>>) => JsonMLs;

export class WidgetC<S> extends Widget {

    private _state: S;
    private _component: Component<S>;

    readonly events: Events<WidgetC<S>>;

    constructor(state: S,
                component: Component<S>,
                events?: Events<any>) {
        super("AppWidget");
        this._state = state;
        this._component = component;
        this.events = events ? events : new Events<WidgetC<S>>(this);
    }

    onMount(): void {
        this.events.emit("_mount_");
    }

    onUmount(): void {
        this.events.emit("_umount_");
    }

    set state(state: S) {
        this._state = state;
        this.update();
    }

    get state(): S {
        return this._state;
    }

    render(): JsonMLs {
        return this._component(this._state, this.events);
    }

}
