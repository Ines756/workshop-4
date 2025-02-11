import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";
import { generateRsaKeyPair, exportPubKey, exportPrvKey } from "../crypto";

export type Node = { nodeId: number; pubKey: string, privKey: string};

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Omit<Node, "privKey">[];
};

export type GetPrivateKeyPayload = {
  result: string; 
};

export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());

  // Stockage temporaire 
  const registeredNodes: Node[] = [];

  // TODO implement the status route
  // _registry.get("/status", (req, res) => {});
   _registry.get("/status", (req, res) => {
    res.send("live");
  });


  // Route pour enregistrer un nœud avec génération de clés RSA
  _registry.post("/registerNode", async (req: Request, res: Response) => {
    const { nodeId } = req.body as RegisterNodeBody;

    if (!nodeId) {
      return res.status(400).json({ error: "Missing nodeId" });
    }

    if (registeredNodes.some(node => node.nodeId === nodeId)) {
      return res.status(409).json({ error: "Node already registered" });
    }

    try {
      // Générer une paire de clés RSA
      const { publicKey, privateKey } = await generateRsaKeyPair();

      // Exporter les clés en base64
      const pubKeyBase64 = await exportPubKey(publicKey);
      const privKeyBase64 = await exportPrvKey(privateKey);

      // Stocker les clés
      registeredNodes.push({ nodeId, pubKey: pubKeyBase64, privKey: privKeyBase64! });

      console.log(`Node registered: ${nodeId}`);

      return res.status(201).json({
        message: "Node registered successfully",
        publicKey: pubKeyBase64,
      });
    } catch (error) {
      return res.status(500).json({ error: "Key generation failed" });
    }
  });

  // Route pour récupérer tous les nœuds enregistrés, sans les clés privées
  _registry.get("/getNodeRegistry", (req: Request, res: Response) => {
    const nodesWithoutPrivKey = registeredNodes.map(({ privKey, ...node }) => node);
    return res.json({ nodes: nodesWithoutPrivKey });
  });

  // Route pour récupérer la clé privée d'un nœud
  _registry.get("/getPrivateKey", (req: Request, res: Response) => {
    const { nodeId } = req.query;

    if (!nodeId) {
      return res.status(400).json({ error: "Missing nodeId in query" });
    }

    const node = registeredNodes.find(n => n.nodeId === Number(nodeId));
    if (!node) {
      return res.status(404).json({ error: "Node not found" });
    }

    return res.json({ result: node.privKey });
  });



  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}
