import mongoose from "mongoose"

const GroupSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    members:[
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"User",
                required:true,
            },
            displayName:{
                type:String,
                default:"",
            },
            userId:{
                type:String,
            },
            role:{
                type:String,
                enum:["Leader", "Assistant", "Officer", "Member"],
                default:"Member"
            },
            joinedAt: { 
                type: Date,
                default: Date.now 
            }
         }
    ],
    createdAt:{
        type:Date,
        default:Date.now
    }
})
const Group=mongoose.model("Group", GroupSchema)
export default Group