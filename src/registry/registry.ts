import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import crypto from "crypto";
import { REGISTRY_PORT } from "../config";
import axios from 'axios'; 

// Types de nœuds et enregistrements
export type Node = { nodeId: number; pubKey: string; privKey: string };
export type RegisterNodeBody = { nodeId: number; pubKey: string; privKey: string };
export type GetNodeRegistryBody = { nodes: { nodeId: number; pubKey: string }[] };

// Variables globales pour les nœuds et les clés privées
export const registeredNodes: Node[] = [];
const privateKeys: Map<number, string> = new Map();

// Lancer le registre
export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());

  // Route pour vérifier si le registre est en ligne
  _registry.get("/status", (req, res) => {
    res.send("live");
  });

  // Route pour enregistrer un nœud
  _registry.post("/registerNode", (req: Request, res: Response) => {
    const { nodeId, pubKey, privKey }: RegisterNodeBody = req.body;

    // Vérifier que le nœud n'est pas déjà enregistré
    if (registeredNodes.some((node) => node.nodeId === nodeId)) {
      return res.status(400).json({ message: "Node already registered" });
    }

    // Vérifier que la clé publique est unique
    if (registeredNodes.some((node) => node.pubKey === pubKey)) {
      return res.status(400).json({ message: "Public key already registered" });
    }

    // Ajouter le nœud et la clé privée
    registeredNodes.push({ nodeId, pubKey, privKey });
    privateKeys.set(nodeId, privKey); // Stocker la clé privée

    return res.status(201).json({ message: "Node registered successfully" });
  });

  // Route pour récupérer la clé privée d'un nœud
  _registry.get("/getPrivateKey", (req: Request, res: Response) => {
    const nodeId = Number(req.query.nodeId);
    const privateKey = privateKeys.get(nodeId);

    if (privateKey) {
      const base64PrivateKey = Buffer.from(privateKey, 'base64').toString('base64');
      return res.json({ result: base64PrivateKey });
    } else {
      return res.status(404).json({ message: "Node not found" });
    }
  });

  // Route pour récupérer tous les nœuds enregistrés
  _registry.get("/getNodeRegistry", (req: Request, res: Response) => {
    const response: GetNodeRegistryBody = {
      nodes: registeredNodes.map(({ nodeId, pubKey }) => ({ nodeId, pubKey }))
    };
    res.json(response);
  });

  // Démarrer le serveur
  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`Registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}

// Fonction pour générer une paire de clés pour un nœud
export function generateKeys(): { pubKey: string; privKey: string } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });

  return {
    pubKey: publicKey.export({ type: "spki", format: "pem" }).toString("base64"),
    privKey: privateKey.export({ type: "pkcs1", format: "pem" }).toString("base64"),
  };
}

export async function getRandomNodes(count: number): Promise<Node[]> {
  // S'assurer que le nombre demandé de nœuds est inférieur ou égal au nombre total de nœuds
  if (count > registeredNodes.length) {
    throw new Error('Nombre de nœuds demandés supérieur au nombre de nœuds disponibles');
  }

  // Mélanger les nœuds pour une sélection aléatoire
  const shuffledNodes = registeredNodes.sort(() => Math.random() - 0.5);

  // Retourner les premiers 'count' nœuds mélangés
  return shuffledNodes.slice(0, count);
}

// Fonction pour envoyer un message chiffré à un nœud via HTTP POST
export async function sendToNode(node: Node, encryptedMessage: string): Promise<void> {
  const url = `http://localhost:${node.nodeId}/message`; // Exemple d'URL (à adapter)

  try {
    await axios.post(url, {
      encryptedMessage: encryptedMessage
    });
    console.log(`Message envoyé au nœud ${node.nodeId}`);
  } catch (error) {
    console.error(`Erreur lors de l'envoi du message au nœud ${node.nodeId}:`, error);
    throw new Error(`Erreur lors de l'envoi au nœud ${node.nodeId}`);
  }
}
