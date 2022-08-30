const moment = require('moment');
const { pool } = require('./../../config/db_connection');
const { validationResult } = require( 'express-validator' );

// Ex: localhost:5050/venda?id=2
//     localhost:5050/venda?data_ini=14-8-2022
const getVendas = async (request, response) => {
    
    try {
        validationResult(request).throw();
        
        let queryStr = request.query;
        let vendas = [];
        
        const select = " \
            SELECT v.id, v.data, v.status \
            FROM ecommerce.venda v \
            WHERE 1=1 \
        ";
        
        let venda = "";  
        venda += queryStr.id ? " AND v.id = " + queryStr.id : "";
        venda += queryStr.status ? " AND v.status = " + queryStr.status : "";
        
        if ( validaData( queryStr.data_ini ) ) {
            let data_ini = queryStr.data_ini;
            data_ini = moment(data_ini, "D M YYYY").format("YYYY-MM-DD");
            venda += ` AND v.data >= '${data_ini}'::date`;
        }
        
        if ( validaData( queryStr.data_fim ) ) {
            let data_fim = queryStr.data_fim;
            data_fim = moment(data_fim, "D M YYYY").format("YYYY-MM-DD");
            venda += ` AND v.data <= '${data_fim}'::date`;
        }
        
        const query = select + venda;
        
        vendas = await pool.query(query).then(results => results.rows).catch(error => {if (error) throw error});
        
        await getProdutosVenda(vendas);
        await getPagamentosVenda(vendas);
        await getClientesVenda(vendas);
        await getEntregasVenda(vendas);
        
        response.status(200).json(vendas);
        
    } catch (err) {
        response.status(400).json(err);
    }
}

const insertVenda = async (request, response) => {
    
    try {
        validationResult(request).throw();
        
        let params = request.body;
        let produtos = params.produtos;
        const pagamentos = params.pagamentos;
        const cliente = params.cliente;
        
        if ( !params.data ) {
            params.data = moment().format("D M YYYY"); 
        }
        
        if ( !validaData( params.data ) ) { 
            throw new Error('A data informada está em um formato inválido!') 
        };
        
        params.data = moment(params.data, "D M YYYY").format("YYYY-MM-DD")
        
        try {
            await pool.query('BEGIN');
            
            let query = "INSERT INTO ecommerce.venda (data, status) VALUES ('" 
                + params.data + "'::date, '" 
                + params.status + "') RETURNING id";
            
            const venda = await pool
                .query(query)
                .then(results => results.rows[0].id)
                .catch(error => { if ( error ) { throw error } });
            
            await insertProdutosVenda(produtos, venda);
            await insertPagamentosVenda(pagamentos, venda);     
            await insertClienteVenda(cliente, venda);
            
            await pool.query('COMMIT');
            response.status(200).json({mensagem: "Venda registrada com sucesso!", id_venda: venda});
            
        } catch (err) {
            await pool.query('ROLLBACK');
            throw err;
        }
        
    } catch (err) {
        console.log(err.stack);
        response.status(400).json(err);
    }
}

const editVenda = async (request, response) => {
    
    try {
        validationResult(request).throw();
        
        const venda = request.params.id;
        const params = request.body[0];

        const cliente = params.cliente.id;
        const pagamentos = params.pagamentos;
        const produtos = params.produtos;
        
        params.data = moment(params.data, "D M YYYY").format("YYYY-MM-DD")
        
        try {
            await pool.query('BEGIN');
            
            query = "\
                UPDATE ecommerce.venda \
                SET \
                    status = '" + params.status + "', \
                    data = '" + params.data + "'::date \
                WHERE id = " + venda
            
            await pool.query(query);
            
            await editPagamentosVenda(pagamentos);
            await editProdutosVenda(produtos); 
            await editClienteVenda(cliente, venda);
            
            await pool.query('COMMIT');
            response.status(200).json({mensagem: "Dados da venda atualizados com sucesso!", id_venda: venda});
            
        } catch (err) {
            await pool.query('ROLLBACK');
            throw err;
        }               
    } catch (err) {
        response.status(400).json(err);    
    }
}

