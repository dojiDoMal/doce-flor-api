const { checkSchema } = require('express-validator');
const MSG_ERRO = require('./../mensagens-erro');

const pais = checkSchema({
    id: {
        in: ['query'],
        optional: { options: { nullable: true } },
        isInt: true,
        errorMessage: MSG_ERRO.ID_PAIS_INVALIDO
    },
    nome: {
        in: ['query'],
        optional: { options: { nullable: true } },
        isAlpha: {
            options: [['pt-BR'],{ignore: [' -']}],
            errorMessage: MSG_ERRO.NOME_PAIS_INVALIDO
        },        
    },
})

const estado = checkSchema({
    id: {
        in: ['query'],
        optional: { options: { nullable: true } },
        isInt: true,
        errorMessage: MSG_ERRO.ID_ESTADO_INVALIDO
    },
    id_pais: {
        in: ['query'],
        optional: { options: { nullable: true } },
        isInt: true,
        errorMessage: MSG_ERRO.ID_PAIS_INVALIDO
    },
    nome: {
        in: ['query'],
        optional: { options: { nullable: true } },
        isAlpha: {
            options: [['pt-BR'],{ignore: [' -']}],
            errorMessage: MSG_ERRO.NOME_ESTADO_INVALIDO
        },        
    },
})

const cidade = checkSchema({
    id: {
        in: ['query'],
        optional: { options: { nullable: true } },
        isInt: true,
        errorMessage: MSG_ERRO.ID_CIDADE_INVALIDA
    },
    id_estado: {
        in: ['query'],
        optional: { options: { nullable: true } },
        isInt: true,
        errorMessage: MSG_ERRO.ID_ESTADO_INVALIDO
    },
    nome: {
        in: ['query'],
        optional: { options: { nullable: true } },
        isAlpha: {
            options: [['pt-BR'],{ignore: [' -']}],
            errorMessage: MSG_ERRO.NOME_CIDADE_INVALIDA
        },        
    },
})

const bairro = checkSchema({
    id: {
        in: ['query'],
        optional: { options: { nullable: true } },
        isInt: true,
        errorMessage: MSG_ERRO.ID_BAIRRO_INVALIDO
    },
    id_cidade: {
        in: ['query'],
        optional: { options: { nullable: true } },
        isInt: true,
        errorMessage: MSG_ERRO.ID_CIDADE_INVALIDA
    }
})

const cliente = {
    get: checkSchema({
        id_pessoa: {
            in: ['query'],
            optional: { options: { nullable: true } },
            isInt: true,
            errorMessage: MSG_ERRO.ID_PESSOA_INVALIDO
        },
        nome: {
            in: ['query'],
            optional: { options: { nullable: true } },
            isAlpha: {
                options: [['pt-BR'],{ignore: [' -']}],
                errorMessage: MSG_ERRO.NOME_PESSOA_INVALIDO
            },        
        },
    }),
    post: checkSchema({
        telefone: {
            in: ['body'],
            optional: { options: { nullable: true } },
            isNumeric: true,
            errorMessage: MSG_ERRO.TELEFONE_PESSOA_INVALIDO
        },
        nome: {
            in: ['body'],
            optional: { options: { nullable: true } },
            isAlpha: {
                options: [['pt-BR'], {ignore: [' -']}],
                errorMessage: MSG_ERRO.NOME_PESSOA_INVALIDO
            },        
        },
    }),
    put: checkSchema({
        id: {
            in: ['params'],
            isInt: true,
            errorMessage: MSG_ERRO.ID_CLIENTE_INVALIDO
        },
        telefone: {
            in: ['body'],
            optional: { options: { nullable: true } },
            isNumeric: true,
            errorMessage: MSG_ERRO.TELEFONE_PESSOA_INVALIDO
        },
        nome: {
            in: ['body'],
            optional: { options: { nullable: true } },
            isAlpha: {
                options: [['pt-BR'], {ignore: [' -']}],
                errorMessage: MSG_ERRO.NOME_PESSOA_INVALIDO
            },        
        },
    }),   
    delete: checkSchema({
        id: {
            in: ['params'],
            isInt: true,
            errorMessage: MSG_ERRO.ID_CLIENTE_INVALIDO
        },
    }),
}

