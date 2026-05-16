import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Room name is required"],
      trim: true,
      maxlength: [30, "Room name cannot exceed 30 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [120, "Description cannot exceed 120 characters"],
    },
    color: {
      type: String,
      default: "bg-brand-500",
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

roomSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

roomSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return true;
  return bcrypt.compare(candidatePassword, this.password);
};

roomSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const Room = mongoose.model("Room", roomSchema);
export default Room;
