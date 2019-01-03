
export function tmpla(tmpl: string, data: string[]): string {
    return data.reduce((t, d, i) => t.replace(new RegExp(`\\$\\{${i}\\}`, "g"), d), tmpl);
}

export function tmplo(tmpl: string, data: { [k: string]: string }): string {
    return Object.keys(data)
        .map(k => [k, data[k]])
        .reduce((t, d) => t.replace(new RegExp(`\\$\\{${d[0]}\\}`, "g"), d[1]), tmpl);
}

export function tmpl<T = any>(template: string): (data: { [key in keyof T]: string }) => string {
    const stringify = JSON.stringify;
    const re = /\$\{([\S\s]*?)\}/g;
    const strings: string[] = [];
    let m: RegExpExecArray;
    let i = 0;
    let str: string;
    while ((m = re.exec(template))) {
        str = template.slice(i, m.index);
        strings.push(stringify(str), "(" + m[1] + ")");
        i = re.lastIndex;
    }
    str = template.slice(i);
    strings.push(stringify(str));
    const fn = new Function("obj", "with(obj)return " + strings.join("+"));
    return fn as (data: Object) => string;
}

// const dataArray = ["A", "B"];
// console.log("tmpla: ${0} ${1} ${0}", "|", tmpla("tmpla: ${0} ${1} ${0}", dataArray));

// const dataObject = { a: "A", b: "B" };

// console.log("tmplo: ${a} ${b} ${a}", "|", tmplo("tmplo: ${a} ${b} ${a}", dataObject));

// const template = tmpl<typeof dataObject>("tmpl : ${a} ${b} ${a}");
// console.log("tmpl : ${a} ${b} ${a}", "|", template(dataObject));
// console.log("tmpl : ", template);
