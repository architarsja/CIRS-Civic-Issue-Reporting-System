const db = require('../config/db');
const { notify } = require('../services/notificationService');

async function dashboard(req, res, next) {
  try {
    const r = await db.query(
      `SELECT status, COUNT(*)::int count FROM complaints WHERE assigned_officer_id=$1 GROUP BY status`,
      [req.user.id]
    );
    const data = { assigned: 0, in_progress: 0, resolved: 0, rejected: 0 };
    for (const x of r.rows) {
      data[x.status.replaceAll(' ', '_').toLowerCase()] = x.count;
    }
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

async function complaints(req, res, next) {
  try {
    const r = await db.query(
      `SELECT c.*, u.name citizen_name, u.phone citizen_phone 
       FROM complaints c 
       JOIN users u ON u.id = c.citizen_id 
       WHERE c.assigned_officer_id = $1 
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: r.rows });
  } catch (e) {
    next(e);
  }
}

async function status(req, res, next) {
  try {
    const { status, resolution_note } = req.body;

    if (!['In Progress', 'Resolved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid officer status' });
    }

    // Determine timestamp in JS to prevent PostgreSQL parameter type errors
    const resolvedAt = (status === 'Resolved') ? new Date() : null;

    const r = await db.query(
      `UPDATE complaints 
       SET status = $1, 
           resolution_note = $2, 
           resolved_at = $3, 
           updated_at = NOW()
       WHERE id = $4 AND assigned_officer_id = $5 
       RETURNING *`,
      [status, resolution_note || null, resolvedAt, req.params.id, req.user.id]
    );

    if (!r.rowCount) {
      return res.status(404).json({ success: false, message: 'Assigned complaint not found' });
    }

    await notify(
      r.rows[0].citizen_id, 
      'Complaint status updated', 
      `Complaint #${req.params.id} is now ${status}.`
    );

    res.json({ success: true, message: 'Status updated', data: r.rows[0] });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  dashboard,
  complaints,
  status
};