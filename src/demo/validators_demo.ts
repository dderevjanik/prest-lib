import {
    StringValidator,
    NumberValidator,
    DateValidator,
    FormValidator
} from "../main/validators";
import * as moment from "moment";

import "numeral/locales";

const sv = new StringValidator(
    {
        required: true,
        min: 3,
        max: 5,
        regexp: /[0123]+/
    },
    {
        required: "required ${min} ${max} ${regexp}",
        invalid_format: "invalid_format ${regexp}",
        not_in_range: "not_in_range ${min} ${max}"
    });

["x1234", "x1234y", "xy"].forEach(v => {
    console.log(v);
    const r = sv.validate(v);
    console.log(r);
    if (r.obj) {
        const f = sv.format(r.obj);
        console.log(f);
    }
});

console.log();

const nv = new NumberValidator(
    {
        required: true,
        min: 3,
        max: 500,
        locale: "sk",
        format: "0,0.0[00]"
    },
    {
        required: "required ${min} ${max} ${locale} ${format}",
        invalid_format: "invalid_format ${num} ${locale} ${format}",
        not_in_range: "not_in_range ${min} ${max} ${locale}"
    });

["123,45", "1234y", "xy"].forEach(v => {
    console.log(v);
    const r = nv.validate(v);
    console.log(r);
    if (r.obj) {
        const f = nv.format(r.obj);
        console.log(f);
    }
});

console.log();

const dv = new DateValidator(
    {
        required: true,
        locale: "sk",
        format: "L LT",
        min: moment("03/01/2017", "L", "en"),
        max: moment("03/01/2020", "L", "en")
        // parsedValue: ""
    },
    {
        required: "required ${min} ${max} ${locale} ${format}",
        invalid_format: "invalid_format ${date} ${locale}",
        not_in_range: "not_in_range ${min} ${max} ${locale} ${format}"
    });

["01.03.2018 5:35", "5:35", "01.13.2018", "03/01/2018"].forEach(v => {
    console.log(v);
    const r = dv.validate(v);
    console.log(r);
    if (r.obj) {
        const f = dv.format(r.obj);
        console.log(f);
    }
});

console.log();

const data = { str: "123a", num: "12,34", date: "02.01.2019 12:12" };

const fv = new FormValidator<typeof data>()
    .addValidator("str", sv)
    .addValidator("num", nv)
    .addValidator("date", dv)
    .validate(data);

console.log(fv);

fv.format(fv.obj);
console.log(fv);
