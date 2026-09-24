const db=require('../config/db');
const {uploadImage}=require('../services/cloudinaryService');
const {notify}=require('../services/notificationService');

async function create(req,res,next){
  try{
    const {category,title,description,latitude,longitude,location}=req.body;
    if(!category||!title||!description) return res.status(400).json({success:false,message:'Category, title and description are required'});
    let image_url=null;
    if(req.file){
      if(req.file.size>5*1024*1024) return res.status(400).json({success:false,message:'Image must be 5 MB or smaller'});
      image_url=await uploadImage(req.file.buffer,req.file.originalname);
    }
    const r=await db.query(`INSERT INTO complaints(citizen_id,category,title,description,image_url,latitude,longitude,location)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.user.id,category,title,description,image_url,latitude||null,longitude||null,location||null]);
    await db.query('INSERT INTO audit_logs(user_id,action,details,ip_address) VALUES($1,$2,$3,$4)',
      [req.user.id,'CREATE_COMPLAINT',`Complaint #${r.rows[0].id}`,req.ip]);
    res.status(201).json({success:true,message:'Complaint submitted',data:r.rows[0]});
  }catch(e){next(e);}
}

async function list(req,res,next){
  try{
    let sql=`SELECT c.*,u.name citizen_name,o.name officer_name FROM complaints c
      JOIN users u ON u.id=c.citizen_id LEFT JOIN users o ON o.id=c.assigned_officer_id`;
    const p=[];
    if(req.user.role==='CITIZEN'){sql+=' WHERE c.citizen_id=$1';p.push(req.user.id);}
    if(req.user.role==='OFFICER'){sql+=' WHERE c.assigned_officer_id=$1';p.push(req.user.id);}
    sql+=' ORDER BY c.created_at DESC';
    const r=await db.query(sql,p);
    res.json({success:true,data:r.rows});
  }catch(e){next(e);}
}

async function getOne(req,res,next){
  try{
    const r=await db.query(`SELECT c.*,u.name citizen_name,u.email citizen_email,u.phone citizen_phone,o.name officer_name,o.email officer_email
      FROM complaints c JOIN users u ON u.id=c.citizen_id LEFT JOIN users o ON o.id=c.assigned_officer_id WHERE c.id=$1`,[req.params.id]);
    if(!r.rowCount)return res.status(404).json({success:false,message:'Complaint not found'});
    const c=r.rows[0];
    if(req.user.role==='CITIZEN' && c.citizen_id!==req.user.id)return res.status(403).json({success:false,message:'Access denied'});
    if(req.user.role==='OFFICER' && c.assigned_officer_id!==req.user.id)return res.status(403).json({success:false,message:'Access denied'});
    res.json({success:true,data:c});
  }catch(e){next(e);}
}

async function update(req,res,next){
  try{
    const {title,description,category,location,latitude,longitude}=req.body;
    const r=await db.query(`UPDATE complaints SET title=COALESCE($1,title),description=COALESCE($2,description),
      category=COALESCE($3,category),location=COALESCE($4,location),latitude=COALESCE($5,latitude),longitude=COALESCE($6,longitude),updated_at=NOW()
      WHERE id=$7 AND citizen_id=$8 RETURNING *`,[title,description,category,location,latitude,longitude,req.params.id,req.user.id]);
    if(!r.rowCount)return res.status(404).json({success:false,message:'Complaint not found'});
    res.json({success:true,message:'Complaint updated',data:r.rows[0]});
  }catch(e){next(e);}
}

async function remove(req,res,next){
  try{
    const r=await db.query(`DELETE FROM complaints WHERE id=$1 AND citizen_id=$2 AND status='Pending' RETURNING id`,[req.params.id,req.user.id]);
    if(!r.rowCount)return res.status(400).json({success:false,message:'Only your pending complaints can be deleted'});
    res.json({success:true,message:'Complaint deleted'});
  }catch(e){next(e);}
}

module.exports={create,list,getOne,update,remove};
