import mongoose from 'mongoose';
import connectDB from '../src/lib/mongodb';

// Import models
const UserModel = require('../src/models/User').default;
const RestaurantModel = require('../src/models/Restaurant').default;
const MenuItemModel = require('../src/models/MenuItem').default;
const OrderModel = require('../src/models/Order').default;
const PromotionModel = require('../src/models/Promotion').default;

async function seed() {
  try {
    console.log('🌱 Starting seed...');
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      UserModel.deleteMany({}),
      RestaurantModel.deleteMany({}),
      MenuItemModel.deleteMany({}),
      OrderModel.deleteMany({}),
      PromotionModel.deleteMany({}),
    ]);

    // Create Users
    console.log('👥 Creating users...');
    const users = await UserModel.insertMany([
      {
        email: 'customer@test.com',
        name: 'John Doe',
        phone: '+84 123 456 789',
        role: 'customer',
        address: {
          street: '123 Main St',
          city: 'Ho Chi Minh City',
          state: 'Vietnam',
          zipCode: '70000',
          coordinates: { lat: 10.7769, lng: 106.7009 },
        },
      },
      {
        email: 'restaurant@test.com',
        name: 'Restaurant Owner',
        phone: '+84 987 654 321',
        role: 'restaurant',
      },
      {
        email: 'driver@test.com',
        name: 'Driver Mike',
        phone: '+84 555 555 555',
        role: 'driver',
      },
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create Restaurants
    console.log('🏪 Creating restaurants...');
    const restaurants = await RestaurantModel.insertMany([
      {
        name: 'Pizza Palace',
        description: 'Authentic Italian pizza and pasta',
        ownerId: users[1]._id,
        address: {
          street: '456 Restaurant Ave',
          city: 'Ho Chi Minh City',
          state: 'Vietnam',
          zipCode: '70000',
          coordinates: { lat: 10.7789, lng: 106.7029 },
        },
        phone: '+84 111 222 333',
        email: 'pizza@palace.com',
        image: '🍕',
        rating: 4.8,
        cuisine: ['Italian', 'Pizza'],
        openingHours: {
          monday: { open: '10:00', close: '22:00', isClosed: false },
          tuesday: { open: '10:00', close: '22:00', isClosed: false },
          wednesday: { open: '10:00', close: '22:00', isClosed: false },
          thursday: { open: '10:00', close: '22:00', isClosed: false },
          friday: { open: '10:00', close: '23:00', isClosed: false },
          saturday: { open: '10:00', close: '23:00', isClosed: false },
          sunday: { open: '11:00', close: '21:00', isClosed: false },
        },
        isOpen: true,
      },
      {
        name: 'Burger House',
        description: 'Best burgers in town',
        ownerId: users[1]._id,
        address: {
          street: '789 Food Street',
          city: 'Ho Chi Minh City',
          state: 'Vietnam',
          zipCode: '70000',
          coordinates: { lat: 10.7809, lng: 106.7049 },
        },
        phone: '+84 444 555 666',
        email: 'info@burgerhouse.com',
        image: '🍔',
        rating: 4.6,
        cuisine: ['American', 'Burgers'],
        openingHours: {
          monday: { open: '11:00', close: '22:00', isClosed: false },
          tuesday: { open: '11:00', close: '22:00', isClosed: false },
          wednesday: { open: '11:00', close: '22:00', isClosed: false },
          thursday: { open: '11:00', close: '22:00', isClosed: false },
          friday: { open: '11:00', close: '23:00', isClosed: false },
          saturday: { open: '11:00', close: '23:00', isClosed: false },
          sunday: { open: '11:00', close: '22:00', isClosed: false },
        },
        isOpen: true,
      },
      {
        name: 'Sushi Master',
        description: 'Fresh sushi and Japanese cuisine',
        ownerId: users[1]._id,
        address: {
          street: '321 Sushi Lane',
          city: 'Ho Chi Minh City',
          state: 'Vietnam',
          zipCode: '70000',
          coordinates: { lat: 10.7829, lng: 106.7069 },
        },
        phone: '+84 777 888 999',
        email: 'contact@sushimaster.com',
        image: '🍣',
        rating: 4.9,
        cuisine: ['Japanese', 'Sushi'],
        openingHours: {
          monday: { open: '12:00', close: '22:00', isClosed: false },
          tuesday: { open: '12:00', close: '22:00', isClosed: false },
          wednesday: { open: '12:00', close: '22:00', isClosed: false },
          thursday: { open: '12:00', close: '22:00', isClosed: false },
          friday: { open: '12:00', close: '23:00', isClosed: false },
          saturday: { open: '12:00', close: '23:00', isClosed: false },
          sunday: { open: '12:00', close: '22:00', isClosed: false },
        },
        isOpen: true,
      },
    ]);

    console.log(`✅ Created ${restaurants.length} restaurants`);

    // Create Menu Items
    console.log('🍽️  Creating menu items...');
    const menuItems = await MenuItemModel.insertMany([
      // Pizza Palace Menu
      {
        restaurantId: restaurants[0]._id,
        name: 'Margherita Pizza',
        description: 'Classic tomato sauce, mozzarella, and fresh basil',
        price: 12.99,
        image: '🍕',
        category: 'Pizza',
        isAvailable: true,
        preparationTime: 20,
        tags: ['vegetarian', 'popular'],
      },
      {
        restaurantId: restaurants[0]._id,
        name: 'Pepperoni Pizza',
        description: 'Tomato sauce, mozzarella, and spicy pepperoni',
        price: 14.99,
        image: '🍕',
        category: 'Pizza',
        isAvailable: true,
        preparationTime: 20,
        tags: ['popular', 'spicy'],
      },
      {
        restaurantId: restaurants[0]._id,
        name: 'Garlic Bread',
        description: 'Toasted bread with garlic butter and herbs',
        price: 4.99,
        image: '🥖',
        category: 'Sides',
        isAvailable: true,
        preparationTime: 8,
        tags: ['side'],
      },
      // Burger House Menu
      {
        restaurantId: restaurants[1]._id,
        name: 'Classic Cheeseburger',
        description: 'Beef patty, cheese, lettuce, tomato, pickles',
        price: 11.99,
        image: '🍔',
        category: 'Burgers',
        isAvailable: true,
        preparationTime: 15,
        tags: ['popular'],
      },
      {
        restaurantId: restaurants[1]._id,
        name: 'Double Bacon Burger',
        description: 'Two beef patties, bacon, cheese, special sauce',
        price: 15.99,
        image: '🍔',
        category: 'Burgers',
        isAvailable: true,
        preparationTime: 18,
        tags: ['popular', 'best-seller'],
      },
      {
        restaurantId: restaurants[1]._id,
        name: 'French Fries',
        description: 'Crispy golden fries',
        price: 3.99,
        image: '🍟',
        category: 'Sides',
        isAvailable: true,
        preparationTime: 10,
        tags: ['side'],
      },
      // Sushi Master Menu
      {
        restaurantId: restaurants[2]._id,
        name: 'Salmon Nigiri',
        description: 'Fresh salmon on seasoned rice',
        price: 8.99,
        image: '🍣',
        category: 'Sushi',
        isAvailable: true,
        preparationTime: 12,
        tags: ['popular'],
      },
      {
        restaurantId: restaurants[2]._id,
        name: 'California Roll',
        description: 'Crab, avocado, cucumber',
        price: 12.99,
        image: '🍣',
        category: 'Sushi',
        isAvailable: true,
        preparationTime: 15,
        tags: ['popular'],
      },
      {
        restaurantId: restaurants[2]._id,
        name: 'Miso Soup',
        description: 'Traditional Japanese soup',
        price: 3.99,
        image: '🍜',
        category: 'Soups',
        isAvailable: true,
        preparationTime: 5,
        tags: ['healthy'],
      },
    ]);

    console.log(`✅ Created ${menuItems.length} menu items`);

    // Create Promotions
    console.log('🎫 Creating promotions...');
    const promotions = await PromotionModel.insertMany([
      {
        code: 'SAVE30',
        type: 'percentage',
        value: 30,
        description: 'Get 30% off on all orders',
        minOrderAmount: 20,
        maxDiscount: 15,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        isActive: true,
        usageLimit: 1000,
        usedCount: 0,
      },
      {
        code: 'FREESHIP',
        type: 'free_delivery',
        value: 0,
        description: 'Free delivery on orders over $25',
        minOrderAmount: 25,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        isActive: true,
        usageLimit: 500,
        usedCount: 0,
      },
      {
        code: 'FIRST10',
        type: 'fixed',
        value: 10,
        description: '$10 off for first-time customers',
        minOrderAmount: 30,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        isActive: true,
        usageLimit: 200,
        usedCount: 0,
      },
    ]);

    console.log(`✅ Created ${promotions.length} promotions`);

    console.log('✅ Seed completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Restaurants: ${restaurants.length}`);
    console.log(`   Menu Items: ${menuItems.length}`);
    console.log(`   Promotions: ${promotions.length}`);
    console.log('\n🔑 Test Accounts:');
    console.log('   Customer: customer@test.com');
    console.log('   Restaurant: restaurant@test.com');
    console.log('   Driver: driver@test.com');
    console.log('\n💡 Promo Codes:');
    console.log('   SAVE30 - 30% off');
    console.log('   FREESHIP - Free delivery');
    console.log('   FIRST10 - $10 off');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();