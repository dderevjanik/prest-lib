import { Hsml, Hsmls, HsmlFnc, HsmlAttrOnData, HsmlAttrOnDataFnc } from "./hsml";
import { Ctx, hsmls2html } from "./hsml-html";

export type Class<T = object> = new (...args: any[]) => T;

export type Manage = <S>(xwClass: Class<Widget<S>>, state?: S) => HsmlFnc | Hsmls;

export type View<S> = (state: S, action: Action, manage: Manage) => Hsmls;

export type Action = (action: string, data?: any) => void;

export type OnAction<S> = (action: string, data: any, xwidget: XWidget<S>) => void;

export interface Widget<S> {
    state: S;
    view(state: S, action: Action, manage: Manage): Hsmls;
    onAction(action: string, data: any, widget: Widget<S>): void;
}

export function xWidgetHtml<S>(wClass: Class<Widget<S>>,
                               state: S,
                               onHtml: (html: string) => void,
                               pretty = false) {
    const w = xWidget<S>(wClass);
    state && (w.state = state);
    hsmls2html(w.render(), onHtml, true);
}

export interface XWidget<S> extends Ctx, Widget<S> {
    widgets: Widgets;
    type: string;
    id: string;
    dom: Element;
    state: S;
    action: Action;
    actionGlobal: Action;
    render: () => Hsmls;
    mount: (e: Element) => this;
    umount: () => this;
    update: (state?: Partial<S>) => this;
    toHsml: () => Hsml;
}

export interface Widgets {
    readonly mounted: { [wid: string]: XWidget<any> };
    onActionGlobal: OnAction<any>;
}

const widgets: Widgets = {
    mounted: {},
    onActionGlobal: (action: string, data: any, widget: XWidget<any>): void => {
        console.log("action:", action, data, widget);
    }
};

let __count = 0;

const manage: Manage = <S>(wClass: Class<Widget<S>>, state?: S): HsmlFnc | Hsmls  => {
    return new wClass().view(state, actionNode, manage);
};

export function xWidget<S>(wClass: Class<Widget<S>>): XWidget<S> {

    class XW extends wClass implements Ctx, Widget<S> {

        readonly widgets = widgets;

        readonly type: string = this.constructor.name; // "XWidget"
        readonly id: string = this.type + "-" + __count++;
        readonly dom: Element;
        readonly refs: { [key: string]: HTMLElement } = {};

        private __updateSched: number;

        action = (action: string, data?: any): void => {
            this.onAction(action, data, this);
        }

        actionGlobal = (action: string, data?: any): void => {
            this.widgets.onActionGlobal(action, data, this);
        }

        render = (): Hsmls => {
            return this.view(this.state, this.action, manage);
        }

        onHsml = (action: string, data: HsmlAttrOnData, e: Event): void => {
            data = (data && data.constructor === Function)
                ? (data as HsmlAttrOnDataFnc)(e)
                : data || e;
            this.action(action, data);
        }

        mount = (e: Element = document.body): this => {
            return this;
        }

        umount = (): this => {
            return this;
        }

        update = (state?: Partial<S>): this => {
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
            const hsmls = this.render() as Hsmls;
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

    const w = new XW();
    (w as any).type = wClass.name;
    return w;
}

const actionNode: Action = (action: string, data: any) => { };
