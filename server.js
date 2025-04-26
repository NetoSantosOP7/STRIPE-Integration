const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const app = express();
const cors = require("cors");
const path = require("path");

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname)));

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: "Assinatura Mensal - Site de Notícias",
            },
            unit_amount: 50,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.BASE_URL}/sucesso.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/cancelado.html`,
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/checkout-session", async (req, res) => {
  const sessionId = req.query.session_id;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.json(session);
  } catch (err) {
    res.status(400).json({ error: "Sessão não encontrada" });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
