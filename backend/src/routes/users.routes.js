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
    const { username, email, password, city, address } = req.body;

    const result = await pool.query(
      `
      INSERT INTO users (
        username,
        email,
        password,
        city,
        address
      )

      VALUES ($1, $2, $3, $4, $5)

      RETURNING *;
      `,
      [username, email, password, city, address],
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

router.get("/:id/attended-events", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT e.*
      FROM events e
      JOIN event_attendees ea
      ON e.id = ea.event_id
      WHERE ea.user_id = $1
      ORDER BY ea.attended_at DESC
      `,
      [id],
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error obteniendo eventos asistidos",
    });
  }
});

router.put("/:id/organizer-mode", async (req, res) => {
  try {
    const { id } = req.params;
    const { organizer_mode } = req.body;

    const result = await pool.query(
      `
      UPDATE users
      SET organizer_mode = $1
      WHERE id = $2
      RETURNING *
      `,
      [organizer_mode, id],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error actualizando modo organizador",
    });
  }
});

router.put("/:id/address", async (req, res) => {
  try {
    const { id } = req.params;
    const { address } = req.body;

    const result = await pool.query(
      `
      UPDATE users
      SET address = $1
      WHERE id = $2
      RETURNING *
      `,
      [address, id],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error actualizando dirección",
    });
  }
});

router.put("/:id/interests", async (req, res) => {
  try {
    const { id } = req.params;
    const { interests } = req.body; // arreglo de strings, ej: ["Gaming","Anime"]

    const result = await pool.query(
      `
      UPDATE users
      SET interests = $1
      WHERE id = $2
      RETURNING *
      `,
      [interests, id],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error actualizando intereses",
    });
  }
});

router.put("/:id/profile", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, avatar_url } = req.body;

    const result = await pool.query(
      `
      UPDATE users
      SET name = $1, avatar_url = $2
      WHERE id = $3
      RETURNING *
      `,
      [name, avatar_url, id],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error actualizando perfil" });
  }
});

router.get("/:id/favorites", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT e.*
      FROM events e
      JOIN favorites f
      ON e.id = f.event_id
      WHERE f.user_id = $1
      ORDER BY e.created_at DESC
      `,
      [id],
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error obteniendo favoritos",
    });
  }
});

module.exports = router;