import express, { response } from "express";
import cors from "cors";
import mongoose from "mongoose";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/thoughts";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const { Schema } = mongoose;

const thoughtSchema = new Schema({
  message: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 140,
  },
  heart: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
});

const Thought = mongoose.model("Thought", thoughtSchema);

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Hello Technigo!");
});

app.get("/thoughts", async (req, res) => {
  const allThoughts = await Thought.find().limit(20).exec();
  if (allThoughts.length > 0) {
    res.json(allThoughts);
  } else {
    res.status(404).send("No happy thoughts found");
  }
});

app.post("/thoughts", async (req, res) => {
  try {
    const thought = new Thought({ message: req.body.message });
    await thought.save();
    res.status(201).json({
      success: true,
      response: thought,
      message: "Thought posted",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      response: error,
      message: "Could not post thought",
    });
  }
});

app.post("/thoughts/:thoughtId/like", async (req, res) => {
  const { thoughtId } = req.params;
  try {
    const thought = await Thought.findById(thoughtId);

    if (!thought) {
      return res.status(404).json({
        success: false,
        message: "Thought not found",
      });
    }

    const likedThought = await Thought.findByIdAndUpdate(
      thoughtId,
      {
        heart: thought.heart + 1,
      },
      { new: true }
    );

    res.json({ success: true, heart: likedThought.heart });
  } catch (error) {
    res.status(400).json({
      success: false,
      response: error,
      message: "Could not like thought",
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
