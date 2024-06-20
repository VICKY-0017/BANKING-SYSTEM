import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const db = new pg.Client({
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

db.connect();
const port = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get("/customers", async (req, res) => {
    const result = await db.query("SELECT * FROM customers");
    const customers = result.rows;

    res.render("customer.ejs", {
        customers: customers
    });
});

app.get("/transfer", (req, res) => {
    res.render("transfer.ejs");
});

app.post("/transfer", async (req, res) => {
    const urid = req.body.urid;
    const cstid = req.body.customerId;
    const amt = req.body.amount;
    const date = req.body.date;
    const description = req.body.descp;

    try {
        const camnt = await db.query("SELECT amnt FROM amnt WHERE id = $1", [cstid]);
        const yramnt = await db.query("SELECT amnt FROM amnt WHERE id = $1", [urid]);
        const ctrns = await db.query("UPDATE amnt SET amnt = amnt + $1 WHERE id = $2", [amt, cstid]);
        const yrtrns = await db.query("UPDATE amnt SET amnt = amnt - $1 WHERE id = $2", [amt, urid]);
        await db.query("INSERT INTO transactions (customer_id, date, description, amount) VALUES ($1, $2, $3, $4)", [cstid, date, description, amt]);

        res.redirect("/");
    } catch (err) {
        console.log(err);
    }
});

app.get("/transactions", async (req, res) => {
    const customerId = req.query.customerId;

    if (!customerId) {
        return res.render("transactions.ejs");
    }

    try {
        const transactionsResult = await db.query("SELECT * FROM transactions WHERE customer_id = $1 ORDER BY date DESC", [customerId]);
        const customerResult = await db.query("SELECT name FROM customers WHERE id = $1", [customerId]);
        const balnce = await db.query("SELECT amnt FROM amnt WHERE id = $1", [customerId]);

        const bal = balnce.rows[0].amnt;

        if (customerResult.rowCount === 0) {
            throw new Error("Customer not found");
        }

        const transactions = transactionsResult.rows;
        const customerName = customerResult.rows[0].name;

        res.render("transactions.ejs", {
            transactions: transactions,
            customerName: customerName,
            bal: bal
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error retrieving transactions: " + err.message);
    }
});

app.get("/view", (req, res) => {
    res.render("custd.ejs");
});

app.post("/customer-details", async (req, res) => {
    const ctdid = req.body.customerId;
    try {
        const details = await db.query("SELECT name, accounttype FROM customers WHERE id = $1", [ctdid]);
        const amndtls = await db.query("SELECT amnt FROM amnt WHERE id = $1", [ctdid]);
        const trnsdtls = await db.query("SELECT COUNT(customer_id) as cnt FROM transactions WHERE customer_id = $1", [ctdid]);

        if (details.rowCount === 0 || amndtls.rowCount === 0 || trnsdtls.rowCount === 0) {
            throw new Error("Customer not found or no transactions available.");
        }

        const cname = details.rows[0].name;
        const cactype = details.rows[0].accounttype;
        const camnt = amndtls.rows[0].amnt;
        const tdtls = trnsdtls.rows[0].cnt;

        res.render("custdetails.ejs", {
            customername: cname,
            acnttype: cactype,
            amnt: camnt,
            transactiondetails: tdtls
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error retrieving customer details: " + err.message);
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
