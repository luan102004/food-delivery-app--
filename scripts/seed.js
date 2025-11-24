// scripts/seed-complete.js - COMPLETE SEED WITH GEOJSON
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

// Define schemas inline to avoid import issues
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: String,
  role: { type: String, enum: ['customer', 'restaurant', 'driver', 'admin'], default: 'customer' },
  passwordHash: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  }
}, { timestamps: true });

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true
      }
    }
  },
  phone: String,
  email: String,
  image: String,
  rating: { type: Number, default: 4.5 },
  cuisine: [String],
  openingHours: {
    monday: { open: String, close: String, isClosed: Boolean },
    tuesday: { open: String, close: String, isClosed: Boolean },
    wednesday: { open: String, close: String, isClosed: Boolean },
    thursday: { open: String, close: String, isClosed: Boolean },
    friday: { open: String, close: String, isClosed: Boolean },
    saturday: { open: String, close: String, isClosed: Boolean },
    sunday: { open: String, close: String, isClosed: Boolean }
  },
  isOpen: { type: Boolean, default: true }
}, { timestamps: true });

// Geospatial index
RestaurantSchema.index({ 'address.coordinates': '2dsphere' });

const MenuItemSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Restaurant' },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image: String,
  category: String,
  isAvailable: { type: Boolean, default: true },
  preparationTime: { type: Number, default: 15 },
  tags: [String]
}, { timestamps: true });

// Models
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', RestaurantSchema);
const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);

