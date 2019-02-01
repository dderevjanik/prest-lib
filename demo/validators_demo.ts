import {
    StringValidator,
    NumberValidator,
    DateTimeValidator,
    ObjectValidator
} from "../src/validators";
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

[
    "x1234",
    "x1234y",
    "xy"
].forEach(v => {
    console.log();
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
        max: 5000,
        locale: "sk",
        format: "0,0.0[00]",
        strict: true
    },
    {
        required: "required ${min} ${max} ${locale} ${format}",
        invalid_format: "invalid_format ${num} ${locale} ${format}",
        not_in_range: "not_in_range ${min} ${max} ${locale}"
    });

[
    "1234,56",
    "1 234,56",
    "1 234,56y",
    "xy"
].forEach(v => {
    console.log();
    console.log(v);
    const r = nv.validate(v);
    console.log(r);
    if (r.obj) {
        const f = nv.format(r.obj);
        console.log(f);
    }
});

console.log();

const dv = new DateTimeValidator(
    {
        required: true,
        locale: "sk",
        format: "l LT",
        min: moment("03/01/2017", "L", "en"),
        max: moment("03/01/2020", "L", "en"),
        strict: true
    },
    {
        required: "required ${min} ${max} ${locale} ${format}",
        invalid_format: "invalid_format ${date} ${locale}",
        not_in_range: "not_in_range ${min} ${max} ${locale} ${format}"
    });

[
    "01.03.2018 5:35",
    "1.3.2018 5:35",
    "5:35",
    "01.13.2018",
    "1.13.2018",
    "03/01/2018",
    "3/1/2018"
].forEach(v => {
    console.log();
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

const ov = new ObjectValidator({
        str: sv,
        num: nv,
        date: dv
    })
    .validate(data);

console.log(ov);

ov.format(ov.obj);
console.log(ov);
