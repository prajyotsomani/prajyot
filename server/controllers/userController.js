 import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup=async(req,res)=>{
   
    try{
        const {email,fullName,password,bio=""}=req.body;

        if(!fullName||!email||!password){
            return res.json({success:false,message:"Missing Details" })

        }
        const user=await User.findOne({email});
        if(user){
            return res.json({success:false,message:"User already exists"})
        }

        const salt=await bcrypt.genSalt(10);
        const hashedPassword= await bcrypt.hash(password,salt);
        const newUser=await User.create({ 
            email,
            fullName,
            password:hashedPassword,
            bio
        })

        const safeUser = {
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            bio: newUser.bio,
            createdAt: newUser.createdAt
            // ... add more safe fields you want
        };

    const token=generateToken(newUser._id);
    return res.status(201).json({
            success: true,
            user: safeUser,           // ← better name than userData
            token,
            message: "User created successfully"
        });   


    }catch(err){
        console.log(err.message);
        res.json({success:false,message:err.message});
        
    }

}

export const login= async (req,res)=>{

    try{
        const {email,password}=req.body;
        if(!email||!password){
            return res.json({success:false,message:"Invalid Credentials"})
    
        }
        const user=await User.findOne({email});
        if(!user){
            return res.json({success:false,message:"Invalid Credentials"});
        }
        const isMatch= await bcrypt.compare(password,user.password);
        if(!isMatch){
            throw new Error("Invalid Credentials");
        }
     const token=generateToken(user._id);
     res.json({
        success:true,
        userData:user,
        token,
        message:"Login Successfuly",
     })



    }catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message});

    }

}

// controller to check if user is authenticated or not 
 export const checkAuth=(req,res)=>{
     res.json({success:true,user:req.user});
 }

// controller to update user profile details 

 export const updateProfile= async(req,res)=>{
    try{
       const {profilePic,bio,fullName}=req.body;
       const userId=req.user._id;
       let updateUser;
       if(!profilePic){
        updateUser= await User.findByIdAndUpdate(userId,{bio,fullName},{new:true});
       }else {
        const upload=await cloudinary.uploader.upload(profilePic);
        updateUser=await User.findByIdAndUpdate(userId,{profilePic:upload.secure_url,bio,fullName},{new:true});

       }
     res.json({success:true,user:updateUser})
       
    } catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message});
    }

 }
