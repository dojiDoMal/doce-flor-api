const { pool } = require('./../../config/db_connection');
const { validationResult } = require( 'express-validator' );

// Ex: http://localhost:5050/fornecedor?cnpj=26.545.650/0001-06
const getFornecedores = (request, response) => {

    try {
        validationResult(request).throw();

        let queryStr = request.query;
        
        const select = " \
            SELECT f.id, f.pessoa, p.tipo_p, p.cnpj, p.nome, p.telefone \
            FROM ecommerce.fornecedor f \
            JOIN ecommerce.pessoa p ON p.id=f.pessoa \
            WHERE 1=1 \
        ";
        
        let pessoa = "";

        pessoa += validaTipoPessoa( queryStr.tipo ) ? " AND p.tipo_p='" + queryStr.tipo + "'" : "";
        pessoa += queryStr.id_pessoa ? " AND p.id=" + queryStr.id_pessoa : "";
        pessoa += queryStr.nome ? " AND p.nome LIKE '%" + queryStr.nome + "%'" : "";
        pessoa += queryStr.fone ? " AND p.telefone LIKE '%" + queryStr.fone + "%'" : "";
        
        if ( queryStr.cnpj ) {
            let cnpj = validaCNPJ( queryStr.cnpj );
            pessoa += cnpj ? " AND p.cnpj LIKE '%" + cnpj + "%'" : "";
        }

        const query = select + pessoa;
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

const insertFornecedor = async (request, response) => {

    try {
        validationResult(request).throw();

        let params = request.body;
        if ( !validaTipoPessoa( params.tipo ) ) { throw new Error('Tipo de pessoa informado inválido!') };
        
        try {
            await pool.query('BEGIN');

            let query = "INSERT INTO ecommerce.pessoa (tipo_p, cnpj, nome, telefone) VALUES ('" 
                + params.tipo + "', '" 
                + params.cnpj + "', '" 
                + params.nome + "', '" 
                + params.telefone + "') RETURNING id";
    
            const pessoa = await pool
                .query(query)
                .then(results => results.rows[0].id)
                .catch( error => { if ( error ) { throw error } } );

            query = "INSERT INTO ecommerce.fornecedor (pessoa) VALUES ('" + pessoa + "') RETURNING id";
            fornecedor = await pool
                .query(query)
                .then(results => results.rows[0].id)
                .catch( error => { if ( error ) { throw error } } );

            await pool.query('COMMIT');
            response.status(200).json({mensagem: "Fornecedor cadastrado com sucesso!", id_cliente: fornecedor});

        } catch (err) {
            await pool.query('ROLLBACK');
            throw err;
        }
    
    } catch (err) {
        console.log(err.stack);
        response.status(400).json(err);
    }
}

const editFornecedor = async (request, response) => {

    try {
        validationResult(request).throw();

        const fornecedor = request.params.id;
        const params = request.body;

        if ( !validaTipoPessoa( params.tipo ) ) { throw new Error('Tipo de pessoa informado inválido!') };
        
        let query = " \
            SELECT p.id \
            FROM ecommerce.pessoa p \
            JOIN ecommerce.fornecedor f ON p.id = f.pessoa \
            WHERE f.id = " + fornecedor;

        const pessoa = await pool
            .query(query)
            .then(results => results.rows[0].id)
            .catch( error => { if ( error ) { throw error } } );

        try {
            await pool.query('BEGIN');

            query = "\
                UPDATE ecommerce.pessoa \
                SET tipo_p = '" + params.tipo + "', \
                    cnpj = '" + params.cnpj + "', \
                    nome = '" + params.nome + "', \
                    telefone = '" + params.telefone + "' \
                WHERE id = " + pessoa

            await pool.query(query);

            await pool.query('COMMIT');
            response.status(200).json({mensagem: "Dados do fornecedor atualizados com sucesso!", id_fornecedor: fornecedor});

        } catch (err) {
            await pool.query('ROLLBACK');
            throw err;
        }               
    } catch (err) {
        response.status(400).json(err);    
    }
}

const removeFornecedor = async (request, response) => {

    try {
        validationResult(request).throw();

        const fornecedor = request.params.id;

        try {
            await pool.query('BEGIN');

            const query = "\
                DELETE FROM ecommerce.pessoa \
                WHERE id IN (SELECT pessoa FROM ecommerce.fornecedor f WHERE f.id='" + fornecedor + "')"

            await pool.query(query);

            await pool.query('COMMIT');
            response.status(200).json({mensagem: "Fornecedor removido com sucesso!", id_fornecedor: fornecedor});

        } catch (err) {
            await pool.query('ROLLBACK');
            throw err;
        }

    } catch (err) {
        response.status(400).json(err);    
    }
}

const validaCNPJ = function ( cnpj ) {
    cnpj = cnpj.replaceAll(/([\.]|[\-]|[\/])/g, '');
    let r = /([0-9]{2}[\.]?[0-9]{3}[\.]?[0-9]{3}[\/]?[0-9]{4}[-]?[0-9]{2})/g; 
    
    if ( !cnpj.match(r) ) {
        throw new Error('CNPJ informado inválido');
    } 

    return cnpj;
}

const validaTipoPessoa = function ( tipo_p ) {
    //Regra de negócio -> ENUM ecommerce.tipo_pessoa -> "fisica" ou "juridica"
    if ( tipo_p && (tipo_p == "fisica" || tipo_p == "juridica") ) {
        return true;
    }

    return false;
}

module.exports = {
    getFornecedores,
    insertFornecedor,
    editFornecedor,
    removeFornecedor
}
