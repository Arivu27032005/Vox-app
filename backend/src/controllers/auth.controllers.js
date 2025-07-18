import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../lib/utilis.js";
import cloudinary from "../lib/cloudinary.js";

export const signup=async (req,res)=>{
    const {email,fullname,password}=req.body;
    try{
        if(!fullname || !email || !password){
            return res.status(400).json({message:"All Fields are Required"})
        }
        if(password.length<6) {
           return res.status(400).json({message:"Password must be atleast 6 characters"})
        }
        const user=await User.findOne({email})
        if(user) {
            return res.status(400).json({message:"Email already exists"})
        }
        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,salt)

        const newUser=new User({
            fullname,
            email,
            password:hashedPassword,
        })
        if(newUser){
            generateToken(newUser._id,res)
            await newUser.save()
            res.status(201).json({
                _id:newUser._id,
                fullname:newUser.fullname,
                email:newUser.email,
                profilePic:newUser.profilePic,
            })
        }else{
            res.status(400).json({message:"Invalid User data"})
        }
       }catch(error){
        console.log("Error in SignUp Controller",error.message)
        res.status(500).json({message:"Internal Server Error"})
       }
}

export const login=async (req,res)=>{
    const {email,password}=req.body;
    try{
        const user=await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"Invalid Credentials"})
        }
        const IsPassword=bcrypt.compare(password,user.password)
        if(!IsPassword){
            return res.status(400).json({message:"Invalid Credentials"})
        }
        generateToken(user._id,res)
        res.status(200).json({
            _id:user._id,
            fullname:user.fullname,
            email:user.email,
            profilePic:user.profilePic,
        })
    }catch(error){
        console.log("Error in Login controller" ,error.message)
        res.status(500).json({message:"Internal Server Error"})
    }
}

export const logout=(req,res)=>{
    try{
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({message:"Logged Out Successfully"})
    }catch(error){
        console.log("Error in Logout controller ",error.message);
        res.status(500).json({message:"Internal Server Error"})
    }
}
export const updateProfile=async (req,res)=>{
    try {
        const {profilePic}=req.body;
        const userId=req.user._id

        if(!profilePic){
            return res.status(400).json({message:"ProfilePic is Required"})
        }
        const uploadResponse=await cloudinary.uploader.upload(profilePic)
        const updatedUser=await User.findByIdAndUpdate(
            userId,
            {profilePic:uploadResponse.secure_url},
            {new:true}
        );
        res.status(200).json(updatedUser)
    } catch (error) {
        console.log("Error in update Profile",error.message)
        res.status(500).json({message:"Internal server error"})
    }
}
export const checkAuth=(req,res)=>{
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("Error in checkAuth controller",error.message)
        res.status(500).json({message:"Internal server Error"})
    }
}