import mongoose from "mongoose";

const messageSchema=new mongoose.Schema(
    {
        senderId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        receiverId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        group:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Group"
        },
        text:{
            type:String,
        },
        image:{
            type:String,
        },

        // Important message handling

        messageType:{
            type:String,
            enum:["Normal", "ShouldReply", "StrictReply"],
            default:'Normal'
        },
        strictScope:{
            type:String,
            enum:["None", "MembersOnly", "All"],
            default:"None"
        },
        responders:[
            {
                user:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:"User"
                },
                status:{
                    type:String,
                    enum:['Success', "Unable"]
                },
                infoMessage:{
                    type:String
                }
            }
        ],
        createdAt:{
            type:Date,
            default:Date.now
        }
    },
    {timestamps:true}
)
const Message=mongoose.model("Message",messageSchema);

export default Message;