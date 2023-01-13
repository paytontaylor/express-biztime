const express = require('express');
const app = require('../app');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

router.get('/', async (req, res, next) => {
    try {
    const companies = await db.query(`SELECT * FROM companies`)
    return res.json({companies: companies.rows})
    } catch (e){
        next(e)
    }
})

router.get('/:code', async (req, res, next) => {
    try {
        const { code } = req.params
        const company = await db.query(`SELECT * FROM companies WHERE code=$1`, [code])
        if (!company.rows.length){
            throw new ExpressError('Company Code Not Found', 400)
        }
        return res.json({company: company.rows[0]})
    } catch (e){
        next(e)
    }
})

router.post('/', async (req, res, next) => {
    const {code, name} = req.body
    const newCompany = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name`, [code, name, description])
    return res.status(201).json({added: newCompany.rows[0]})
})

router.put('/:code', async (req, res, next) => {
    try {
        let { code } = req.params
        let { name, description } = req.body
        if (name && description) {
            const result = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`, [name, description, code])
            if (result.rows.length === 0){
                throw new ExpressError('Company not found', 404)
            } else {
                return result.rows[0]
            }
        } else if (name) {
            const result = await db.query(`UPDATE companies SET name=$1 WHERE code=$2 RETURNING code, name`, [name, code])
            return (result.rows)
        } else {
            const result = await db.query(`UPDATE companies SET description=$1 WHERE code=$2 RETURNING code, name`, [description, code])
            return res.json(result.rows[0])
        }
    } catch(e) {
        next(e)
    }
})

router.delete('/:code', async (req, res, next) => {
    try {
    const { code } = req.params
    const result = await db.query(`DELETE FROM companies WHERE code=$1`, [code])
    if (result.rows.length === 0){
        throw new ExpressError('Company not found', 404)
    } else {
        return res.json({ message: 'Deleted'})
    }
    } catch(e) {
        next(e)
    }
})

module.exports = router;