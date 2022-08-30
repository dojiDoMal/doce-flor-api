const { pool } = require('./../../config/db_connection');
const { validationResult } = require( 'express-validator' );

// Ex: http://localhost:5050/bairro?nome=Pr&id_cidade=15&id=40
const getBairros = (request, response) => {

    try {
        validationResult(request).throw();

        let queryStr = request.query;
        
        const select = "SELECT * FROM bairro";
        let where = " WHERE 1=1";

        const nome = queryStr.nome ? " AND nome LIKE '%" + queryStr.nome + "%'" : "";
        const id = queryStr.id ? " AND id=" + queryStr.id : "";
        const estado = queryStr.id_cidade ? " AND cidade IN (SELECT c.id FROM cidade c WHERE c.id=" + queryStr.id_cidade + ")" : "";

        where += nome + id + estado;
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

module.exports = {
    getBairros
}
