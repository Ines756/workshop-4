import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";
import { generateRsaKeyPair, exportPubKey, exportPrvKey } from "../crypto";

export type Node = { nodeId: number; pubKey: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};

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
    const { nodeId, pubKey }: RegisterNodeBody = req.body;
    if (!nodeId || !pubKey) {
      return res.status(400).json({ error: "nodeId and pubKey are required" });
    }
    // Ajouter le nœud au registre
    nodesRegistry.push({ nodeId, pubKey });
    console.log(`Node ${nodeId} registered with public key: ${pubKey}`);
    return res.status(200).json({ message: "Node registered successfully" });
  });

  // Route pour obtenir le registre des nœuds
  _registry.get("/getNodeRegistry", (req: Request, res: Response) => {
    res.json({ nodes: nodesRegistry });
  });

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`Registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}
