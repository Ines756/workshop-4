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

export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());

  // TODO implement the status route
  // _registry.get("/status", (req, res) => {});
  _registry.get("/status", (req, res) => {
    res.send("live");
  });

  // Stockage temporaire des nœuds
  const registeredNodes: Node[] = [];

  // Route pour enregistrer un nœud
  _registry.post("/registerNode", (req: Request, res: Response) => {
    const { nodeId, pubKey } = req.body as RegisterNodeBody;
    if ((nodeId !== null && typeof nodeId !== 'number')|| !pubKey) {
      return res.status(400).json({ error: "Missing nodeId or pubKey" });
    }
    const existingNode = registeredNodes.find((node) => node.nodeId === nodeId);
    if (existingNode) {
      return res.status(409).json({ error: "Node already registered" });
    }
    registeredNodes.push({ nodeId, pubKey });

    console.log("Registered Nodes:", registeredNodes);

    return res.status(201).json({
      message: "Node registered successfully",
      nodeId : nodeId,
      pubKey: pubKey,
    });
  });

  // Route pour récupérer tous les nœuds enregistrés
  _registry.get("/getNodeRegistry", (req: Request, res: Response) => {
    return res.json({ nodes: registeredNodes });
  });

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}


