import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to create Cashfree Order
  app.post("/api/create-cashfree-order", async (req, res) => {
    const { amount, customer_details, order_id } = req.body;

    const cashfreeUrl = process.env.VITE_CASHFREE_ENV === 'production' 
      ? "https://api.cashfree.com/pg/orders" 
      : "https://sandbox.cashfree.com/pg/orders";

    try {
      const response = await fetch(cashfreeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-version": "2023-08-01",
          "x-client-id": process.env.VITE_CASHFREE_APP_ID || "",
          "x-client-secret": process.env.CASHFREE_SECRET_KEY || "",
        },
        body: JSON.stringify({
          order_amount: amount,
          order_currency: "INR",
          order_id: order_id,
          customer_details: {
            customer_id: customer_details.customer_id,
            customer_phone: customer_details.customer_phone,
            customer_email: customer_details.customer_email,
            customer_name: customer_details.customer_name,
          },
          order_meta: {
            return_url: `${req.headers.origin}/checkout/success?order_id={order_id}`,
            notify_url: `${req.headers.origin}/api/cashfree-webhook`,
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Cashfree Error:", data);
        return res.status(response.status).json(data);
      }

      res.json(data);
    } catch (error) {
      console.error("Server Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
