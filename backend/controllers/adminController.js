const db = require('../config/db');

const {
  notify
} = require('../services/notificationService');

const bcrypt = require('bcrypt');


// ==================================================
// ADMIN DASHBOARD
// ==================================================

async function dashboard(req, res, next) {

  try {

    const users =
      await db.query(`
        SELECT COUNT(*)::int AS total
        FROM users
      `);


    const complaints =
      await db.query(`
        SELECT
          status,
          COUNT(*)::int AS count
        FROM complaints
        GROUP BY status
      `);


    const data = {

      totalUsers:
        users.rows[0].total

    };


    for (
      const item of complaints.rows
    ) {

      data[
        item.status
          .replaceAll(' ', '_')
          .toLowerCase()
      ] =
        item.count;

    }


    res.json({

      success: true,

      data

    });


  } catch (e) {

    next(e);

  }

}


// ==================================================
// GET ALL USERS
// ==================================================

async function users(req, res, next) {

  try {

    const result =
      await db.query(`

        SELECT
          id,
          name,
          email,
          role,
          phone,
          address,
          is_active,
          department_id,
          created_at

        FROM users

        ORDER BY created_at DESC

      `);


    res.json({

      success: true,

      data: result.rows

    });


  } catch (e) {

    next(e);

  }

}


// ==================================================
// GET ALL OFFICERS
// ==================================================

async function officers(req, res, next) {

  try {

    const result =
      await db.query(`

        SELECT

          u.id,

          u.name,

          u.email,

          u.phone,

          u.department_id,

          u.is_active,

          d.name AS department

        FROM users u

        LEFT JOIN departments d
          ON d.id = u.department_id

        WHERE u.role = 'OFFICER'

        ORDER BY u.name

      `);


    res.json({

      success: true,

      data: result.rows

    });


  } catch (e) {

    next(e);

  }

}


// ==================================================
// ADD OFFICER
// ==================================================

async function addOfficer(req, res, next) {

  try {

    const {

      name,

      email,

      password,

      phone,

      department_id

    } = req.body;


    console.log(
      'ADD OFFICER REQUEST:',
      {
        name,
        email,
        passwordReceived: !!password,
        phone,
        department_id
      }
    );


    // ----------------------------------------------
    // VALIDATION
    // ----------------------------------------------

    if (
      !name ||
      !email ||
      !password
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Name, email and password are required'

      });

    }


    // ----------------------------------------------
    // CHECK EMAIL
    // ----------------------------------------------

    const existing =
      await db.query(
        `
          SELECT id
          FROM users
          WHERE email = $1
        `,
        [
          email
            .trim()
            .toLowerCase()
        ]
      );


    if (existing.rowCount > 0) {

      return res.status(409).json({

        success: false,

        message:
          'Email already registered'

      });

    }


    // ----------------------------------------------
    // CHECK DEPARTMENT
    // ----------------------------------------------

    if (department_id) {

      const department =
        await db.query(
          `
            SELECT id
            FROM departments
            WHERE id = $1
          `,
          [
            Number(department_id)
          ]
        );


      if (!department.rowCount) {

        return res.status(400).json({

          success: false,

          message:
            'Selected department does not exist'

        });

      }

    }


    // ----------------------------------------------
    // HASH PASSWORD
    // ----------------------------------------------

    const passwordHash =
      await bcrypt.hash(
        password,
        10
      );


    // ----------------------------------------------
    // INSERT OFFICER
    // ----------------------------------------------

    const result =
      await db.query(
        `
          INSERT INTO users
          (
            name,
            email,
            password_hash,
            role,
            phone,
            department_id,
            is_active
          )

          VALUES
          (
            $1,
            $2,
            $3,
            'OFFICER',
            $4,
            $5,
            true
          )

          RETURNING
            id,
            name,
            email,
            role,
            phone,
            department_id,
            is_active
        `,
        [

          name.trim(),

          email
            .trim()
            .toLowerCase(),

          passwordHash,

          phone
            ? phone.trim()
            : null,

          department_id
            ? Number(department_id)
            : null

        ]
      );


    res.status(201).json({

      success: true,

      message:
        'Officer created successfully',

      data:
        result.rows[0]

    });


  } catch (e) {

    console.error(
      'ADD OFFICER ERROR:',
      e
    );

    next(e);

  }

}


// ==================================================
// UPDATE OFFICER
// ==================================================

async function updateOfficer(
  req,
  res,
  next
) {

  try {

    const {

      name,

      phone,

      department_id,

      is_active

    } = req.body;


    // Check department

    if (department_id) {

      const department =
        await db.query(
          `
            SELECT id
            FROM departments
            WHERE id = $1
          `,
          [
            Number(department_id)
          ]
        );


      if (!department.rowCount) {

        return res.status(400).json({

          success: false,

          message:
            'Selected department does not exist'

        });

      }

    }


    const result =
      await db.query(
        `
          UPDATE users

          SET

            name =
              COALESCE($1, name),

            phone =
              COALESCE($2, phone),

            department_id =
              COALESCE($3, department_id),

            is_active =
              COALESCE($4, is_active),

            updated_at =
              NOW()

          WHERE
            id = $5

          AND
            role = 'OFFICER'

          RETURNING

            id,
            name,
            email,
            role,
            phone,
            department_id,
            is_active
        `,
        [

          name
            ? name.trim()
            : null,

          phone
            ? phone.trim()
            : null,

          department_id
            ? Number(department_id)
            : null,

          is_active,

          req.params.id

        ]
      );


    if (!result.rowCount) {

      return res.status(404).json({

        success: false,

        message:
          'Officer not found'

      });

    }


    res.json({

      success: true,

      message:
        'Officer updated successfully',

      data:
        result.rows[0]

    });


  } catch (e) {

    next(e);

  }

}


