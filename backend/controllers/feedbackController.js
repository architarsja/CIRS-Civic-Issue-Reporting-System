const db=require('../config/db');
async function create(req,res,next){try{
 const {rating,comment}=req.body;const r=await db.query(`SELECT id FROM complaints WHERE id=$1 AND citizen_id=$2 AND status='Resolved'`,[req.params.complaintId,req.user.id]);
 if(!r.rowCount)return res.status(400).json({success:false,message:'Feedback is allowed only for your resolved complaint'});
 const f=await db.query(`INSERT INTO feedback(complaint_id,citizen_id,rating,comment) VALUES($1,$2,$3,$4)
   RETURNING *`,[req.params.complaintId,rating,comment||null]);
 res.status(201).json({success:true,message:'Feedback submitted',data:f.rows[0]});
}catch(e){next(e);}}
async function list(req,res,next){try{const r=await db.query(`SELECT f.*,u.name citizen_name FROM feedback f JOIN users u ON u.id=f.citizen_id WHERE f.complaint_id=$1 ORDER BY f.created_at DESC`,[req.params.complaintId]);res.json({success:true,data:r.rows});}catch(e){next(e);}}
module.exports={create,list};
