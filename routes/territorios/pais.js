const { pool } = require('./../../config/db_connection');
const { validationResult } = require( 'express-validator' );

// Ex: http://localhost:5050/estado?nome=Bra&id=1
const getPaises = (request, response) => {

    try {
        validationResult(request).throw();

        let queryStr = request.query;
        
        const select = "SELECT * FROM pais";
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

module.exports = {
    getPaises
}
