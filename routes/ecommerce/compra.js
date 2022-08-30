const moment = require('moment');
const { pool } = require('./../../config/db_connection');
const { validationResult } = require( 'express-validator' );

// Ex: localhost:5050/compra?id=2
//     localhost:5050/compra?data_ini=14-8-2022
const getCompras = async (request, response) => {
    
    try {
        validationResult(request).throw();
        
        let queryStr = request.query;
        let compras = [];
        
        const select = " \
            SELECT c.id, c.data, c.status, c.frete, c.desconto  \
            FROM ecommerce.compra c \
            WHERE 1=1 \
        ";
        
        let compra = "";
        
        compra += queryStr.id ? " AND c.id = " + queryStr.id : "";
        compra += queryStr.status ? " AND c.status = " + queryStr.status : "";
        
        if ( validaData( queryStr.data_ini ) ) {
            let data_ini = queryStr.data_ini;
            data_ini = moment(data_ini, "D M YYYY").format("YYYY-MM-DD");
            compra += ` AND c.data >= '${data_ini}'::date`;
        }
        
        if ( validaData( queryStr.data_fim ) ) {
            let data_fim = queryStr.data_fim;
            data_fim = moment(data_fim, "D M YYYY").format("YYYY-MM-DD");
            compra += ` AND c.data <= '${data_fim}'::date`;
        }
        
        const query = select + compra;
        
        compras = await pool.query(query).then(results => results.rows).catch(error => {if (error) throw error});
        
        await getProdutosCompra(compras);
        await getPagamentosCompra(compras);
        await getFornecedorCompra(compras);
        
        response.status(200).json(compras);
        
    } catch (err) {
        response.status(400).json(err);
    }
}

const insertCompra = async (request, response) => {
    
    try {
        validationResult(request).throw();
        
        let params = request.body;
        let produtos = params.produtos;
        const pagamentos = params.pagamentos;
        const fornecedor = params.fornecedor;
        
        if ( !params.data ) {
            params.data = moment().format("D M YYYY"); 
        }
        
        if ( !validaData( params.data ) ) { 
            throw new Error('A data informada está em um formato inválido!') 
        };
        
        params.data = moment(params.data, "D M YYYY").format("YYYY-MM-DD")
        
        try {
            await pool.query('BEGIN');
            
            let query = "INSERT INTO ecommerce.compra (data, status, frete, desconto) VALUES ('" 
            + params.data + "'::date, '" 
            + params.status + "', '" 
            + params.frete + "', '" 
            + params.desconto + "') RETURNING id";
            
            const compra = await pool
            .query(query)
            .then(results => results.rows[0].id)
            .catch( error => { if ( error ) { throw error } } );
            
            await insertProdutosCompra(produtos, compra);
            
            await insertPagamentosCompra(pagamentos, compra);
            
            await insertFornecedorCompra(fornecedor, compra);
            
            await pool.query('COMMIT');
            response.status(200).json({mensagem: "Compra registrada com sucesso!", id_compra: compra});
            
        } catch (err) {
            await pool.query('ROLLBACK');
            throw err;
        }
        
    } catch (err) {
        console.log(err.stack);
        response.status(400).json(err);
    }
}

const editCompra = async (request, response) => {
    
    try {
        validationResult(request).throw();
        
        const compra = request.params.id;
        const params = request.body[0];

        const fornecedor = params.fornecedor.id;
        const pagamentos = params.pagamentos;
        const produtos = params.produtos;
        
        params.data = moment(params.data, "D M YYYY").format("YYYY-MM-DD")
        
        try {
            await pool.query('BEGIN');
            
            query = "\
                UPDATE ecommerce.compra \
                SET \
                    status = '" + params.status + "', \
                    desconto = '" + params.desconto + "', \
                    data = '" + params.data + "'::date, \
                    frete = '" + params.frete + "' \
                WHERE id = " + compra
            
            await pool.query(query);
            
            await editPagamentosCompra(pagamentos);
            await editProdutosCompra(produtos); 
            await editFornecedorCompra(fornecedor, compra);
            
            await pool.query('COMMIT');
            response.status(200).json({mensagem: "Dados da compra atualizados com sucesso!", id_compra: compra});
            
        } catch (err) {
            await pool.query('ROLLBACK');
            throw err;
        }               
    } catch (err) {
        response.status(400).json(err);    
    }
}

const removeCompra = async (request, response) => {
    
    try {
        validationResult(request).throw();
        
        const compra = request.params.id;
        let query = "";
        
        try {
            await pool.query('BEGIN');
            
            query = "DELETE FROM ecommerce.pagamento WHERE id IN (SELECT pagamento FROM ecommerce.compra_pagamento WHERE compra = " + compra + ")";
            await pool.query(query).then().catch(error => { if (error) {throw error} });
            
            query = "DELETE FROM ecommerce.compra WHERE id = " + compra; 
            await pool.query(query).then().catch(error => { if (error) {throw error} });
            
            await pool.query('COMMIT');
            response.status(200).json({mensagem: "Compra removida com sucesso!", id_compra: compra});
            
        } catch (err) {
            await pool.query('ROLLBACK');
            throw err;
        }
        
    } catch (err) {
        response.status(400).json(err);    
    }
}

/** FUNÇÕES DE VALIDAÇÃO */
const validaData = function ( data ) {
    //Verifica se a data passada está no formato utilizado na API 
    return ( data && moment(data, "D M YYYY").isValid() )
}

