const { pool } = require('./../../config/db_connection');
const crypt = require('bcrypt');

const validadeToken = 7200000; // 2 horas
let tokensAtivos = [];

const Registrar = async (request, response) => {
    
    let nome = request.body.nome;
    let senha = request.body.senha;
    
    const salt = await crypt.genSalt(10);
    senha = await crypt.hash(senha, salt);
    
    const query = "INSERT INTO usuarios (nome, senha) VALUES ('" + nome + "', '" + senha + "') RETURNING id";
    
    pool.query(query, (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const Entrar = async (request, response) => {
    
    let nome = request.body.nome;
    let senha = request.body.senha;
    
    const query = "SELECT * FROM usuarios WHERE nome = '" + nome + "'";
    
    let usuario = await pool
        .query(query)
        .then(results => results.rows[0])
        .catch(error => { if ( error ) { throw error } } );
    
    if ( usuario ) {
        
        const senhaValida = await crypt.compare(senha, usuario.senha);

        if ( senhaValida ) {

            const data = Date.now().toString();
            const salt = await crypt.genSalt(10);
            const tokenHash = await crypt.hash(data, salt).then( tk => tk.substring( tk.length/2 ) );
            const token = { usuario: usuario.nome, hash: tokenHash, criadoEm: data, expiraEm: validadeToken };

            if ( tokensAtivos.find(o => o.usuario == token.usuario) ) {

                let index = 0;
                tokensAtivos.find((o, i) => {
                    if ( o.usuario == token.usuario ) { index = i };
                });

                if ( tokenExpirado(token) ) {
                    tokensAtivos.splice(index);
                    tokensAtivos.push(token)
                } else {
                    response.status(200).json({ message: "Sessão Ativa", token: tokensAtivos[index] });
                }

            } else {
                tokensAtivos.push(token);  
                response.status(200).json({ message: "Login Autorizado", token });  
            }    

        } else {
            response.status(400).json({error: "Senha Inválida"});
        }
        
    } else {
        response.status(401).json({error: "Usuário e Senha inválidos"})
    }
}

const tokenExpirado = ( token ) => {

    return Date.now() > Number( token.criadoEm ) + token.expiraEm;
}

module.exports = {
    Registrar,
    Entrar,
    tokensAtivos
}
