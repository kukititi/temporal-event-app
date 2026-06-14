const express = require("express");

const router = express.Router();

const pool = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events");

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error obteniendo eventos",
    });
  }
});

router.post("/:id/attend", async (req, res) => {
  try {
    const { user_id } = req.body;
    const { id } = req.params;

    await pool.query(
      `
      INSERT INTO event_attendees (user_id, event_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, event_id) DO NOTHING
      `,
      [user_id, id],
    );

    res.json({
      message: "Asistencia registrada",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error registrando asistencia",
    });
  }
});

router.get("/:id/attendees", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT COUNT(*) AS attendees
      FROM event_attendees
      WHERE event_id = $1
      `,
      [id],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error obteniendo asistentes",
    });
  }
});

module.exports = router;
