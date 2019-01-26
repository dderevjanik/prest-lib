import { Hsml, Hsmls, HsmlFnc, HsmlAttrOnData, HsmlAttrOnDataFnc } from "./hsml";
import { Ctx, hsmls2html } from "./hsml-html";

export type Class<T = object> = new (...args: any[]) => T;

export type Manage = <S>(xwClass: Class<IXWidget<S>>, state?: S) => HsmlFnc | Hsmls;

export type View<S> = (state: S, action: Action, manage: Manage) => Hsmls;

export type Action = (action: string, data?: any) => void;

export type OnAction<S> = (action: string, data: any, widget: XWidget<S>) => void;

export interface IXWidget<S> {
    state: S;
    view: View<S>;
    onAction: OnAction<S>;
}

export const xwidget = <S>(xwClass: Class<IXWidget<S>>,
                           state: S,
                           onHtml: (html: string) => void,
                           pretty = false) => {
    const w = XWidget.create<S>(xwClass);
    state && (w.state = state);
    hsmls2html(w.render(), html => console.log(html), true);
};

export class XWidget<S> implements Ctx, IXWidget<S> {

    private static __count = 0;

    static readonly mounted: { [wid: string]: XWidget<any> } = {};

    static create = <S>(xwClass: Class<IXWidget<S>>): XWidget<S> => {
        const w = new XWidget<S>();
        console.log(xwClass);
        // xwClass.apply(w);
        xwClass.call(w);
        (w as any).type = xwClass.name;
        return w;
    }

    static onAction: OnAction<any> = (action: string, data: any, widget: XWidget<any>) => {
        console.log("action:", action, data, widget);
    }

    static hsml: Manage = <S>(xwClass: Class<IXWidget<S>>,
                              state?: S): HsmlFnc | Hsmls  => {
        // if (__NODE) {
        return xwClass.prototype.view(state, actionNode);
        // } else {
        // return (e: Element) => {
        //     if ((e as any).widget) {
        //         const w = (e as any).widget as XWidget<S>;
        //         if (state !== undefined) {
        //             w.state = state;
        //         }
        //         w.update();
        //     } else {
        //         const w = XWidget.create<S>(xwClass);
        //         if (state !== undefined) {
        //             w.state = state;
        //         }
        //         w.mount(e);
        //     }
        //     return true;
        // };
        // }
    }

    readonly type: string = this.constructor.name; // "XWidget"
    readonly id: string = this.type + "-" + XWidget.__count++;
    readonly dom: Element;
    readonly refs: { [key: string]: HTMLElement } = {};

    private __updateSched: number;

    state = {} as S;
    view = (state: S, action: Action, manage: Manage): Hsmls => undefined;
    onAction = (action: string, data: any, widget: XWidget<S>): void => undefined;

    action = (action: string, data?: any): void => {
        this.onAction(action, data, this);
    }

    actionGlobal = (action: string, data?: any): void => {
        XWidget.onAction(action, data, this);
    }

    render = (): Hsmls => {
        console.log(this.view);
        return this.view(this.state, this.action, XWidget.hsml);
    }

    onHsml = (action: string, data: HsmlAttrOnData, e: Event): void => {
        data = (data && data.constructor === Function)
            ? (data as HsmlAttrOnDataFnc)(e)
            : data || e;
        this.action(action, data);
    }

    mount = (e: Element = document.body): this => {
        !e && console.warn("invalit element", e);
        // if (!__NODE) {
        // if (e) {
        //     if ("widget" in e) {
        //         const w = (e as any).widget as XWidget<S>;
        //         w && w.umount();
        //     }
        //     if (!this.dom) {
        //         XWidget.mounted[this.id] = this;
        //         (this as any).dom = e;
        //         (e as any).widget = this;
        //         const hsmls = (this as any).render();
        //         hsmls2idomPatch(e, hsmls, this);
        //         e.setAttribute("widget", this.type);
        //         this.action("_mount", this.dom);
        //     }
        // }
        // }
        return this;
    }

    umount = (): this => {
        // if (!__NODE) {
        // if (this.dom) {
        //     delete XWidget.mounted[this.id];
        //     this.action("_umount", this.dom);
        //     if (this.dom.hasAttribute("widget")) {
        //         this.dom.removeAttribute("widget");
        //     }
        //     const wNodes = this.dom.querySelectorAll("[widget]");
        //     for (let i = 0; i < wNodes.length; i++) {
        //         const w = (wNodes[i] as any).widget as XWidget<S>;
        //         w && w.umount();
        //     }
        //     while (this.dom.firstChild /*.hasChildNodes()*/) {
        //         this.dom.removeChild(this.dom.firstChild);
        //     }
        //     delete (this.dom as any).widget;
        //     (this as any).dom = undefined;
        // }
        // }
        return this;
    }

    update = (state?: Partial<S>): this => {
        // if (!__NODE) {
        // if (state) {
        //     this.state = merge(this.state, state);
        // }
        // if (this.dom && !this.__updateSched) {
        //     this.__updateSched = setTimeout(() => {
        //         if (this.dom) {
        //             hsmls2idomPatch(this.dom, this.render(), this);
        //         }
        //         this.__updateSched = null;
        //     }, 0);
        // }
        // }
        return this;
    }

    toHsml = (): Hsml => {
        if (this.dom) {
            if (this.__updateSched) {
                clearTimeout(this.__updateSched);
                this.__updateSched = undefined;
            } else {
                return (
                    ["div",
                        {
                            _skip: true,
                            _id: this.id,
                            _key: this.id,
                            widget: this.type
                        }
                    ]
                );
            }
        }
        const hsmls = (this as any).render() as Hsmls;
        // if (!__NODE) {
        // hsmls.push(
        //     (e: Element) => {
        //         if (!this.dom) {
        //             (this as any).dom = e;
        //             (e as any).widget = this;
        //             this.action("_mount", this.dom);
        //         }
        //     });
        // }
        return (
            ["div",
                {
                    _id: this.id,
                    _key: this.id,
                    widget: this.type
                },
                hsmls
            ]
        );
    }

}

// if (!__NODE) {
// (idom as any).notifications.nodesDeleted = (nodes: Node[]) => {
//     nodes.forEach(node => {
//         if (node.nodeType === 1 && "widget" in node) {
//             const w = (node as any).widget as XWidget<any>;
//             w && w.umount();
//         }
//     });
// };
// }

const actionNode: Action = (action: string, data?: any) => { };

// const merge = <T extends { [k: string]: any }>(target: T, source: Partial<T>): T => {
//     if (isMergeble(target) && isMergeble(source)) {
//         Object.keys(source).forEach(key => {
//             if (isMergeble(source[key])) {
//                 if (!target[key]) {
//                     target[key] = {};
//                 }
//                 merge(target[key], source[key]);
//             } else {
//                 target[key] = source[key];
//             }
//         });
//     } else {
//         console.warn("unable merge", target, source);
//     }
//     return target;
// };

// const isObject = (item: any): boolean => {
//     return item !== null && typeof item === "object";
// };

// const isMergeble = (item: object): boolean => {
//     return isObject(item) && !Array.isArray(item);
// };
