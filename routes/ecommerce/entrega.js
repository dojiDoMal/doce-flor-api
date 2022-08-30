const { pool } = require('./../../config/db_connection');
const { validationResult } = require( 'express-validator' );

const removeEntrega = async (request, response) => {
    
    try {
        validationResult(request).throw();
        
        const entrega = request.params.id;
        let query = "";
        
        try {
            await pool.query('BEGIN');
            
            query = "\
                DELETE FROM ecommerce.entrega \
                WHERE id = " + entrega;

            await pool.query(query).then().catch(error => { if (error) {throw error} });
                        
            await pool.query('COMMIT');
            response.status(200).json({mensagem: "Entrega removida com sucesso!", id_entrega: entrega});
            
        } catch (err) {
            await pool.query('ROLLBACK');
            throw err;
        }
        
    } catch (err) {
        response.status(400).json(err);    
    }
}

module.exports = {
    removeEntrega,
}
