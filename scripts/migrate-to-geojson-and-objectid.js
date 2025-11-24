// scripts/migrate-to-geojson-and-objectid.js
require("dotenv").config();
const mongoose = require("mongoose");

// Import built JS models from dist if you build, otherwise you need ts-node
let Restaurant, MenuItem, Order;
try {
  Restaurant = require("../dist/models/Restaurant").default;
  MenuItem = require("../dist/models/MenuItem").default;
  Order = require("../dist/models/Order").default;
} catch (e) {
  // fallback to src JS (if project compiled using ts-node/register)
  Restaurant = require("../src/models/Restaurant").default;
  MenuItem = require("../src/models/MenuItem").default;
  Order = require("../src/models/Order").default;
}

async function main() {
  console.log("Connecting to DB...");
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected.");

  const restaurants = await Restaurant.find({});
  for (const r of restaurants) {
    const addr = r.address || {};
    if (addr.coordinates && typeof addr.coordinates.lat !== "undefined") {
      const lat = Number(addr.coordinates.lat) || 0;
      const lng = Number(addr.coordinates.lng) || 0;
      r.address.coordinates = { type: "Point", coordinates: [lng, lat] };
      await r.save();
      console.log("fixed restaurant", r._id);
    }
  }

  const menus = await MenuItem.find({});
  for (const m of menus) {
    if (m.restaurantId && typeof m.restaurantId === "string" && mongoose.isValidObjectId(m.restaurantId)) {
      m.restaurantId = mongoose.Types.ObjectId(m.restaurantId);
      await m.save();
      console.log("fixed menu", m._id);
    }
  }

  const orders = await Order.find({});
  for (const o of orders) {
    let changed = false;
    if (o.customerId && typeof o.customerId === "string" && mongoose.isValidObjectId(o.customerId)) { o.customerId = mongoose.Types.ObjectId(o.customerId); changed = true; }
    if (o.restaurantId && typeof o.restaurantId === "string" && mongoose.isValidObjectId(o.restaurantId)) { o.restaurantId = mongoose.Types.ObjectId(o.restaurantId); changed = true; }
    if (o.driverId && typeof o.driverId === "string" && mongoose.isValidObjectId(o.driverId)) { o.driverId = mongoose.Types.ObjectId(o.driverId); changed = true; }
    if (changed) await o.save();
  }

  console.log("migration complete");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
