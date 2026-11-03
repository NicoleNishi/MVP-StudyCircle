import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  // Garante que só aceita requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('estudos_db'); // Nome do seu banco de dados no Atlas
    const collection = db.collection('alunos'); // Nome da tabela/coleção

    // O JSON enviado pelo formulário do React vem em req.body
    const dadosAluno = req.body;

    // Salva o JSON no MongoDB
    const resultado = await collection.insertOne({
      ...dadosAluno,
      createdAt: new Date()
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Dados salvos com sucesso no MongoDB!',
      id: resultado.insertedId 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao conectar ou salvar no banco de dados' });
  }
}