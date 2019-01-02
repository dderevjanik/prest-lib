import * as numeral from "numeral";
import * as moment from "moment";
import { Moment } from "moment";

const required_msg = "required";
const not_in_range_msg = "not_in_range";
const invalid_format_msg = "invalid_format";
const invalid_option_msg = "invalid_option";
const locale_default = "en";
const format_default = "L";

export abstract class Validator<T, O, M> {

    readonly opts: O;
    readonly msgs: M;

    readonly str: string;
    readonly err: string;
    readonly obj: T;

    constructor(opts?: O, msgs?: M) {
        this.opts = opts;
        this.msgs = msgs;
    }

    protected abstract strToObj(str: string): { obj?: T, err?: string };

    protected abstract objCheck(obj: T): string;

    protected abstract objToStr(obj: T): { str?: string, err?: string };

    validate(str: string): { str?: string, obj?: T, err?: string } {
        (this.str as any) = str;
        const ots = this.strToObj(str);
        if (ots.err) {
            (this.err as any) = ots.err;
            return { str, err: ots.err };
        }
        const err = this.objCheck(ots.obj);
        if (err) {
            (this.err as any) = err;
            return { str, err };
        }
        (this.obj as any) = ots.obj;
        return { str, obj: ots.obj };
    }

    format(obj: T): { str?: string, err?: string } {
        const err = this.objCheck(obj);
        const ots = this.objToStr(obj);
        return { str: ots.str, err: ots.err ? ots.err : err };
    }

}

export interface SelectValidatorOpts {
    required?: boolean;
    options?: string[];
}

export interface SelectValidatorMsgs {
    required?: string;
    invalid_option?: string;
}

export class SelectValidator extends Validator<string, SelectValidatorOpts, SelectValidatorMsgs> {

    constructor(opts?: SelectValidatorOpts, msgs?: SelectValidatorMsgs) {
        super(opts, msgs);
    }

    protected strToObj(str: string): { obj?: string, err?: string } {
        const opts = this.opts;
        const msgs = this.msgs;
        if ("required" in opts) {
            if (opts.required && !str) {
                return { err: msgs && msgs.required ? msgs.required : required_msg };
            }
        }
        return { obj: str };
    }

    protected objCheck(obj: string): string {
        const opts = this.opts;
        const msgs = this.msgs;
        if ("options" in opts) {
            if (opts.options.indexOf(obj) === -1) {
                return msgs && msgs.invalid_option ? msgs.invalid_option : invalid_option_msg;
            }
        }
        return undefined;
    }

    protected objToStr(obj: string): { str?: string, err?: string } {
        return { str: obj };
    }

}

export interface StringValidatorOpts {
    required?: boolean;
    min?: number;
    max?: number;
    regexp?: RegExp;
}

export interface StringValidatorMsgs {
    required?: string;
    invalid_format?: string;
    not_in_range?: string;
}

export class StringValidator extends Validator<string, StringValidatorOpts, StringValidatorMsgs> {

    constructor(opts?: StringValidatorOpts, msgs?: StringValidatorMsgs) {
        super(opts, msgs);
    }

    protected strToObj(str: string): { obj?: string, err?: string } {
        const opts = this.opts;
        const msgs = this.msgs;
        if ("required" in opts) {
            if (opts.required && !str) {
                return { err: msgs && msgs.required ? msgs.required : required_msg };
            }
        }
        if ("regexp" in opts) {
            if (!str.match(opts.regexp)) {
                return { err: msgs && msgs.invalid_format
                    ? msgs.invalid_format
                    : invalid_format_msg };
            }
        }
        return { obj: str };
    }

    protected objCheck(obj: string): string {
        const opts = this.opts;
        const msgs = this.msgs;
        if ("max" in opts) {
            if (obj.length > opts.max) {
                return msgs && msgs.not_in_range ? msgs.not_in_range : not_in_range_msg;
            }
        }
        if ("min" in opts) {
            if (obj.length < opts.min) {
                return msgs && msgs.not_in_range ? msgs.not_in_range : not_in_range_msg;
            }
        }
        if ("min" in opts && "max" in opts) {
            if (obj.length > opts.max && obj.length < opts.min) {
                return msgs && msgs.not_in_range ? msgs.not_in_range : not_in_range_msg;
            }
        }
        return undefined;
    }

