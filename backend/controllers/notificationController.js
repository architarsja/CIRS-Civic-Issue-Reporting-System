const db=require('../config/db');
async function list(req,res,next){try{const r=await db.query(`SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC`,[req.user.id]);res.json({success:true,data:r.rows});}catch(e){next(e);}}
async function read(req,res,next){try{const r=await db.query(`UPDATE notifications SET is_read=true WHERE id=$1 AND user_id=$2 RETURNING *`,[req.params.id,req.user.id]);if(!r.rowCount)return res.status(404).json({success:false,message:'Notification not found'});res.json({success:true,message:'Marked as read',data:r.rows[0]});}catch(e){next(e);}}
module.exports={list,read};
