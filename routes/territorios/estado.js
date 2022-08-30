const { pool } = require('./../../config/db_connection');
const { validationResult } = require( 'express-validator' );

// Ex: http://localhost:5050/estado?nome=Am&id=13&id_pais=1
const getEstados = (request, response) => {

    try {
        validationResult(request).throw();

        let queryStr = request.query;
        
        const select = "SELECT * FROM estado";
        let where = " WHERE 1=1";

        const nome = queryStr.nome ? " AND nome LIKE '%" + queryStr.nome + "%'" : "";
        const id = queryStr.id ? " AND id=" + queryStr.id : "";
        const pais = queryStr.id_pais ? " AND pais IN (SELECT p.id FROM pais p WHERE p.id=" + queryStr.id_pais + ")" : "";

        where += nome + id + pais;
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
    getEstados
}
