const { pool } = require('./../../config/db_connection');
const { validationResult } = require( 'express-validator' );


const getProdutos = (request, response) => {
    
    try {
        validationResult(request).throw();
        
        let queryStr = request.query;
        
        const select = "SELECT * FROM ecommerce.produto";
        let where = " WHERE 1=1";
        
        const nome = queryStr.nome ? " AND nome LIKE '%" + queryStr.nome + "%'" : "";
        const id = queryStr.id ? " AND id=" + queryStr.id : "";
        
        where += nome + id;
        const query = select + where;
        console.log(query);

        pool.query(query, (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        })
    } catch (err) {
        response.status(400).json(err);
    }
}

//TODO: insertProduto (fazer isso no ambiente DESENVOLVIMENTO)

//TODO: editProduto (fazer isso no ambiente DESENVOLVIMENTO)

//TODO: removeProduto (fazer isso no ambiente DESENVOLVIMENTO)

// Necessário passar nos params do request o valor do "id_compra_produto"
const removeProdutoCompra = async (request, response) => {
    
    try {
        validationResult(request).throw();
        
        const compra_produto = request.params.id;
        let query = "";
        
        try {
            await pool.query('BEGIN');
            
            query = "\
                DELETE FROM ecommerce.compra_produto \
                WHERE id = " + compra_produto;

            await pool.query(query).then().catch(error => { if (error) {throw error} });
                        
            await pool.query('COMMIT');
            response.status(200).json({mensagem: "Produto removido da compra com sucesso!"});
            
        } catch (err) {
            await pool.query('ROLLBACK');
            throw err;
        }
        
    } catch (err) {
        response.status(400).json(err);    
    }
}

// Necessário passar nos params do request o valor do "id_venda_produto"
const removeProdutoVenda = async (request, response) => {
    
    try {
        validationResult(request).throw();
        
        const venda_produto = request.params.id;
        let query = "";
        
        try {
            await pool.query('BEGIN');
            
            query = "\
                DELETE FROM ecommerce.venda_produto \
                WHERE id = " + venda_produto;

            await pool.query(query).then().catch(error => { if (error) {throw error} });
                        
            await pool.query('COMMIT');
            response.status(200).json({mensagem: "Produto removido da venda com sucesso!"});
            
        } catch (err) {
            await pool.query('ROLLBACK');
            throw err;
        }
        
    } catch (err) {
        response.status(400).json(err);    
    }
}

module.exports = {
    removeProdutoCompra,
    removeProdutoVenda,
    getProdutos,
    //insertProduto,
    //editProduto,
    //removeProduto,
}
