const express = require('express');
const app = require('../app');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

router.get('/', async (req, res, next) => {
    try {
    const invoices = await db.query(`SELECT * FROM invoices`)
    return res.json({invoices: invoices.rows})
    } catch (e){
        next(e)
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const invoiceRes = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id])
        if (invoiceRes.rows.length === 0){
            throw new ExpressError('Invoice Not Found', 404)
        } else {
            const companyRes = await db.query(`SELECT code, name, description FROM companies INNER JOIN invoices ON companies.code = invoices.comp_code WHERE id=$1`, [id])
            const invoice = invoiceRes.rows[0]
            invoice.company = companyRes.rows[0]
            return res.json({invoice: invoice})
        }
    } catch (e){
        next(e)
    }
})

router.post('/', async (req, res, next) => {
    const {id, comp_code, amt, paid, add_date, paid_date } = req.body
    console.log(add_date)
    const newInvoices = await db.query(`INSERT INTO invoices (comp_code, amt, paid) VALUES ($1, $2, $3) RETURNING comp_code, amt, paid`, [comp_code, amt, paid])
    return res.status(201).json({added: newInvoices.rows[0]})
})

router.put('/:id', async (req, res, next) => {
    try {
        let { id } = req.params
        let { amt, paid, add_date, paid_date } = req.body
        if (amt) {
            const result = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, amt`, [amt, id])
            if (result.rows.length === 0) {
                throw new ExpressError('Invoice not found', 404)
            } else {
                return res.json(result.rows[0])
            }
        } else if (paid) {
            const result = await db.query(`UPDATE invoices SET paid=$1 WHERE id=$2 RETURNING id, paid`, [paid, id])
            return res.json(result.rows[0])
        } else if (add_date) {
            const result = await db.query(`UPDATE invoices SET add_date=$1 WHERE id=$2 RETURNING id, add_date`, [paid_date, id])
            return res.json(result.rows[0])
        } else {
            const result = await db.query(`UPDATE invoices SET paid_date=$1 WHERE id=$2 RETURNING id, paid_date`, [paid_date, id])
            return res.json(result.rows[0])
        }
    } catch(e) {
        next(e)
    }
})

router.patch('/:id', async (req, res, next) => {
    if (comp_code && amt && paid && add_date && paid_date) {
        const result = await db.query(`UPDATE invoices SET comp_code=$1, amt=$2, amt=$3, add_date=$4, add_date=$5 WHERE id=$6 RETURNING comp_code, amt, paid, add_date, paid_date`, [comp_code, amt, paid, add_date, paid_date])
        return result.rows[0]
    }
})

router.delete('/:id', async (req, res, next) => {
    const { id } = req.params
    const result = db.query(`DELETE FROM invoices WHERE id=$1`, [id])
    return res.json({ message: 'Deleted'})
})

module.exports = router;