    protected objToStr(obj: string): { str?: string, err?: string } {
        return { str: obj };
    }

}

export const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;


export interface NumberValidatorOpts {
    required?: boolean;
    min?: number;
    max?: number;
    locale?: string;
}

export interface NumberValidatorMsgs {
    required?: string;
    invalid_format?: string;
    not_in_range?: string;
}

export class NumberValidator extends Validator<Numeral, NumberValidatorOpts, NumberValidatorMsgs> {

    constructor(opts?: NumberValidatorOpts, msgs?: NumberValidatorMsgs) {
        super(opts, msgs);
    }

    protected strToObj(str: string): { obj?: Numeral, err?: string } {
        const opts = this.opts;
        const msgs = this.msgs;
        if ("required" in opts) {
            if (opts.required && !str) {
                return { err: msgs && msgs.required ? msgs.required : required_msg };
            }
        }
        numeral.locale(opts.locale ? opts.locale : locale_default);
        const n = numeral(str);
        if (n.value() === null) {
            return {
                err: msgs && msgs.invalid_format
                    ? `${msgs.invalid_format} ${this.objToStr(1234.45 as any).str}`
                    : invalid_format_msg
                };
        }
        return { obj: n };
    }

    protected objCheck(obj: Numeral): string {
        if (obj.constructor === Number) {
            obj = numeral(obj);
        }
        const opts = this.opts;
        const msgs = this.msgs;
        if ("max" in opts) {
            if (obj.value() > opts.max) {
                return msgs && msgs.not_in_range ? msgs.not_in_range : not_in_range_msg;
            }
        }
        if ("min" in opts) {
            if (obj.value() < opts.min) {
                return msgs && msgs.not_in_range ? msgs.not_in_range : not_in_range_msg;
            }
        }
        if ("min" in opts && "max" in opts) {
            if (obj.value() > opts.max && obj.value() < opts.min) {
                return msgs && msgs.not_in_range ? msgs.not_in_range : not_in_range_msg;
            }
        }
        return undefined;
    }

    protected objToStr(obj: Numeral): { str?: string, err?: string } {
        if (obj.constructor === Number) {
            obj = numeral(obj);
        }
        return { str: obj ? obj.format() : undefined };
    }

}

export interface DateValidatorOpts {
    required?: boolean;
    min?: moment.Moment;
    max?: moment.Moment;
    locale?: string;
    format?: string;
    parsedValue?: string;
}

export interface DateValidatorMsgs {
    required?: string;
    invalid_format?: string;
    not_in_range?: string;
}

export class DateValidator extends Validator<Moment, DateValidatorOpts, DateValidatorMsgs> {

    constructor(opts?: DateValidatorOpts, msgs?: DateValidatorMsgs) {
        super(opts, msgs);
    }

    protected strToObj(str: string): { obj?: Moment, err?: string } {
        const opts = this.opts;
        const msgs = this.msgs;
        if ("required" in opts) {
            if (opts.required && !str) {
                return {
                    err: msgs && msgs.required ? msgs.required : required_msg };
            }
        }
        const d = moment(str, opts && (opts.format || format_default), opts && (opts.locale || locale_default));
        if (!d.isValid() || (opts && opts.parsedValue && opts.parsedValue !== str)) {
            return {
                err: msgs && msgs.invalid_format
                    ? `${msgs.invalid_format} ${this.objToStr(new Date() as any).str}`
                    : invalid_format_msg
            };
        }
        return { obj: d };
    }

    protected objCheck(obj: Moment): string {
        if (obj.constructor === Date) {
            obj = moment(obj);
        }
        const opts = this.opts;
        const msgs = this.msgs;
        if ("max" in opts) {
            if (obj.isAfter(opts.max)) {
                return msgs.not_in_range ? msgs.not_in_range : not_in_range_msg;
            }
        }
        if ("min" in opts) {
            if (obj.isBefore(opts.min)) {
                return msgs && msgs.not_in_range ? msgs.not_in_range : not_in_range_msg;
            }
        }
        return undefined;
    }

