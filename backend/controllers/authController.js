const bcrypt = require('bcrypt');
const db = require('../config/db');
const { signToken } = require('../utils/jwt');
const { validEmail } = require('../utils/validation');

async function register(req, res, next) {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      phone,
      address
    } = req.body;

    console.log("REGISTER REQUEST:", {
      name,
      email,
      passwordExists: !!password,
      confirmPasswordExists: !!confirmPassword,
      passwordsMatch: password === confirmPassword,
      phone,
      address
    });

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address"
      });
    }

    const exists = await db.query(
      "SELECT id FROM users WHERE email=$1",
      [email.trim().toLowerCase()]
    );

    if (exists.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const r = await db.query(
      `INSERT INTO users
       (name,email,password_hash,role,phone,address)
       VALUES($1,$2,$3,'CITIZEN',$4,$5)
       RETURNING id,name,email,role,phone,address`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        hash,
        phone ? phone.trim() : null,
        address ? address.trim() : null
      ]
    );

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: r.rows[0]
    });

  } catch (e) {
    next(e);
  }
}

async function login(req,res,next) {
  try {
    const {email,password,role} = req.body;
    if (!email || !password || !role) return res.status(400).json({success:false,message:'Email, password and role are required'});
    const r = await db.query('SELECT * FROM users WHERE email=$1 AND role=$2 AND is_active=true',[email.toLowerCase(),role]);
    if (!r.rowCount) return res.status(401).json({success:false,message:'Invalid email, password or role'});
    const user = r.rows[0];
    const ok = await bcrypt.compare(password,user.password_hash);
    if (!ok) return res.status(401).json({success:false,message:'Invalid email, password or role'});
    const token = signToken(user);
    await db.query('INSERT INTO audit_logs(user_id,action,details,ip_address) VALUES($1,$2,$3,$4)',
      [user.id,'LOGIN','Successful login',req.ip]);
    res.json({success:true,message:'Login successful',data:{
      token,user:{id:user.id,name:user.name,email:user.email,role:user.role,phone:user.phone,address:user.address}
    }});
  } catch(e){ next(e); }
}

async function me(req,res,next) {
  try {
    const r = await db.query(`SELECT id,name,email,role,phone,address,department_id,is_active FROM users WHERE id=$1`,[req.user.id]);
    res.json({success:true,data:r.rows[0]});
  } catch(e){next(e);}
}

async function profile(req,res,next) {
  try {
    const {name,phone,address}=req.body;
    const r=await db.query(`UPDATE users SET name=COALESCE($1,name),phone=COALESCE($2,phone),address=COALESCE($3,address),updated_at=NOW() WHERE id=$4
      RETURNING id,name,email,role,phone,address`,[name,phone,address,req.user.id]);
    res.json({success:true,message:'Profile updated',data:r.rows[0]});
  } catch(e){next(e);}
}
module.exports={register,login,me,profile};
