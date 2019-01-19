import { Hsmls, HsmlFnc, HsmlAttrOnData, HsmlAttrOnDataFnc } from "./hsml";
import { Widget } from "./hsml-widget";
import { Events } from "./events";

declare const process: any;

const __NODE = typeof process === "object" && process.versions && process.versions.node;

export type View<S> = (state: S, events: Events<AppWidget<S>>) => Hsmls;

export class AppWidget<S = any> extends Widget {

    static manage<S>(name: string,
                     view: View<S>,
                     state: S,
                     events?: Events): HsmlFnc | Hsmls {
        if (__NODE) {
            return view(state, events);
        } else {
            return (e: Element) => {
                if ((e as any).widget) {
                    const w = (e as any).widget as AppWidget;
                    w.state = state;
                } else {
                    const w = new AppWidget<S>(name, view, state, events);
                    w.mount(e);
                }
                return true;
            };
        }
    }

    private _state: S;

    readonly view: View<S>;
    readonly events: Events<AppWidget<S>>;

    constructor(name: string,
                view: View<S>,
                state: S,
                events?: Events) {
        super(name || "AppWidget");
        this._state = state;
        this.view = view;
        this.events = events ? events : new Events<AppWidget<S>>(this);
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

    render(): Hsmls {
        return this.view(this._state, this.events);
    }

    protected _on(action: string, data: HsmlAttrOnData, e: Event) {
        this.events.emit(action,
            (data && data.constructor === Function)
                ? (data as HsmlAttrOnDataFnc)(e)
                : data);
    }

}


// TEST

// import { hsmls2htmls } from "./hsml-html";

// const events = new Events();
// const data = { attr: "action-data" };

// const hmls: Hsmls = [
//     ["button",
//         { on: ["click", "action", data] },
//         ["send"]
//     ],
//     ["input",
//         {
//             on: [
//                 ["mouseover", "hover-action", data],
//                 ["change", "click-action", e => (e.target as HTMLInputElement).value],
//                 ["click", () => { events.emit("action-name", data); }],
//             ],
//             click: e => { events.emit("action-name", data); }
//         }
//     ],
//     ["button",
//         {
//             on: ["click", () => { events.emit("action-name", data); }],
//             click: e => { events.emit("action-name", data); }
//         },
//         ["send"]
//     ]
// ];

// console.log(hsmls2htmls(hmls));
