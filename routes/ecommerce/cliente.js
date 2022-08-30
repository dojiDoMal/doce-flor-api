const { pool } = require('./../../config/db_connection');
const { validationResult } = require( 'express-validator' );
const moment = require('moment');

// Ex: http://localhost:5050/cliente?nome=ar&tipo=fisica
//     http://localhost:5050/cliente?data_nasc_ini=1-1-1998&data_nasc_fim=1-1-2002
const getClientes = (request, response) => {

    try {
        validationResult(request).throw();

        let queryStr = request.query;
    
        const select = " \
            SELECT c.id, c.pessoa, p.tipo_p, p.cnpj, p.nome, p.data_nascimento, p.telefone \
            FROM ecommerce.cliente c \
            JOIN ecommerce.pessoa p ON p.id=c.pessoa \
            WHERE 1=1 \
        ";
        
        let pessoa = "";
    
        pessoa += validaTipoPessoa( queryStr.tipo ) ? " AND p.tipo_p='" + queryStr.tipo + "'" : "";
        pessoa += queryStr.id_pessoa ? " AND p.id=" + queryStr.id_pessoa : "";
        pessoa += queryStr.nome ? " AND p.nome LIKE '%" + queryStr.nome + "%'" : "";
        pessoa += queryStr.fone ? " AND p.telefone LIKE '%" + queryStr.fone + "%'" : "";
        
        if ( validaData( queryStr.data_nasc_ini ) ) {
            let data_ini = queryStr.data_nasc_ini;
            data_ini = moment(data_ini, "D M YYYY").format("YYYY-MM-DD");
            pessoa += ` AND p.data_nascimento >= '${data_ini}'::date`;
        }
    
        if ( validaData( queryStr.data_nasc_fim ) ) {
            let data_fim = queryStr.data_nasc_fim;
            data_fim = moment(data_fim, "D M YYYY").format("YYYY-MM-DD");
            pessoa += ` AND p.data_nascimento <= '${data_fim}'::date`;
        }
    
        const query = select + pessoa;
        console.log(query);
    
        pool.query(query, (error, results) => {
            if (error) throw error;
            response.status(200).json(results.rows)
        })

    } catch (err) {
        response.status(400).json(err);
    }
}

const insertCliente = async (request, response) => {

    try {
        validationResult(request).throw();

        let params = request.body;
        if ( !validaTipoPessoa( params.tipo ) ) { throw new Error('Tipo de pessoa informado inválido!') };
        if ( !validaData( params.data_nascimento ) ) { throw new Error('A data de nascimento informada está em um formato inválido!') };
        params.data_nascimento = moment(params.data_nascimento, "D M YYYY").format("YYYY-MM-DD")
        
        try {
            await pool.query('BEGIN');

            let query = "INSERT INTO ecommerce.pessoa (tipo_p, cnpj, nome, data_nascimento, telefone) VALUES ('" 
                + params.tipo + "', '" 
                + params.cnpj + "', '" 
                + params.nome + "', '" 
                + params.data_nascimento + "'::date, '" 
                + params.telefone + "') RETURNING id";
    
            const pessoa = await pool
                .query(query)
                .then(results => results.rows[0].id)
                .catch( error => { if ( error ) { throw error } } );

            query = "INSERT INTO ecommerce.cliente (pessoa) VALUES ('" + pessoa + "') RETURNING id";
            cliente = await pool
                .query(query)
                .then(results => results.rows[0].id)
                .catch( error => { if ( error ) { throw error } } );

            await pool.query('COMMIT');
            response.status(200).json({mensagem: "Cliente cadastrado com sucesso!", id_cliente: cliente});

        } catch (err) {
            await pool.query('ROLLBACK');
            throw err;
        }
    
    } catch (err) {
        console.log(err.stack);
        response.status(400).json(err);
    }
}

const editCliente = async (request, response) => {

    try {
        validationResult(request).throw();

        const cliente = request.params.id;
        const params = request.body;

        if ( !validaTipoPessoa( params.tipo ) ) { throw new Error('Tipo de pessoa informado inválido!') };
        if ( !validaData( params.data_nascimento ) ) { throw new Error('A data de nascimento informada está em um formato inválido!') };
        params.data_nascimento = moment(params.data_nascimento, "D M YYYY").format("YYYY-MM-DD")

        let query = " \
            SELECT p.id \
            FROM ecommerce.pessoa p \
            JOIN ecommerce.cliente c ON p.id = c.pessoa \
            WHERE c.id = " + cliente;

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
                    data_nascimento = '" + params.data_nascimento + "'::date, \
                    telefone = '" + params.telefone + "' \
                WHERE id = " + pessoa

            await pool.query(query);

            await pool.query('COMMIT');
            response.status(200).json({mensagem: "Dados do cliente atualizados com sucesso!", id_cliente: cliente});

        } catch (err) {
            await pool.query('ROLLBACK');
            throw err;
        }               
    } catch (err) {
        response.status(400).json(err);    
    }
}

const removeCliente = async (request, response) => {

    try {
        validationResult(request).throw();

        const cliente = request.params.id;

        try {
            await pool.query('BEGIN');

            const query = "\
                DELETE FROM ecommerce.pessoa \
                WHERE id IN (SELECT pessoa FROM ecommerce.cliente c WHERE c.id='" + cliente + "')"

            await pool.query(query);

            await pool.query('COMMIT');
            response.status(200).json({mensagem: "Cliente removido com sucesso!", id_cliente: cliente});

        } catch (err) {
            await pool.query('ROLLBACK');
            throw err;
        }

    } catch (err) {
        response.status(400).json(err);    
    }
}

const validaTipoPessoa = function ( tipo_p ) {
    //Regra de negócio -> ENUM ecommerce.tipo_pessoa -> "fisica" ou "juridica"
    if ( tipo_p && (tipo_p == "fisica" || tipo_p == "juridica") ) {
        return true;
    }

    return false;
}

const validaData = function ( data ) {
    //Verifica se a data passada está no formato utilizado na API 
    return ( data && moment(data, "D M YYYY").isValid() )
}

module.exports = {
    getClientes,
    insertCliente,
    editCliente,
    removeCliente
}