async function seed() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  🌱 Seeding Database                  ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('✅ Cleared\n');

    // 1. Create Users
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('123456', 10);

    const admin = await User.create({
      email: 'admin@foodhub.com',
      name: 'Admin User',
      phone: '+84 123 000 000',
      role: 'admin',
      passwordHash: hashedPassword
    });

    const customer = await User.create({
      email: 'customer@test.com',
      name: 'Test Customer',
      phone: '+84 123 456 789',
      role: 'customer',
      passwordHash: hashedPassword,
      address: {
        street: '123 Nguyen Hue',
        city: 'Ho Chi Minh City',
        state: 'Vietnam',
        zipCode: '70000',
        coordinates: { lat: 10.7769, lng: 106.7009 }
      }
    });

    const owner1 = await User.create({
      email: 'owner1@restaurant.com',
      name: 'Pizza Palace Owner',
      phone: '+84 909 111 111',
      role: 'restaurant',
      passwordHash: hashedPassword
    });

    const owner2 = await User.create({
      email: 'owner2@restaurant.com',
      name: 'Sushi Master Owner',
      phone: '+84 909 222 222',
      role: 'restaurant',
      passwordHash: hashedPassword
    });

    const driver = await User.create({
      email: 'driver@test.com',
      name: 'Test Driver',
      phone: '+84 987 654 321',
      role: 'driver',
      passwordHash: hashedPassword
    });

    console.log(`✅ Created ${5} users\n`);

    // 2. Create Restaurants with REAL HCMC coordinates
    console.log('🏪 Creating restaurants...');

    const restaurants = [
      {
        name: 'Pizza Palace Premium',
        description: 'Authentic Italian pizza with fresh ingredients',
        ownerId: owner1._id,
        address: {
          street: '123 Nguyen Hue, District 1',
          city: 'Ho Chi Minh City',
          state: 'Vietnam',
          zipCode: '70000',
          coordinates: {
            type: 'Point',
            coordinates: [106.7009, 10.7769] // [lng, lat] Nguyen Hue
          }
        },
        phone: '+84 28 3822 5678',
        email: 'info@pizzapalace.com',
        image: '🍕',
        rating: 4.8,
        cuisine: ['Italian', 'Pizza', 'Pasta'],
        openingHours: {
          monday: { open: '10:00', close: '22:00', isClosed: false },
          tuesday: { open: '10:00', close: '22:00', isClosed: false },
          wednesday: { open: '10:00', close: '22:00', isClosed: false },
          thursday: { open: '10:00', close: '22:00', isClosed: false },
          friday: { open: '10:00', close: '23:00', isClosed: false },
          saturday: { open: '10:00', close: '23:00', isClosed: false },
          sunday: { open: '11:00', close: '21:00', isClosed: false }
        },
        isOpen: true
      },
      {
        name: 'Sushi Master',
        description: 'Fresh sushi and Japanese cuisine',
        ownerId: owner2._id,
        address: {
          street: '456 Le Loi, District 1',
          city: 'Ho Chi Minh City',
          state: 'Vietnam',
          zipCode: '70000',
          coordinates: {
            type: 'Point',
            coordinates: [106.6950, 10.7740] // [lng, lat] Le Loi
          }
        },
        phone: '+84 28 3822 6789',
        email: 'info@sushimaster.com',
        image: '🍣',
        rating: 4.9,
        cuisine: ['Japanese', 'Sushi', 'Asian'],
        openingHours: {
          monday: { open: '11:00', close: '22:00', isClosed: false },
          tuesday: { open: '11:00', close: '22:00', isClosed: false },
          wednesday: { open: '11:00', close: '22:00', isClosed: false },
          thursday: { open: '11:00', close: '22:00', isClosed: false },
          friday: { open: '11:00', close: '23:00', isClosed: false },
          saturday: { open: '11:00', close: '23:00', isClosed: false },
          sunday: { open: '11:00', close: '22:00', isClosed: false }
        },
        isOpen: true
      },
      {
        name: 'Burger House',
        description: 'American-style burgers and fries',
        ownerId: owner1._id,
        address: {
          street: '789 Pasteur, District 3',
          city: 'Ho Chi Minh City',
          state: 'Vietnam',
          zipCode: '70000',
          coordinates: {
            type: 'Point',
            coordinates: [106.6875, 10.7820] // [lng, lat] Pasteur
          }
        },
        phone: '+84 28 3822 7890',
        email: 'info@burgerhouse.com',
        image: '🍔',
        rating: 4.6,
        cuisine: ['American', 'Burgers', 'Fast Food'],
        openingHours: {
          monday: { open: '09:00', close: '22:00', isClosed: false },
          tuesday: { open: '09:00', close: '22:00', isClosed: false },
          wednesday: { open: '09:00', close: '22:00', isClosed: false },
          thursday: { open: '09:00', close: '22:00', isClosed: false },
          friday: { open: '09:00', close: '23:00', isClosed: false },
          saturday: { open: '09:00', close: '23:00', isClosed: false },
          sunday: { open: '10:00', close: '22:00', isClosed: false }
        },
        isOpen: true
      }
    ];

    const createdRestaurants = await Restaurant.insertMany(restaurants);
    console.log(`✅ Created ${createdRestaurants.length} restaurants\n`);

    // 3. Create Menu Items
    console.log('🍽️  Creating menu items...');

    const menuItems = [];

    // Pizza Palace menu
    const pizzaPalace = createdRestaurants[0];
    menuItems.push(
      {
        restaurantId: pizzaPalace._id,
        name: 'Margherita Pizza',
        description: 'Classic tomato sauce, mozzarella, and fresh basil',
        price: 12.99,
        image: '🍕',
        category: 'Pizza',
        preparationTime: 20,
        tags: ['vegetarian', 'popular']
      },
      {
        restaurantId: pizzaPalace._id,
        name: 'Pepperoni Pizza',
        description: 'Tomato sauce, mozzarella, premium pepperoni',
        price: 14.99,
        image: '🍕',
        category: 'Pizza',
        preparationTime: 20,
        tags: ['popular', 'best-seller']
      },
      {
        restaurantId: pizzaPalace._id,
        name: 'Garlic Bread',
        description: 'Toasted bread with garlic butter',
        price: 4.99,
        image: '🥖',
        category: 'Sides',
        preparationTime: 8,
        tags: ['side']
      }
    );

    // Sushi Master menu
    const sushiMaster = createdRestaurants[1];
    menuItems.push(
      {
        restaurantId: sushiMaster._id,
        name: 'Salmon Sushi Roll',
        description: 'Fresh salmon, avocado, cucumber',
        price: 16.99,
        image: '🍣',
        category: 'Sushi',
        preparationTime: 15,
        tags: ['popular', 'fresh']
      },
      {
        restaurantId: sushiMaster._id,
        name: 'Tuna Sashimi',
        description: 'Premium tuna sashimi',
        price: 18.99,
        image: '🍣',
        category: 'Sushi',
        preparationTime: 10,
        tags: ['premium']
      }
    );

    // Burger House menu
    const burgerHouse = createdRestaurants[2];
    menuItems.push(
      {
        restaurantId: burgerHouse._id,
        name: 'Classic Cheeseburger',
        description: 'Beef patty, cheese, lettuce, tomato',
        price: 9.99,
        image: '🍔',
        category: 'Burgers',
        preparationTime: 12,
        tags: ['popular']
      },
      {
        restaurantId: burgerHouse._id,
        name: 'French Fries',
        description: 'Crispy golden fries',
        price: 3.99,
        image: '🍟',
        category: 'Sides',
        preparationTime: 8,
        tags: ['side']
      }
    );

    await MenuItem.insertMany(menuItems);
    console.log(`✅ Created ${menuItems.length} menu items\n`);

    // Summary
    console.log('╔════════════════════════════════════════╗');
    console.log('║  ✅ Seed Complete!                    ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log('📋 Created:');
    console.log(`   Users: 5 (1 admin, 1 customer, 2 owners, 1 driver)`);
    console.log(`   Restaurants: ${createdRestaurants.length}`);
    console.log(`   Menu Items: ${menuItems.length}\n`);

    console.log('🔑 Login Credentials:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│  Admin:      admin@foodhub.com          │');
    console.log('│  Customer:   customer@test.com          │');
    console.log('│  Restaurant: owner1@restaurant.com      │');
    console.log('│  Driver:     driver@test.com            │');
    console.log('│  Password:   123456 (all accounts)      │');
    console.log('└─────────────────────────────────────────┘\n');

    console.log('📍 Restaurant Locations (for testing):');
    createdRestaurants.forEach(r => {
      const [lng, lat] = r.address.coordinates.coordinates;
      console.log(`   ${r.name}: ${lat}, ${lng}`);
    });

    console.log('\n✨ You can now run: npm run dev\n');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
    process.exit(0);
  }
}

seed();