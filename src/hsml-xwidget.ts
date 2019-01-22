import { Hsmls, HsmlFnc, HsmlAttrOnData, HsmlAttrOnDataFnc } from "./hsml";
import { Widget } from "./hsml-widget";

declare const process: any;

const __NODE = typeof process === "object" && process.versions && process.versions.node;

export type Action<S = any> = (name: string, data?: any, xWidget?: XWidget<S>) => void;

export type View<S = any> = (state: S, action: Action<S>) => Hsmls;

export type Defs<S = any> = {
    [name: string]: {
        view: View<S>,
        state: S,
        action: Action<S>
    }
};

export class XWidget<S = any> extends Widget {

    static defs: Defs = {};

    static def<S = any>(name: string,
                        view: View<S>,
                        state: S,
                        action: Action<S>): void {
        XWidget.defs[name] = { view, state, action };
    }

    static create(name: string): XWidget {
        const reg = XWidget.defs[name];
        return reg
            ? new XWidget(name, reg.view, reg.state, reg.action)
            : undefined;
    }

    static hsml<S = any>(name: string,
                         state?: S,
                         action?: Action<S>): HsmlFnc | Hsmls {
        const reg = XWidget.defs[name];
        if (!reg) {
            console.error("XWidget unregistered name:", name);
            return undefined;
        }
        if (__NODE) {
            return reg.view(reg.state, reg.action);
        } else {
            return (e: Element) => {
                if ((e as any).widget) {
                    const w = (e as any).widget as XWidget;
                    if (state !== undefined) {
                        w.state = state;
                    }
                    w.update();
                } else {
                    const w = new XWidget(name, reg.view,
                        state === undefined ? reg.state : state,
                        action === undefined ? reg.action : action);
                    w.mount(e);
                }
                return true;
            };
        }
    }

    readonly name: string;

    state: S;
    view: View<S>;
    action: Action<S>;

    constructor(name: string,
                view: View<S>,
                state: S,
                action: Action<S>) {
        super("XWidget");
        this.name = name;
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

    onHsml(action: string, data: HsmlAttrOnData, e: Event): void {
        data = (data && data.constructor === Function)
            ? (data as HsmlAttrOnDataFnc)(e)
            : data;
        this.action(action, data, this);
    }

}


// TEST

// import { hsmls2htmls } from "./hsml-html";

// const action: Action = (name: string, data: any, xWidget: XWidget) => {
//     console.log("action:", name, data, xWidget);
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
