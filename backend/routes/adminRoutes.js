const express = require('express');

const router = express.Router();


const adminController =
  require('../controllers/adminController');


const auth =
  require('../middleware/auth');


const role =
  require('../middleware/role');


// ==================================================
// ADMIN DASHBOARD
// ==================================================

router.get(
  '/dashboard',
  auth,
  role('ADMIN'),
  adminController.dashboard
);


// ==================================================
// USERS
// ==================================================

router.get(
  '/users',
  auth,
  role('ADMIN'),
  adminController.users
);


// ==================================================
// OFFICERS
// ==================================================

router.get(
  '/officers',
  auth,
  role('ADMIN'),
  adminController.officers
);


// ==================================================
// ADD OFFICER
// ==================================================

router.post(
  '/officers',
  auth,
  role('ADMIN'),
  adminController.addOfficer
);


// ==================================================
// UPDATE OFFICER
// ==================================================

router.put(
  '/officers/:id',
  auth,
  role('ADMIN'),
  adminController.updateOfficer
);


// ==================================================
// COMPLAINTS
// ==================================================

router.get(
  '/complaints',
  auth,
  role('ADMIN'),
  adminController.complaints
);


// ==================================================
// ASSIGN COMPLAINT
// ==================================================

router.post(
  '/assign',
  auth,
  role('ADMIN'),
  adminController.assign
);


module.exports = router;