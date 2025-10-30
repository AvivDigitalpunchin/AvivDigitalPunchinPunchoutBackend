import mongoose from "mongoose";

const PunchSchema = new mongoose.Schema({
  punchInTime: { type: Date },
  punchOutTime: { type: Date },
  locationIn: {
    lat: { type: Number },
    lng: { type: Number },
  },
  locationOut: {
    lat: { type: Number },
    lng: { type: Number },
  }, 
});

const PunchInSchema = new mongoose.Schema({
  email: { type: String, required: true },
  punches: [PunchSchema],
  lastPunchStatus: { type: Boolean, default: false } // true if last punch is punch-in
});

const PunchInDB = mongoose.model("PunchIn", PunchInSchema);

export default PunchInDB