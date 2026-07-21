import Fastify from 'fastify'
import { Pool } from 'pg'
import fastifyStatic from '@fastify/static'
import path from 'path'
import { fileURLToPath } from 'url'
const servidor = Fastify()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const sql = new Pool({
 user: 'postgres',
 password: 'senai',
 host: 'localhost',
 port: 5432,
 database: 'produtos_db0.2'
})
servidor.register(fastifyStatic, {
 root: path.join(__dirname, 'public'),
 prefix: '/'
})






servidor.get('/api/produtos', async (request, reply) => {
  // Pega o parâmetro 'nome' da URL (ex: /api/produtos?nome=Mouse)
  const { nome } = request.query;

  if (nome) {
    // Se houver uma busca, usa o ILIKE para procurar nomes que contenham o texto digitado
    const busca = `%${nome}%`;
    const resultado = await sql.query('SELECT * FROM produtos WHERE nome ILIKE $1 ORDER BY id', [busca]);
    return resultado.rows;
  }

  // Se não houver busca, retorna todos os produtos normalmente
  const resultado = await sql.query('SELECT * FROM produtos ORDER BY id');
  return resultado.rows;
});







servidor.post('/api/produtos', async (request, reply) => {
 const { nome, preco, quantidade, categoria } = request.body
 if (!nome || preco === undefined || quantidade === undefined) {
 return reply.status(400).send({
 error: 'Nome, preço e quantidade são obrigatórios!'
 })
 }
 await sql.query(
 'INSERT INTO produtos (nome, preco, quantidade, categoria) VALUES ($1, $2, $3, $4)',
 [nome, preco, quantidade, categoria]
 )
 return reply.status(201).send({ mensagem: 'Produto cadastrado com sucesso!' })
})
servidor.put('/api/produtos/:id', async (request, reply) => {const { id } = request.params
 const { nome, preco, quantidade, categoria } = request.body
 if (!nome || preco === undefined || quantidade === undefined) {
 return reply.status(400).send({
 error: 'Nome, preço e quantidade são obrigatórios!'
 })
 }
 const busca = await sql.query('SELECT * FROM produtos WHERE id = $1', [id])
 if (busca.rows.length === 0) {
 return reply.status(404).send({ error: 'Produto não encontrado!' })
 }
 await sql.query(
 'UPDATE produtos SET nome = $1, preco = $2, quantidade = $3, categoria = $4 WHERE id = $5',
 [nome, preco, quantidade, categoria, id]
 )
 return { mensagem: 'Produto alterado com sucesso!' }
})
servidor.delete('/api/produtos/:id', async (request, reply) => {
 const { id } = request.params
 const busca = await sql.query('SELECT * FROM produtos WHERE id = $1', [id])
 if (busca.rows.length === 0) {
 return reply.status(404).send({ error: 'Produto não encontrado!' })
 }
 await sql.query('DELETE FROM produtos WHERE id = $1', [id])
 return reply.status(204).send()
})
servidor.listen({ port: 3000 })