    protected objToStr(obj: Moment): { str?: string, err?: string } {
        if (obj.constructor === Date) {
            obj = moment(obj);
        }
        return { str: obj
            ? obj.locale(this.opts.locale || locale_default).format(this.opts.format || format_default)
            : undefined };
    }

}

export class FormValidator<T = any> {

    readonly validators: { [key in keyof T]: Validator<any, any, any> } = {} as any;

    readonly str: { [key in keyof T]: string };
    readonly obj: { [key in keyof T]: any };
    readonly err: { [key in keyof T]: string };
    readonly valid: boolean;

    addValidator(field: keyof T, validator: Validator<any, any, any>): this {
        this.validators[field] = validator;
        return this;
    }

    validate(data: { [key in keyof T]: string },
             defaults?: { [key in keyof T]: string }): this {
        const d = { ...defaults as object, ...data as object };
        const res = Object.keys(this.validators)
            .reduce(
                (a, k) => {
                    const v = (d as any)[k];
                    const r = (this.validators as any)[k].validate(v);
                    console.log(r);
                    (a.str as any)[k] = r.str;
                    (a.obj as any)[k] = r.obj;
                    r.err && ((a.err as any)[k] = r.err);
                    return a;
                },
                { str: {}, obj: {}, err: {}, valid: false });
        res.valid = !Object.keys(res.err).filter(x => !!(res.err as any)[x]).length;
        (this.str as any) = res.str;
        (this.obj as any) = res.obj;
        (this.err as any) = res.err;
        (this.valid as any) = res.valid;
        return this;
    }

    format(data: { [key in keyof T]: any }): this {
        const res = Object.keys(this.validators)
            .reduce(
                (a, k) => {
                    const v = (data as any)[k];
                    const r = (this.validators as any)[k].format(v);
                    (a.str as any)[k] = r.str;
                    (a.obj as any)[k] = v;
                    r.err && ((a.err as any)[k] = r.err);
                    return a;
                },
                { str: {}, obj: {}, err: {}, valid: false });
        res.valid = !Object.keys(res.err).filter(x => !!(res.err as any)[x]).length;
        (this.str as any) = res.str;
        (this.obj as any) = res.obj;
        (this.err as any) = res.err;
        (this.valid as any) = res.valid;
        return this;
    }

}


// TEST

// const sv = new StringValidator(
//     {
//         required: true,
//         min: 3,
//         max: 5,
//         regexp: /[0123]+/
//     },
//     {
//         required: "required msg",
//         invalid_format: "invalid_format msg",
//         not_in_range: "not_in_range msg"
//     });

// ["x1234", "x1234y", "xy"].forEach(v => {
//     console.log(v);
//     const r = sv.validate(v);
//     console.log(r);
//     if (r.obj) {
//         const f = sv.format(r.obj);
//         console.log(f);
//     }
// });

// console.log();

// const nv = new NumberValidator(
//     {
//         required: true,
//         min: 3,
//         max: 500,
//         // locale: "sk"
//     },
//     {
//         required: "required msg",
//         invalid_format: "invalid_format msg",
//         not_in_range: "not_in_range msg"
//     });

// ["123", "1234y", "xy"].forEach(v => {
//     console.log(v);
//     const r = nv.validate(v);
//     console.log(r);
//     if (r.obj) {
//         const f = nv.format(r.obj);
//         console.log(f);
//     }
// });

// console.log();

// const dv = new DateValidator(
//     {
//         required: true,
//         locale: "sk",
//         format: "L LT",
//         min: moment("03/01/2017", "L", "en"),
//         max: moment("03/01/2020", "L", "en")
//         // parsedValue: ""
//     },
//     {
//         required: "required msg",
//         invalid_format: "invalid_format msg",
//         not_in_range: "not_in_range msg"
//     });

// ["01.03.2018 5:35", "5:35", "01.13.2018", "03/01/2018"].forEach(v => {
//     console.log(v);
//     const r = dv.validate(v);
//     console.log(r);
//     if (r.obj) {
//         const f = dv.format(r.obj);
//         console.log(f);
//     }
// });

// console.log();

// const data = { code: "123a", num: "111" };

// const fv = new FormValidator<typeof data>()
//     .addValidator("code", sv)
//     .addValidator("num", nv)
//     .validate(data);

// console.log(fv);

// fv.format(fv.obj);
// console.log(fv);
