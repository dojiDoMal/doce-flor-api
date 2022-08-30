/** INFO API VALIDACAO
 * https://express-validator.github.io/docs/check-api.html
 * https://github.com/validatorjs/validator.js#validators 
 */
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');

const valida = require('./routes/valida');

const auth = require('./routes/auth/token');
const usuario = require('./routes/auth/user');

const pais = require('./routes/territorios/pais');
const estado = require('./routes/territorios/estado');
const cidade = require('./routes/territorios/cidade');
const bairro = require('./routes/territorios/bairro');
const endereco = require('./routes/ecommerce/endereco');

const cliente = require('./routes/ecommerce/cliente');
const fornecedor = require('./routes/ecommerce/fornecedor');

const venda = require('./routes/ecommerce/venda');
const compra = require('./routes/ecommerce/compra');

const produto = require('./routes/ecommerce/produto');
const entrega = require('./routes/ecommerce/entrega');
const pagamento = require('./routes/ecommerce/pagamento');

const app = express();
const port = 5050;

app.use( cors() );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({extended: true}) );

app.post('/usuarios/registrar', usuario.Registrar);
app.post('/usuarios/entrar', usuario.Entrar);

/** Autenticação / Token / Autorização
 * É necessário enviar o token no header como "access-token"
 */
app.use(auth.tokenMiddleware);

app.get('/pais', valida.pais, pais.getPaises);
app.get('/estado', valida.estado, estado.getEstados);
app.get('/cidade', valida.cidade, cidade.getCidades);
app.get('/bairro', valida.bairro, bairro.getBairros);

// CLIENTE
app.get('/cliente', valida.cliente.get, cliente.getClientes);
app.post('/cliente', valida.cliente.post, cliente.insertCliente);
app.put('/cliente/:id', valida.cliente.put, cliente.editCliente);
app.delete('/cliente/:id', valida.cliente.delete, cliente.removeCliente);

// FORNECEDOR
app.get('/fornecedor', valida.fornecedor.get, fornecedor.getFornecedores);
app.post('/fornecedor', valida.fornecedor.post, fornecedor.insertFornecedor);
app.put('/fornecedor/:id', valida.fornecedor.put, fornecedor.editFornecedor);
app.delete('/fornecedor/:id', valida.fornecedor.delete, fornecedor.removeFornecedor);

// ENDEREÇOS
app.get('/endereco', valida.endereco.get, endereco.getEnderecoPessoa);
app.post('/endereco', valida.endereco.post, endereco.insertEndereco);
app.put('/endereco/:id', valida.endereco.put, endereco.editEndereco);
app.delete('/endereco/:id', valida.endereco.delete, endereco.removeEndereco);

// COMPRAS
app.get('/compra', valida.compra.get, compra.getCompras);
app.post('/compra', valida.compra.post, compra.insertCompra);
app.put('/compra/:id', valida.compra.put, compra.editCompra);
app.delete('/compra/:id', valida.compra.delete, compra.removeCompra);
app.delete('/compra/produto/:id', valida.produto.delete, produto.removeProdutoCompra);

// VENDAS
app.get('/venda', valida.venda.get, venda.getVendas);
app.post('/venda', valida.venda.post, venda.insertVenda);
app.put('/venda/:id', valida.venda.put, venda.editVenda);
app.delete('/venda/:id', valida.venda.delete, venda.removeVenda);
app.delete('/venda/produto/:id', valida.produto.delete, produto.removeProdutoVenda);

// PAGAMENTOS
app.delete('/pagamento/:id', valida.pagamento.delete, pagamento.removePagamento);

// ENTREGAS
app.delete('/entrega/:id', valida.entrega.delete, entrega.removeEntrega);

// PRODUTOS
app.get('/produto', valida.produto.get, produto.getProdutos);


app.listen(process.env.PORT || port, () => {
    console.log(`App running on port ${ process.env.PORT || port}.`)
});
