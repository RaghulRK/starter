require('dotenv-flow').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

app.get("/api/health", (req, res) => {
    console.log("Accounts service running ✅");
})

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("MongoDB connected")
}).catch((err) => {
    console.log(`Mongo DB ${err}`)
})
const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
    console.log(`Accounts service is running on port:${PORT}`);
});
