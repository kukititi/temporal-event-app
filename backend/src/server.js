const express = require("express");

const cors = require("cors");

require("dotenv").config();

const app = express();

const usersRoutes = require("./routes/users.routes");

const eventsRoutes = require("./routes/events.routes");

app.use(cors());

app.use(express.json());

app.use("/users", usersRoutes);

app.use("/events", eventsRoutes);

app.get("/", (req, res) => {
  res.send("TEA Backend funcionando");
});

const PORT = process.env.PORT || 3000;

const pool = require("./config/db");

pool
  .connect()
  .then(() => {
    console.log("PostgreSQL conectado 🚀");
  })
  .catch((err) => {
    console.log("Error PostgreSQL:", err.message);
  });

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
