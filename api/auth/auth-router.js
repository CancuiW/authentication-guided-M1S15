const express=require('express')
const router=express.Router()
const bcrypt=require('bcryptjs')
const Users=require('./../users/users-model')

router.post('/register',async(req,res,next)=>{
    try {
        const {username,password} = req.body
        const hash = bcrypt.hashSync(password, 8)//2^8
        const newUser={username,password:hash}
   
        const result = await Users.add(newUser)
        res.status(201).json({message:`nice to have you, ${result.username}`})
       
    }catch(err){
        next(err)
    }

})


router.post('/login', async (req, res, next) => {
    try{
        const { username, password } = req.body
        const [user]=await Users.findBy({username})
        if(user&&bcrypt.compareSync(password,user.password)){
            //after check the user information in database,
            //and then server set a cookie and send it back to client
            req.session.user=user 
            res.json({message:`welcome back, ${username}`})
        }else{
            next({status:401,message:'bad credentials'})
        }

    }catch(err){
        next(err)
    }

})
router.get('/logout', async (req, res, next) => {
    if(req.session.user){
        const {username}=req.session.user
        req.session.destroy(err=>{
            if(err){
                res.json({message:`you can never leave, ${username}`})
            }else{
                //even if there is no cookie but contains session,it still can not access to 
                res.set('Set-Cookie','monkey=; SameSite=Strict; Path=/; Expires=Thu, 01 Jan 1970 00:00:00')
                res.json({message:`Goodbye ${username}`})
            }
        })
    }else{
        res.json({message:'sorry, have we met?'})
    }

})





module.exports=router