const removeVenda = async (request, response) => {
    
    try {
        validationResult(request).throw();
        
        const venda = request.params.id;
        let query = "";
        
        try {
            await pool.query('BEGIN');
            
            query = "DELETE FROM ecommerce.pagamento \
                WHERE id IN (SELECT pagamento FROM ecommerce.venda_pagamento WHERE venda = " + venda + ")";

            await pool.query(query).then().catch(error => { if (error) {throw error} });
            
            query = "DELETE FROM ecommerce.venda WHERE id = " + venda; 
            await pool.query(query).then().catch(error => { if (error) {throw error} });
            
            await pool.query('COMMIT');
            response.status(200).json({mensagem: "Venda removida com sucesso!", id_venda: venda});
            
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
const getEntregasVenda = async (vendas) => {
    
    // Retorna as entregas associados a venda 
    for(let i = 0; i < vendas.length; i++) {
        
        const query = " \
            SELECT e.id, e.data, vp.produto as id_produto, vp.quantidade as qtd_produto, \
                d.rua, d.numero, d.complemento, d.cep, b.nome as nome_bairro, est.sigla as sigla_estado, cid.nome as nome_cidade, \
                pa.nome as nome_pais, prod.nome as nome_prod, prod.tamanho_numerico, prod.tamanho_literal \
            FROM ecommerce.entrega e \
            JOIN ecommerce.endereco d ON e.endereco = d.id \
            JOIN bairro b ON d.bairro = b.id \
            JOIN cidade cid ON d.cidade = cid.id \
            JOIN estado est ON d.estado = est.id \
            JOIN pais pa ON d.pais = pa.id \
            JOIN ecommerce.entrega_venda_produto evp ON e.id = evp.entrega \
            JOIN ecommerce.venda_produto vp ON evp.venda_produto = vp.id \
            JOIN ecommerce.produto prod ON vp.produto = prod.id \
            WHERE evp.venda = " + vendas[i].id
        
        await pool.query(query).then( ( result ) => {

            vendas[i].entregas = result.rows;
            
            for (let k = 0; k < result.rows.length; k++) {
                
                vendas[i].entregas[k].data = { 
                    dia: moment(result.rows[k].data).format("DD/MM/YYYY"),
                    horario: moment(result.rows[k].data).format("HH:MM"),
                }

                vendas[i].entregas[k].produto = {
                    id: result.rows[k].id_produto,
                    nome: result.rows[k].nome_prod,
                    tamanho: result.rows[k].tamanho_numerico 
                        ? result.rows[k].tamanho_literal + " (" + result.rows[k].tamanho_numerico + ")" 
                        : result.rows[k].tamanho_literal,
                    //quantidade: result.rows[k].qtd_produto, 
                }

                vendas[i].entregas[k].endereco = {
                    rua: result.rows[k].rua,
                    numero: result.rows[k].numero,
                    complemento: result.rows[k].complemento,
                    cep: result.rows[k].cep,
                    bairro: result.rows[k].nome_bairro,
                    cidade: result.rows[k].nome_cidade,
                    estado: result.rows[k].sigla_estado,
                    pais: result.rows[k].nome_pais,
                }; 

                delete vendas[i].entregas[k].rua;
                delete vendas[i].entregas[k].numero;
                delete vendas[i].entregas[k].complemento;
                delete vendas[i].entregas[k].cep;
                delete vendas[i].entregas[k].nome_bairro;
                delete vendas[i].entregas[k].nome_cidade;
                delete vendas[i].entregas[k].sigla_estado;
                delete vendas[i].entregas[k].nome_pais;
                delete vendas[i].entregas[k].nome_prod;
                delete vendas[i].entregas[k].id_produto;
                delete vendas[i].entregas[k].tamanho_numerico;
                delete vendas[i].entregas[k].tamanho_literal;
                delete vendas[i].entregas[k].qtd_produto;
            }

        }).catch(error => {if (error) throw error});
    }
}

const getProdutosVenda = async (vendas) => {
    
    // Retorna os produtos associados a venda (uma venda pode ter vários produtos comprados)
    for(let i = 0; i < vendas.length; i++) {
        
        const query = " \
            SELECT p.id, p.nome, vp.quantidade, vp.id as id_venda_produto, p.tipo as tipo_produto, p.tamanho_numerico, \
            p.tamanho_literal, p.custo as custo_unitario, p.desconto_custo, p.preco_venda, p.desconto_preco_venda \
            FROM ecommerce.produto p \
            JOIN ecommerce.venda_produto vp ON p.id = vp.produto \
            WHERE vp.venda = " + vendas[i].id
        
        await pool.query(query).then(result => vendas[i].produtos = result.rows).catch(error => {if (error) throw error});
    }
}

const getPagamentosVenda = async (vendas) => {
    
    // Retorna os pagamentos associados a venda (uma venda pode ter vários pagamentos)     
    for (let i = 0; i < vendas.length; i++) {
        
        const query = " \
            SELECT p.id, p.forma_pagamento, p.valor \
            FROM ecommerce.pagamento p \
            JOIN ecommerce.venda_pagamento vp ON p.id = vp.pagamento \
            WHERE vp.venda = " + vendas[i].id;
        
        await pool.query(query).then(results => vendas[i].pagamentos = results.rows).catch(error => {if (error) throw error});
    }
}

const getClientesVenda = async (vendas) => {
    
    for(let i = 0; i < vendas.length; i++) {
        
        const query = " \
            SELECT c.id, p.tipo_p as tipo_pessoa, p.cnpj, p.nome, p.data_nascimento, p.telefone \
            FROM ecommerce.pessoa p \
            JOIN ecommerce.cliente c ON p.id = c.pessoa \
            JOIN ecommerce.cliente_venda cv ON c.id = cv.cliente \
            WHERE cv.venda = " + vendas[i].id
        
        await pool.query(query).then(results => vendas[i].cliente = results.rows[0]).catch(error => {if (error) throw error});
    }
}

const insertProdutosVenda = async (produtos, venda) => {
    
    /** Ajusta registros na tabela venda_produto de acordo com os produtos comprados na venda */
    for (let i = 0; i < produtos.length; i++) {
        
        let query = "INSERT INTO ecommerce.venda_produto (venda, produto, quantidade) VALUES ("
            + venda + ", "
            + produtos[i].produto + ", "
            + produtos[i].quantidade + ")"
        
        await pool.query(query).then().catch((error, results) => { if (error) { throw error } })
    }  
}

const insertPagamentosVenda = async (pagamentos, venda) => {
    
    /** Ajusta registros na tabela venda_pagamento de acordo com os pagamentos realizados */
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
        
        query = "INSERT INTO ecommerce.venda_pagamento (venda, pagamento) VALUES ("
            + venda + ", "
            + pagamento + ")";
        
        await pool.query(query).then().catch((error, results) => { if (error) { throw error } });
    }   
}

const insertClienteVenda = async (cliente, venda) => {
    
    /** Ajusta registro na tabela cliente_venda */
    query = "INSERT INTO ecommerce.cliente_venda (venda, cliente) VALUES ("
        + venda + ", "
        + cliente + ")"
    
    await pool.query(query).then().catch((error, results) => { if (error) { throw error } })
}

const editPagamentosVenda = async (pagamentos) => {

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

const editClienteVenda = async (cliente, venda) => {

    let query = "\
        UPDATE ecommerce.cliente_venda \
        SET cliente = " + cliente + " \
        WHERE venda = " + venda;
    
    await pool.query(query).then().catch(err => {if (err) throw err});
    
}

const editProdutosVenda = async (produtos) => {

    let query = "";
    for (let i = 0; i < produtos.length; i++) {

        query = " \
            UPDATE ecommerce.venda_produto \
            SET \
                produto = " + produtos[i].id + ", \
                quantidade = " + produtos[i].quantidade + " \
            WHERE id = " + produtos[i].id_venda_produto

        await pool.query(query).then().catch(err => {if (err) throw err});    
    }
}

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
    getVendas,
    insertVenda,
    editVenda,
    removeVenda,
    removeProdutoVenda,
}
