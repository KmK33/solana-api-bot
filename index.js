import express from "express";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import fetch from "node-fetch";

const app = express();
const port = 3000;

const connection = new Connection(clusterApiUrl("mainnet-beta"));
const walletAddress = "4UYjrT5hmMTh9pLFg1Mxh49besnAeCc23qFoZc6WnQkK";

const TELEGRAM_BOT_TOKEN = "TELEGRAM_BOT_TOKEN";
const TELEGRAM_CHAT_ID = "TELEGRAM_CHAT_ID";

app.get("/transactions", async (req, res) => {
  try {
    const publicKey = new PublicKey(walletAddress);
    const signatures = await connection.getSignaturesForAddress(publicKey);
    const transactions = await Promise.all(
      signatures.map(async (signatureInfo) => {
        return await connection.getConfirmedTransaction(
          signatureInfo.signature
        );
      })
    );

    const transactionsJson = JSON.stringify(transactions);
    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    await fetch(telegramApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: transactionsJson,
      }),
    });

    res.json({ message: "Transaction data sent to Telegram" });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