const fornecedor = {
    get: checkSchema({
        id_pessoa: {
            in: ['query'],
            optional: { options: { nullable: true } },
            isInt: true,
            errorMessage: MSG_ERRO.ID_PESSOA_INVALIDO
        },
        nome: {
            in: ['query'],
            optional: { options: { nullable: true } },
            isAlpha: {
                options: [['pt-BR'],{ignore: [' -']}],
                errorMessage: MSG_ERRO.NOME_PESSOA_INVALIDO
            },        
        },
    }),
    post: checkSchema({
        telefone: {
            in: ['body'],
            optional: { options: { nullable: true } },
            isNumeric: true,
            errorMessage: MSG_ERRO.TELEFONE_PESSOA_INVALIDO
        },
        nome: {
            in: ['body'],
            optional: { options: { nullable: true } },
            isAlpha: {
                options: [['pt-BR'], {ignore: [' -']}],
                errorMessage: MSG_ERRO.NOME_PESSOA_INVALIDO
            },        
        },
    }),
    put: checkSchema({
        id: {
            in: ['params'],
            isInt: true,
            errorMessage: MSG_ERRO.ID_FORNECEDOR_INVALIDO
        },
        nome: {
            in: ['body'],
            optional: { options: { nullable: true } },
            isAlpha: {
                options: [['pt-BR'], {ignore: [' -']}],
                errorMessage: MSG_ERRO.NOME_PESSOA_INVALIDO
            },        
        },
        telefone: {
            in: ['body'],
            optional: { options: { nullable: true } },
            isNumeric: true,
            errorMessage: MSG_ERRO.TELEFONE_PESSOA_INVALIDO
        },
    }),   
    delete: checkSchema({
        id: {
            in: ['params'],
            isInt: true,
            errorMessage: MSG_ERRO.ID_FORNECEDOR_INVALIDO
        },
    }),
}

const endereco = {
    get: checkSchema({
        id_pessoa: {
            in: ['query'],
            isInt: true,
            errorMessage: MSG_ERRO.ID_PESSOA_INVALIDO
        },
    }),
    post: checkSchema({
        pais: {
            in: ['body'],
            isInt: true,
            errorMessage: MSG_ERRO.ID_PAIS_INVALIDO
        },
        estado: {
            in: ['body'],
            isInt: true,
            errorMessage: MSG_ERRO.ID_ESTADO_INVALIDO
        },
        cidade: {
            in: ['body'],
            isInt: true,
            errorMessage: MSG_ERRO.ID_CIDADE_INVALIDA
        },
        bairro: {
            in: ['body'],
            isInt: true,
            errorMessage: MSG_ERRO.ID_BAIRRO_INVALIDO
        },
        pessoa: {
            in: ['body'],
            optional: { options: { nullable: true } },
            isInt: true,
            errorMessage: MSG_ERRO.ID_PESSOA_INVALIDO
        },
        cep: {
            in: ['body'],
            optional: { options: { nullable: true } },
            isNumeric: true,
            errorMessage: MSG_ERRO.CEP_ENDERECO_INVALIDO
        },
        numero: {
            in: ['body'],
            optional: { options: { nullable: true } },
            isNumeric: true,
            errorMessage: MSG_ERRO.NUMERO_ENDERECO_INVALIDO
        },
        rua: {
            in: ['body'],
            optional: { options: { nullable: true } },
            isAlphanumeric: {
                options: [['pt-BR'], {ignore: [' -']}],
                errorMessage: MSG_ERRO.RUA_ENDERECO_INVALIDO
            },        
        },
    }),
    put: checkSchema({
        id: {
            in: ['params'],
            isInt: true,
            errorMessage: MSG_ERRO.ID_ENDERECO_INVALIDO
        },
        pais: {
            in: ['body'],
            isInt: true,
            errorMessage: MSG_ERRO.ID_PAIS_INVALIDO
        },
        estado: {
            in: ['body'],
            isInt: true,
            errorMessage: MSG_ERRO.ID_ESTADO_INVALIDO
        },
        cidade: {
            in: ['body'],
            isInt: true,
            errorMessage: MSG_ERRO.ID_CIDADE_INVALIDA
        },
        bairro: {
            in: ['body'],
            isInt: true,
            errorMessage: MSG_ERRO.ID_BAIRRO_INVALIDO
        },
        cep: {
            in: ['body'],
            isNumeric: true,
            errorMessage: MSG_ERRO.CEP_ENDERECO_INVALIDO
        },
        numero: {
            in: ['body'],
            isNumeric: true,
            errorMessage: MSG_ERRO.NUMERO_ENDERECO_INVALIDO
        },
        rua: {
            in: ['body'],
            optional: { options: { nullable: true } },
            isAlphanumeric: {
                options: [['pt-BR'], {ignore: [' -']}],
                errorMessage: MSG_ERRO.RUA_ENDERECO_INVALIDO
            },        
        },
        pessoa: {
            in: ['body'],
            optional: { options: { nullable: true } },
            isInt: true,
            errorMessage: MSG_ERRO.ID_PESSOA_INVALIDO
        },   
    }),  
    delete: checkSchema({
        id: {
            in: ['params'],
            isInt: true,
            errorMessage: MSG_ERRO.ID_ENDERECO_INVALIDO
        },
    }),
}

