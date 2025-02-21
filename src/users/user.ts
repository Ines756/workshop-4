import bodyParser from "body-parser";
import express from "express";
import { BASE_USER_PORT } from "../config";

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
    const { message, destinationUserId }: SendMessageBody = req.body;

    if (!message || typeof message !== "string" || !destinationUserId || typeof destinationUserId!=="number") {
      return res.status(400).json({ error: "Invalid message or destinationUserId" });
    }

    // Mettre à jour le dernier message envoyé
    lastSentMessage = message;
    return res.status(200).json({ message: "success" });
  });

  // Route pour recevoir un message
  _user.post("/receiveMessage", (req, res) => {
    const { message }: { message: string } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid message" });
    }
    lastReceivedMessage = message;
    return res.status(200).json({ message: "success" });
  });


  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(
      `User ${userId} is listening on port ${BASE_USER_PORT + userId}`
    );
  });

  return server;
}
