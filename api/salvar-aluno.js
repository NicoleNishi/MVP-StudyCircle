import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const NOME_BANCO = process.env.MONGODB_DB || "estudos_db"; // mesmo banco que o matching.py lê
const COLECAO_ALUNOS = "alunos";

let cachedClient = null;

async function connectToDatabase() {
  if (!uri) throw new Error("Defina a variável de ambiente MONGODB_URI.");
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  cachedClient = client;
  return client;
}

export const slug = (s) =>
  s
    ? String(s)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60)
    : "";

/* Atualiza o perfil se o aluno já existe e apaga cópias antigas de envios repetidos. */
export async function salvarAluno(colecao, dadosAluno) {
  const { _id, createdAt, updatedAt, ...dados } = dadosAluno ?? {};
  const id = slug(dados.nome);
  if (!id) return { status: 400, corpo: { success: false, error: "Informe o nome do aluno." } };

  const agora = new Date();
  const documento = await colecao.findOneAndUpdate(
    { id },
    { $set: { ...dados, id, updatedAt: agora }, $setOnInsert: { createdAt: agora } },
    { upsert: true, returnDocument: "after", sort: { createdAt: -1 } },
  );
  await colecao.deleteMany({ id, _id: { $ne: documento._id } });

  return { status: 200, corpo: { success: true, message: "Perfil salvo.", id } };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Método não permitido" });
  }

  try {
    const client = await connectToDatabase();
    const colecao = client.db(NOME_BANCO).collection(COLECAO_ALUNOS);
    const { status, corpo } = await salvarAluno(colecao, req.body);
    return res.status(status).json(corpo);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Erro ao conectar ou salvar no banco de dados" });
  }
}