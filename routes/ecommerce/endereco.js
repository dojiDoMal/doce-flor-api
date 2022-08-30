const { pool } = require('./../../config/db_connection');
const { validationResult } = require( 'express-validator' );

// Ex: http://localhost:5050/endereco?id_pessoa=14
const getEnderecoPessoa = (request, response) => {

    try {
        validationResult(request).throw();

        let queryStr = request.query;
    
        const select = " \
            SELECT e.id, e.rua, e.numero, e.complemento, e.cep, b.nome as bairro, c.nome as cidade, \
                uf.nome as estado, p.nome as pais \
            FROM ecommerce.endereco e \
            JOIN ecommerce.endereco_pessoa ep ON e.id = ep.endereco \
            JOIN pais p ON e.pais = p.id \
            JOIN estado uf ON e.estado = uf.id \
            JOIN cidade c ON e.cidade = c.id \
            JOIN bairro b ON e.bairro = b.id \
            WHERE 1=1 \
        ";
        
        let pessoa = "";
        pessoa += queryStr.id_pessoa ? " AND ep.pessoa = " + queryStr.id_pessoa : "";

        let endereco = "";
        endereco += queryStr.id ? " AND e.id = " + queryStr.id : "";

        const query = select + pessoa + endereco;
        console.log(query);

        pool.query(query, (error, results) => {
            if (error) throw error;
            response.status(200).json(results.rows)
        })

    } catch(err) {
        response.status(400).json(err);
    }
}

const insertEndereco = async (request, response) => {

    try {
        validationResult(request).throw();

        let params = request.body;
        
        try {
            await pool.query('BEGIN');

            let query = "INSERT INTO ecommerce.endereco (rua, numero, complemento, cep, bairro, cidade, estado, pais) VALUES ('" 
                + params.rua + "', '" 
                + params.numero + "', '"
                + params.complemento + "', '"
                + params.cep + "', '"
                + params.bairro + "', '"
                + params.cidade + "', '"
                + params.estado + "', '"
                + params.pais + "') RETURNING id";
    
            const endereco = await pool
                .query(query)
                .then(results => results.rows[0].id)
                .catch( error => { if ( error ) { throw error } } );

            let endereco_pessoa = null;
            if ( params.pessoa ) {
                query = "INSERT INTO ecommerce.endereco_pessoa (pessoa, endereco) VALUES ('"
                    + params.pessoa + "', '" 
                    + endereco + "') RETURNING id";

                endereco_pessoa = await pool
                    .query(query)
                    .then(results => results.rows[0].id)
                    .catch( error => { if ( error ) { throw error } } );
            }

            await pool.query('COMMIT');
            response.status(200).json({mensagem: "Endereço cadastrado com sucesso!", id_endereco: endereco, id_endereco_pessoa: endereco_pessoa});

        } catch (err) {
            await pool.query('ROLLBACK');
            throw err;
        }
    
    } catch (err) {
        console.log(err.stack);
        response.status(400).json(err);
    }
}

const editEndereco = async (request, response) => {

    try {
        validationResult(request).throw();

        const endereco = request.params.id;
        const params = request.body;

        params.complemento = params.complemento || "";

        try {
            await pool.query('BEGIN');

            let query = "\
                UPDATE ecommerce.endereco \
                SET rua = '" + params.rua + "', \
                    numero = " + params.numero + ", \
                    complemento = '" + params.complemento + "', \
                    cep = '" + params.cep + "', \
                    bairro = " + params.bairro + ", \
                    cidade = " + params.cidade + ", \
                    estado = " + params.estado + ", \
                    pais = " + params.pais + " \
                WHERE id = " + endereco

            await pool.query(query);

            await pool.query('COMMIT');

            if ( params.pessoa ) {
                await pool.query('BEGIN');

                query = "\
                    UPDATE ecommerce.endereco_pessoa \
                    SET endereco = " + endereco + " \
                    WHERE pessoa = " + params.pessoa

                await pool.query(query);

                await pool.query('COMMIT');
            }
           
            response.status(200).json({mensagem: "Endereço atualizado com sucesso!", id_endereco: endereco});

        } catch (err) {
            await pool.query('ROLLBACK');
            throw err;
        }               
    } catch (err) {
        response.status(400).json(err);    
    }
}

const removeEndereco = async (request, response) => {

    try {
        validationResult(request).throw();

        const endereco = request.params.id;

        try {
            await pool.query('BEGIN');

            const query = "\
                DELETE FROM ecommerce.endereco \
                WHERE id = " + endereco

            await pool.query(query);

            await pool.query('COMMIT');
            response.status(200).json({mensagem: "Endereco removido com sucesso!", id_endereco: endereco});

        } catch (err) {
            await pool.query('ROLLBACK');
            throw err;
        }

    } catch (err) {
        response.status(400).json(err);    
    }
}

module.exports = {
    getEnderecoPessoa,
    insertEndereco,
    editEndereco,
    removeEndereco
}
