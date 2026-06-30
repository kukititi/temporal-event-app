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

router.get("/:id/attendees-count", async (req, res) => {
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

router.delete("/:id/attend", async (req, res) => {
  try {
    const { user_id } = req.body;
    const { id } = req.params;

    await pool.query(
      `
      DELETE FROM event_attendees
      WHERE user_id = $1
      AND event_id = $2
      `,
      [user_id, id],
    );

    res.json({
      message: "Asistencia eliminada",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error eliminando asistencia",
    });
  }
});

router.get("/:id/is-attending/:userId", async (req, res) => {
  try {
    const { id, userId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM event_attendees
      WHERE event_id = $1
      AND user_id = $2
      `,
      [id, userId],
    );

    res.json({
      attending: result.rows.length > 0,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error verificando asistencia",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      address,
      event_date,
      end_date,
      image_url,
      created_by,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO events (
        title,
        description,
        category,
        location,
        address,
        event_date,
        end_date,
        image_url,
        created_by
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
      [
        title,
        description,
        category,
        location,
        address,
        event_date,
        end_date,
        image_url,
        created_by,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error creando evento",
    });
  }
});

router.get("/creator/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM events
      WHERE created_by = $1
      ORDER BY created_at DESC
      `,
      [id],
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error obteniendo eventos del organizador",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `
      DELETE FROM event_attendees
      WHERE event_id = $1
      `,
      [id],
    );

    await pool.query(
      `
      DELETE FROM events
      WHERE id = $1
      `,
      [id],
    );

    res.json({
      message: "Evento eliminado correctamente",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error eliminando evento",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      category,
      location,
      address,
      event_date,
      end_date,
      image_url,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE events
      SET
        title = $1,
        description = $2,
        category = $3,
        location = $4,
        address = $5,
        event_date = $6,
        end_date = $7,
        image_url = $8
      WHERE id = $9
      RETURNING *
      `,
      [
        title,
        description,
        category,
        location,
        address,
        event_date,
        end_date,
        image_url,
        id,
      ],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error actualizando evento",
    });
  }
});

router.get("/:id/attendees", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        users.id,
        users.username,
        users.email
      FROM event_attendees
      JOIN users
      ON users.id = event_attendees.user_id
      WHERE event_attendees.event_id = $1
      `,
      [id],
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error obteniendo asistentes",
    });
  }
});

router.get("/stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const eventsResult = await pool.query(
      `
      SELECT COUNT(*) AS total_events
      FROM events
      WHERE created_by = $1
      `,
      [userId],
    );

    const attendeesResult = await pool.query(
      `
      SELECT COUNT(*) AS total_attendees
      FROM event_attendees ea
      JOIN events e
      ON e.id = ea.event_id
      WHERE e.created_by = $1
      `,
      [userId],
    );

    const popularEventResult = await pool.query(
      `
      SELECT
        e.title,
        COUNT(ea.user_id) AS attendees
      FROM events e
      LEFT JOIN event_attendees ea
      ON e.id = ea.event_id
      WHERE e.created_by = $1
      GROUP BY e.id, e.title
      ORDER BY attendees DESC
      LIMIT 1
      `,
      [userId],
    );

    res.json({
      totalEvents: eventsResult.rows[0].total_events,
      totalAttendees: attendeesResult.rows[0].total_attendees,
      mostPopularEvent: popularEventResult.rows[0] || null,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error obteniendo estadísticas",
    });
  }
});

router.post("/:id/favorite", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    await pool.query(
      `
      INSERT INTO favorites (
        user_id,
        event_id
      )
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [user_id, id],
    );

    res.json({
      message: "Favorito agregado",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error agregando favorito",
    });
  }
});

router.delete("/:id/favorite", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    await pool.query(
      `
      DELETE FROM favorites
      WHERE user_id = $1
      AND event_id = $2
      `,
      [user_id, id],
    );

    res.json({
      message: "Favorito eliminado",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error eliminando favorito",
    });
  }
});

router.get("/:id/is-favorite/:userId", async (req, res) => {
  try {
    const { id, userId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM favorites
      WHERE event_id = $1
      AND user_id = $2
      `,
      [id, userId],
    );

    res.json({
      favorite: result.rows.length > 0,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error verificando favorito",
    });
  }
});

module.exports = router;