const compra = {
    get: checkSchema({ 
        status: {
            in: ['query'],
            optional: { options: { nullable: true } },
            isAlpha: {
                options: [['pt-BR'],{ignore: [' -']}],
                errorMessage: MSG_ERRO.STATUS_COMPRA_INVALIDO
            },        
        },
        id: {
            in: ['query'],
            optional: { options: { nullable: true } },
            isInt: true,
            errorMessage: MSG_ERRO.ID_COMPRA_INVALIDO
        },
    }),
    post: checkSchema({
        status: {
            in: ['body'],
            optional: { options: { nullable: true } },
            isAlpha: {
                options: [['pt-BR'], {ignore: [' -']}],
                errorMessage: MSG_ERRO.STATUS_COMPRA_INVALIDO
            },        
        },
        fornecedor: {
            in: ['body'],
            isInt: true,
            errorMessage: MSG_ERRO.ID_FORNECEDOR_INVALIDO
        },
    }),
    put: checkSchema({
        id: {
            in: ['params'],
            isInt: true,
            errorMessage: MSG_ERRO.ID_COMPRA_INVALIDO
        },
    }),   
    delete: checkSchema({
        id: {
            in: ['params'],
            isInt: true,
            errorMessage: MSG_ERRO.ID_COMPRA_INVALIDO
        },
    }),
}

const venda = {
    get: checkSchema({ 
        status: {
            in: ['query'],
            optional: { options: { nullable: true } },
            isAlpha: {
                options: [['pt-BR'],{ignore: [' -']}],
                errorMessage: MSG_ERRO.STATUS_VENDA_INVALIDO
            },        
        },
        id: {
            in: ['query'],
            optional: { options: { nullable: true } },
            isInt: true,
            errorMessage: MSG_ERRO.ID_VENDA_INVALIDO
        },
    }),
    post: checkSchema({
        status: {
            in: ['body'],
            optional: { options: { nullable: true } },
            isAlpha: {
                options: [['pt-BR'], {ignore: [' -']}],
                errorMessage: MSG_ERRO.STATUS_VENDA_INVALIDO
            },        
        },
        cliente: {
            in: ['body'],
            isInt: true,
            errorMessage: MSG_ERRO.ID_CLIENTE_INVALIDO
        },
    }),
    put: checkSchema({
        id: {
            in: ['params'],
            isInt: true,
            errorMessage: MSG_ERRO.ID_VENDA_INVALIDO
        },
    }),   
    delete: checkSchema({
        id: {
            in: ['params'],
            isInt: true,
            errorMessage: MSG_ERRO.ID_VENDA_INVALIDO
        },
    }),
}

const produto = {
    get: checkSchema({
        id: {
            in: ['query'],
            optional: { options: { nullable: true } },
            isInt: true,
            errorMessage: MSG_ERRO.ID_PRODUTO_INVALIDO
        },
    }),
    delete: checkSchema({
        id: {
            in: ['params'],
            isInt: true,
            errorMessage: MSG_ERRO.ID_PRODUTO_INVALIDO
        },
    }),
}

const pagamento = {
    delete: checkSchema({
        id: {
            in: ['params'],
            isInt: true,
            errorMessage: MSG_ERRO.ID_PAGAMENTO_INVALIDO
        },
    }),
}

const entrega = {
    delete: checkSchema({
        id: {
            in: ['params'],
            isInt: true,
            errorMessage: MSG_ERRO.ID_ENTREGA_INVALIDO
        },
    }),
}

module.exports = {
    pais,
    estado,
    cidade,
    bairro,
    cliente,
    fornecedor,
    endereco,
    compra,
    venda,
    produto,
    pagamento,
    entrega,
}