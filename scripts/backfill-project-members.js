#!/usr/bin/env node
const mongoose = require("mongoose");
const Project = require("../models/Project.model").default;

async function run() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("Please set MONGODB_URI env var");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI, {
    dbName: process.env.MONGODB_DB || undefined,
  });
  console.log("Connected to DB");

  // Backfill projects without members
  const cursor = Project.find({
    $or: [{ members: { $exists: false } }, { members: { $size: 0 } }],
  }).cursor();
  let count = 0;
  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    const proj = doc;
    proj.members = proj.members || [];
    proj.members.push({
      userId: proj.userId,
      role: "owner",
      invitedBy: proj.userId,
      inviteStatus: "accepted",
      joinedAt: proj.createdAt || new Date(),
    });
    await proj.save();
    count++;
    if (count % 50 === 0) console.log("Processed", count);
  }

  console.log("Backfilled", count, "projects");

  // Create helpful indexes
  try {
    await Project.collection.createIndex({ "members.userId": 1 });
    await Project.collection.createIndex({ userId: 1 });
    await mongoose.connection
      .collection("invites")
      .createIndex({ token: 1 }, { unique: true });
    await mongoose.connection
      .collection("sharedassets")
      .createIndex({ projectId: 1 });
    console.log("Indexes created");
  } catch (err) {
    console.error("Index creation error", err);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