// ==================================================
// GET ALL COMPLAINTS
// ==================================================

async function complaints(
  req,
  res,
  next
) {

  try {

    const {

      status,

      category,

      search

    } = req.query;


    const params = [];

    const conditions = [];


    // ----------------------------------------------
    // STATUS FILTER
    // ----------------------------------------------

    if (status) {

      params.push(status);

      conditions.push(
        `c.status = $${params.length}`
      );

    }


    // ----------------------------------------------
    // CATEGORY FILTER
    // ----------------------------------------------

    if (category) {

      params.push(category);

      conditions.push(
        `c.category = $${params.length}`
      );

    }


    // ----------------------------------------------
    // SEARCH
    // ----------------------------------------------

    if (search) {

      params.push(
        `%${search}%`
      );


      conditions.push(
        `(
          LOWER(c.title)
          LIKE LOWER($${params.length})

          OR

          CAST(c.id AS TEXT)
          LIKE $${params.length}
        )`
      );

    }


    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(' AND ')}`
        : '';


    const result =
      await db.query(
        `
          SELECT

            c.*,

            u.name AS citizen_name,

            o.name AS officer_name,

            o.email AS officer_email,

            d.name AS officer_department

          FROM complaints c

          JOIN users u
            ON u.id = c.citizen_id

          LEFT JOIN users o
            ON o.id =
              c.assigned_officer_id

          LEFT JOIN departments d
            ON d.id =
              o.department_id

          ${whereClause}

          ORDER BY
            c.created_at DESC
        `,
        params
      );


    res.json({

      success: true,

      data:
        result.rows

    });


  } catch (e) {

    next(e);

  }

}


// ==================================================
// ASSIGN COMPLAINT TO OFFICER
// ==================================================

async function assign(
  req,
  res,
  next
) {

  try {

    const {

      complaint_id,

      officer_id

    } = req.body;


    // ----------------------------------------------
    // VALIDATION
    // ----------------------------------------------

    if (
      !complaint_id ||
      !officer_id
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Complaint and officer are required'

      });

    }


    // ----------------------------------------------
    // CHECK OFFICER
    // ----------------------------------------------

    const officer =
      await db.query(
        `
          SELECT

            id,

            name,

            role,

            is_active,

            department_id

          FROM users

          WHERE
            id = $1

          AND
            role = 'OFFICER'
        `,
        [
          Number(officer_id)
        ]
      );


    if (!officer.rowCount) {

      return res.status(404).json({

        success: false,

        message:
          'Officer not found'

      });

    }


    if (
      !officer.rows[0].is_active
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Selected officer is inactive'

      });

    }


    // ----------------------------------------------
    // CHECK COMPLAINT
    // ----------------------------------------------

    const complaint =
      await db.query(
        `
          SELECT *

          FROM complaints

          WHERE id = $1
        `,
        [
          Number(complaint_id)
        ]
      );


    if (!complaint.rowCount) {

      return res.status(404).json({

        success: false,

        message:
          'Complaint not found'

      });

    }


    // ----------------------------------------------
    // ASSIGN COMPLAINT
    // ----------------------------------------------

    const result =
      await db.query(
        `
          UPDATE complaints

          SET

            assigned_officer_id =
              $1,

            status =
              'Assigned',

            updated_at =
              NOW()

          WHERE id = $2

          RETURNING *
        `,
        [

          Number(officer_id),

          Number(complaint_id)

        ]
      );


    // ----------------------------------------------
    // NOTIFY OFFICER
    // ----------------------------------------------

    await notify(

      Number(officer_id),

      'New complaint assigned',

      `Complaint #${complaint_id} has been assigned to you.`

    );


    // ----------------------------------------------
    // NOTIFY CITIZEN
    // ----------------------------------------------

    await notify(

      result.rows[0].citizen_id,

      'Complaint assigned',

      `Complaint #${complaint_id} has been assigned to an officer.`

    );


    // ----------------------------------------------
    // RESPONSE
    // ----------------------------------------------

    res.json({

      success: true,

      message:
        'Complaint assigned successfully',

      data:
        result.rows[0]

    });


  } catch (e) {

    console.error(
      'ASSIGN COMPLAINT ERROR:',
      e
    );

    next(e);

  }

}


// ==================================================
// EXPORT FUNCTIONS
// ==================================================

module.exports = {

  dashboard,

  users,

  officers,

  addOfficer,

  updateOfficer,

  complaints,

  assign

};