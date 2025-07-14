import mongoose from "mongoose";

const groupMessageSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
    image: {
      type: String,
    },

    messageType: {
      type: String,
      enum: ["Normal", "ShouldReply", "StrictReply"],
      default: "Normal",
    },
    strictScope: {
      type: String,
      enum: ["None", "MembersOnly", "All"],
      default: "None",
    },
    responders: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["Success", "Unable"],
        },
        infoMessage: String,
      },
    ],
    ignoredBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
     },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const GroupMessage = mongoose.model("GroupMessage", groupMessageSchema);
export default GroupMessage;
