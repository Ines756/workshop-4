
import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";

export type Node = { nodeId: number; pubKey: string };
export type RegisterNodeBody = { nodeId: number; pubKey: string;};
export type GetNodeRegistryBody = {nodes: Node[];};

let nodesRegistry: Node[] = []; // Tableau pour stocker les nœuds enregistrés

export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());
  
  // Route /status
  _registry.get("/status", (req, res) => {
    res.send("live");
  });

  // Route pour enregistrer un nœud
  _registry.post("/registerNode", (req: Request, res: Response) => {
    const { nodeId, pubKey } = req.body as RegisterNodeBody;

    if (!Number.isInteger(nodeId) || typeof pubKey !== "string" || !pubKey.trim()) {
      return res.status(400).json({ error: "Invalid nodeId or pubKey" });
    }

    // Vérifier si le nodeId est déjà enregistré
    if (nodesRegistry.some((node) => node.nodeId === nodeId)) {
      return res.status(409).json({ error: "Node already registered" });
    }

    // Ajouter le nœud au registre
    nodesRegistry.push({ nodeId, pubKey });
    return res.status(201).json({ message: "Node registered successfully" });
  });

  // Route pour obtenir le registre des nœuds
  _registry.get("/getNodeRegistry", (req: Request, res: Response) => {
    const response: GetNodeRegistryBody = { nodes: nodesRegistry };
    res.json(response);
  });

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`Registry is listening on port ${REGISTRY_PORT}`);
  });
  
  return server;
}
