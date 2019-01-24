#!/usr/bin/env node

import * as fs from "fs";
import { html2hsml, hsml2string } from "./html2hsml";

const args = process.argv.slice(2);

switch (args.length) {
    case 1: {
        const html = fs.readFileSync(args[0], "utf8");
        const hsml = html2hsml(html);
        console.log(hsml2string(hsml));
        break;
    }
    case 2: {
        const html = fs.readFileSync(args[0], "utf8");
        const hsml = html2hsml(html);
        fs.writeFileSync(args[1], hsml2string(hsml));
        break;
    }
    default:
        process.stdin.resume();
        process.stdin.setEncoding("utf8");
        const data = [] as any;
        process.stdin.on("data", chunk => {
            data.push(chunk);
        });
        process.stdin.on("end", () => {
            const html = data.join("");
            const hsml = html2hsml(html);
            console.log(hsml2string(hsml));
        });
}
