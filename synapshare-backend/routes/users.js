const express = require("express");
const router = express.Router();
const { auth } = require("../firebase");

// Delete a user
router.delete("/:email", async (req, res) => {
  try {
    await auth.deleteUser(req.params.email);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
