import bodyParser from "body-parser";
import express from "express";
import { BASE_USER_PORT } from "../config";

import { createRandomSymmetricKey, symEncrypt, rsaEncrypt, exportSymKey, rsaDecrypt, symDecrypt } from '../../src/crypto';
import { getRandomNodes, sendToNode } from '../../src/registry/registry';

export type SendMessageBody = {
  message: string;
  destinationUserId: number;
};

export async function user(userId: number) {
  const _user = express();
  _user.use(express.json());
  _user.use(bodyParser.json());

  // TODO implement the status route
  // _user.get("/status", (req, res) => {});
  _user.get("/status", (req, res) => {
    res.send("live");
  });

  // Variables
  let lastReceivedMessage: string | null = null;
  let lastSentMessage: string | null = null;

  _user.get("/getLastReceivedMessage", (req, res) => {
    res.json({ result: lastReceivedMessage });
  });

  _user.get("/getLastSentMessage", (req, res) => {
    res.json({ result: lastSentMessage });
  });

  _user.post("/message", (req, res) => {
    const { message } = req.body;
    lastReceivedMessage = message;
    res.send("success");
  });


  // Route pour envoyer un message via le réseau
  //_user.post("/sendMessage", async (req, res) => {

  _user.post('/sendMessage', async (req, res) => {
    const { message, destinationUserId } = req.body;
  
    try {
      // 1. Sélectionner 3 nœuds distincts pour le circuit
      const nodes = await getRandomNodes(3); // Imaginons que cette fonction te donne 3 nœuds aléatoires
  
      let encryptedMessage = message;
  
      // 2. Créer les 3 couches de chiffrement
      let encryptedLayers = [];
  
      for (let i = 0; i < nodes.length; i++) {
        // Créer une clé symétrique aléatoire pour ce nœud
        const symKey = await createRandomSymmetricKey();
  
        // Chiffrer le message avec la clé symétrique (niveau 1)
        encryptedMessage = await symEncrypt(symKey, encryptedMessage);
  
        // Chiffrer la clé symétrique avec la clé publique RSA du nœud (niveau 2)
        const encryptedSymKey = await rsaEncrypt(await exportSymKey(symKey), nodes[i].pubKey);
  
        // Ajouter la clé RSA chiffrée et le message chiffré à la couche
        encryptedLayers.push({ message: encryptedMessage, symKey: encryptedSymKey });
  
        // Mettre à jour le message pour l'envoyer au nœud suivant
        encryptedMessage = encryptedSymKey + encryptedMessage;
      }
  
      // 3. Envoyer le message chiffré au premier nœud (nœud d'entrée)
      const entryNode = nodes[0];
      await sendToNode(entryNode, encryptedMessage);
  
      res.status(200).send({ status: 'Message envoyé avec succès' });
    } catch (error) {
      console.error("Erreur dans l'envoi du message:", error);
      res.status(500).send({ error: "Erreur dans l'envoi du message." });
    }
  });

  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(
      `User ${userId} is listening on port ${BASE_USER_PORT + userId}`
    );
  });

  return server;
}













