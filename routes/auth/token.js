require('dotenv').config()

const usuario = require('./user');

const isProduction = process.env.NODE_ENV === 'production';

const tokenMiddleware = (request, response, next) => {
    
    if ( isProduction ) {

        const tokenUsuario = request.headers["access-token"];
        if ( !tokenUsuario ) {
            return response.status(401).json({mensagem: "Você não possui permissão para realizar essa operação"});
        }
        
        let index = null;
        usuario.tokensAtivos.find((o, i) => {
            if ( o.hash === tokenUsuario ) { index = i };
        });
        
        if ( index !== 0 && !index ) {
            return response.status(401).json({mensagem: "Você não possui permissão para realizar essa operação"});
        }
        
        if ( Date.now() > Number(usuario.tokensAtivos[index].criadoEm) + usuario.tokensAtivos[index].expiraEm ) {
            usuario.tokensAtivos.splice(index);
            return response.status(403).json({mensagem: "Sessão expirada. Por favor faça login novamente!"});
        }
        
        next();
    } else {
        next();
    }
}

module.exports = { tokenMiddleware };