/** FUNÇÕES AUXILIARES */
const editPagamentosCompra = async (pagamentos) => {

    let query = "";
    for (let i = 0; i < pagamentos.length; i++) {
        
        query = " \
            UPDATE ecommerce.pagamento \
            SET \
                forma_pagamento = '" + pagamentos[i].forma_pagamento + "', \
                valor = " + pagamentos[i].valor + " \
            WHERE id = " + pagamentos[i].id
        
        await pool.query(query).then().catch(err => {if (err) throw err});
    }
}

const editFornecedorCompra = async (fornecedor, compra) => {

    let query = "\
        UPDATE ecommerce.fornecedor_compra \
        SET fornecedor = " + fornecedor + " \
        WHERE compra = " + compra;
    
    await pool.query(query).then().catch(err => {if (err) throw err});
    
}

const editProdutosCompra = async (produtos) => {

    let query = "";
    for (let i = 0; i < produtos.length; i++) {

        query = " \
            UPDATE ecommerce.compra_produto \
            SET \
                produto = " + produtos[i].id + ", \
                quantidade = " + produtos[i].quantidade + " \
            WHERE id = " + produtos[i].id_compra_produto

        await pool.query(query).then().catch(err => {if (err) throw err});    
    }
}

const getProdutosCompra = async (compras) => {
    
    // Retorna os produtos associados a compra (uma compra pode ter vários produtos comprados)
    for(let i = 0; i < compras.length; i++) {
        
        const query = " \
            SELECT p.id, p.nome, cp.quantidade, cp.id as id_compra_produto, p.tipo as tipo_produto, p.tamanho_numerico, \
            p.tamanho_literal, p.custo as custo_unitario, p.desconto_custo, p.preco_venda, p.desconto_preco_venda \
            FROM ecommerce.produto p \
            JOIN ecommerce.compra_produto cp ON p.id = cp.produto \
            WHERE cp.compra = " + compras[i].id
        
        await pool.query(query).then(result => compras[i].produtos = result.rows).catch(error => {if (error) throw error});
    }
}

const getPagamentosCompra = async (compras) => {
    
    // Retorna os pagamentos associados a compra (uma compra pode ter vários pagamentos)     
    for (let i = 0; i < compras.length; i++) {
        
        const query = " \
            SELECT p.id, p.forma_pagamento, p.valor \
            FROM ecommerce.pagamento p \
            JOIN ecommerce.compra_pagamento cp ON p.id = cp.pagamento \
            WHERE cp.compra = " + compras[i].id;
        
        await pool.query(query).then(results => compras[i].pagamentos = results.rows).catch(error => {if (error) throw error});
    }
}

const getFornecedorCompra = async (compras) => {
    
    for(let i = 0; i < compras.length; i++) {
        
        const query = " \
            SELECT f.id, p.tipo_p as tipo_pessoa, p.cnpj, p.nome, p.data_nascimento, p.telefone \
            FROM ecommerce.pessoa p \
            JOIN ecommerce.fornecedor f ON p.id = f.pessoa \
            JOIN ecommerce.fornecedor_compra fc ON f.id = fc.fornecedor \
            WHERE fc.compra = " + compras[i].id
        
        await pool.query(query).then(results => compras[i].fornecedor = results.rows[0]).catch(error => {if (error) throw error});
    }
}

const insertProdutosCompra = async (produtos, compra) => {
    
    /** Ajusta registros na tabela compra_produto de acordo com a compra feita e os produtos comprados */
    for (let i = 0; i < produtos.length; i++) {
        
        let query = "INSERT INTO ecommerce.compra_produto (compra, produto, quantidade) VALUES ("
        + compra + ", "
        + produtos[i].produto + ", "
        + produtos[i].quantidade + ")"
        
        await pool.query(query).then().catch((error, results) => { if (error) { throw error } })
    }  
}

const insertPagamentosCompra = async (pagamentos, compra) => {
    
    /** Ajusta registros na tabela compra_pagamento de acordo com a compra feita e os pagamentos realizados */
    let pagamento = null;
    let query = "";
    
    for (let i = 0; i < pagamentos.length; i++) {
        
        query = "INSERT INTO ecommerce.pagamento (forma_pagamento, valor) VALUES ('"
        + pagamentos[i].forma_pagamento + "', '" 
        + pagamentos[i].valor + "') RETURNING id";
        
        pagamento = await pool
        .query( query )
        .then( results => results.rows[0].id )
        .catch((error, results) => { if (error) { throw error } })
        
        query = "INSERT INTO ecommerce.compra_pagamento (compra, pagamento) VALUES ("
        + compra + ", "
        + pagamento + ")";
        
        await pool.query( query ).then().catch((error, results) => { if (error) { throw error } });
    }   
}

const insertFornecedorCompra = async (fornecedor, compra) => {
    
    /** Ajusta registro na tabela fornecedor_compra de acordo com a compra feita no fornecedor x */
    query = "INSERT INTO ecommerce.fornecedor_compra (compra, fornecedor) VALUES ("
    + compra + ", "
    + fornecedor + ")"
    
    await pool.query(query).then().catch((error, results) => { if (error) { throw error } })
}

module.exports = {
    getCompras,
    insertCompra,
    editCompra,
    removeCompra
}
