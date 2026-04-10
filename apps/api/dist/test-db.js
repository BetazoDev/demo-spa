"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./lib/db");
async function test() {
    try {
        const res = await (0, db_1.query)('SELECT id, name, branding, settings FROM tenants');
        console.log(JSON.stringify(res.rows, null, 2));
    }
    catch (e) {
        console.error(e);
    }
}
test();
