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

// Função slug idêntica à que usavam antes para gerar o id amigável baseado no nome
const slug = (s) =>
  s
    ? s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60)
    : "perfil";

export default async function handler(req, res) {
  // Garante que só aceita requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('estudos_db'); 
    const collection = db.collection('alunos'); 

    const dadosAluno = req.body;

    // Gera o id amigável com base no nome do aluno (igual faziam antes)
    const idAmigavel = slug(dadosAluno.nome);

    // Salva o JSON no MongoDB incluindo o campo "id" limpo e legível
    const resultado = await collection.insertOne({
      ...dadosAluno,
      id: idAmigavel, // Adiciona o id formatado que o algoritmo espera
      createdAt: new Date()
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Dados salvos com sucesso no MongoDB!',
      id: idAmigavel 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao conectar ou salvar no banco de dados' });
  }
}