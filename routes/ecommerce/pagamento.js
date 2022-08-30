const { pool } = require('./../../config/db_connection');
const { validationResult } = require( 'express-validator' );

const removePagamento = async (request, response) => {
    
    try {
        validationResult(request).throw();
        
        const pagamento = request.params.id;
        let query = "";
        
        try {
            await pool.query('BEGIN');
            
            query = "\
                DELETE FROM ecommerce.pagamento \
                WHERE id = " + pagamento;

            await pool.query(query).then().catch(error => { if (error) {throw error} });
                        
            await pool.query('COMMIT');
            response.status(200).json({mensagem: "Pagamento removido com sucesso!", id_pagamento: pagamento});
            
        } catch (err) {
            await pool.query('ROLLBACK');
            throw err;
        }
        
    } catch (err) {
        response.status(400).json(err);    
    }
}

module.exports = {
    removePagamento,
}
