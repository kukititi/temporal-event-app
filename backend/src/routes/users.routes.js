const express = require("express");

const router = express.Router();

const pool = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error obteniendo usuarios",
    });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, city } = req.body;

    const result = await pool.query(
      `
      INSERT INTO users (
        username,
        email,
        password,
        city
      )

      VALUES ($1, $2, $3, $4)

      RETURNING *;
      `,
      [username, email, password, city],
    );

    res.status(201).json({
      message: "Usuario creado correctamente",
      user: result.rows[0],
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error creando usuario",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `
      SELECT * FROM users
      WHERE email = $1
      `,
      [email],
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        message: "Contraseña incorrecta",
      });
    }

    res.status(200).json({
      message: "Login exitoso 🚀",
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error iniciando sesión",
    });
  }
});

module.exports = router;
