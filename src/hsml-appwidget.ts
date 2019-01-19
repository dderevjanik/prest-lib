import { Hsmls, HsmlFnc, HsmlAttrOnData, HsmlAttrOnDataFnc } from "./hsml";
import { Widget } from "./hsml-widget";

declare const process: any;

const __NODE = typeof process === "object" && process.versions && process.versions.node;

export type Action<S = any> = (name: string, data?: any, appWidget?: AppWidget<S>) => void;

export type View<S = any> = (state: S, action: Action<S>) => Hsmls;

export class AppWidget<S = any> extends Widget {

    static manage<S>(name: string,
                     view: View<S>,
                     state: S,
                     action: Action<S>): HsmlFnc | Hsmls {
        if (__NODE) {
            return view(state, action);
        } else {
            return (e: Element) => {
                if ((e as any).widget) {
                    const w = (e as any).widget as AppWidget;
                    w.state = state;
                    w.update();
                } else {
                    const w = new AppWidget<S>(name, view, state, action);
                    w.mount(e);
                }
                return true;
            };
        }
    }

    state: S;
    view: View<S>;
    action: Action<S>;

    constructor(name: string,
                view: View<S>,
                state: S,
                action: Action<S>) {
        super(name || "AppWidget");
        this.state = state;
        this.view = view;
        this.action = action;
    }

    onMount(): void {
        this.action("_mount", this.dom, this);
    }

    onUmount(): void {
        this.action("_umount", this.dom, this);
    }

    render(): Hsmls {
        return this.view(this.state, this.action);
    }

    protected _on(action: string, data: HsmlAttrOnData, e: Event) {
        data = (data && data.constructor === Function)
            ? (data as HsmlAttrOnDataFnc)(e)
            : data;
        this.action(action, data, this);
    }

}


// TEST

// import { hsmls2htmls } from "./hsml-html";

// const action: Action = (name: string, data: any, appWidget: AppWidget) => {
//     console.log("action:", name, data, appWidget);
// };

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
//                 ["click", () => action("action-name", data)],
//             ],
//             click: e => action("action-name", data)
//         }
//     ],
//     ["button",
//         {
//             on: ["click", () => action("action-name", data)],
//             click: e => action("action-name", data)
//         },
//         ["send"]
//     ]
// ];

// console.log(hsmls2htmls(hmls).join("\n"));
