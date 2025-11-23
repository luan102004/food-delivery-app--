// scripts/seed-restaurant-owner.js
// Script tạo tài khoản Restaurant Owner với đầy đủ thông tin

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../src/lib/mongodb.js';

const UserModel = require('../src/models/User').default;
const RestaurantModel = require('../src/models/Restaurant').default;
const MenuItemModel = require('../src/models/MenuItem').default;

async function seedRestaurantOwner() {
  try {
    console.log('╔════════════════════════════════════════╗');
    console.log('║  🏪 Restaurant Owner Setup            ║');
    console.log('╚════════════════════════════════════════╝\n');

    await connectDB();

    // ============================================
    // 1️⃣ TẠO RESTAURANT OWNER
    // ============================================
    console.log('👤 Creating restaurant owner account...');
    
    const ownerEmail = 'owner@pizzapalace.com';
    
    // Kiểm tra xem đã tồn tại chưa
    let owner = await UserModel.findOne({ email: ownerEmail });
    
    if (owner) {
      console.log('   ⚠️  Owner already exists, using existing account');
    } else {
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      owner = await UserModel.create({
        email: ownerEmail,
        name: 'Trần Minh Tuấn',
        phone: '+84 909 123 456',
        role: 'restaurant',
        passwordHash: hashedPassword,
        address: {
          street: '456 Nguyễn Thị Minh Khai',
          city: 'Hồ Chí Minh',
          state: 'Việt Nam',
          zipCode: '70000',
          coordinates: { lat: 10.7789, lng: 106.7029 },
        },
      });
      
      console.log('   ✓ Owner created:', owner.name);
    }

    // ============================================
    // 2️⃣ TẠO RESTAURANT (liên kết với owner)
    // ============================================
    console.log('\n🏪 Creating restaurant...');
    
    // Xóa restaurant cũ nếu có
    await RestaurantModel.deleteMany({ ownerId: owner._id });
    
    const restaurant = await RestaurantModel.create({
      name: 'Pizza Palace Premium',
      description: 'Authentic Italian pizza made with love and tradition. Fresh ingredients imported directly from Italy.',
      ownerId: owner._id, // ← QUAN TRỌNG: Liên kết với owner
      address: {
        street: '123 Nguyễn Huệ, Quận 1',
        city: 'Hồ Chí Minh',
        state: 'Việt Nam',
        zipCode: '700000',
        coordinates: { 
          lat: 10.7769, 
          lng: 106.7009 
        }, // ← Địa chỉ cho map view
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
        sunday: { open: '11:00', close: '21:00', isClosed: false },
      },
      isOpen: true,
    });
    
    console.log('   ✓ Restaurant created:', restaurant.name);
    console.log('   ✓ Location:', `${restaurant.address.coordinates.lat}, ${restaurant.address.coordinates.lng}`);

    // ============================================
    // 3️⃣ TẠO MENU ITEMS
    // ============================================
    console.log('\n🍽️  Creating menu items...');
    
    const menuItemsData = [
      // Pizza
      {
        name: 'Margherita Pizza',
        description: 'Classic Italian pizza with fresh tomato sauce, mozzarella di bufala, fresh basil, and extra virgin olive oil',
        price: 12.99,
        image: '🍕',
        category: 'Pizza',
        isAvailable: true,
        preparationTime: 20,
        tags: ['vegetarian', 'popular', 'classic'],
      },
      {
        name: 'Pepperoni Pizza',
        description: 'Tomato sauce, mozzarella, and premium spicy pepperoni slices',
        price: 14.99,
        image: '🍕',
        category: 'Pizza',
        isAvailable: true,
        preparationTime: 20,
        tags: ['popular', 'spicy', 'meat'],
      },
      {
        name: 'Quattro Formaggi',
        description: 'Four cheese pizza: mozzarella, gorgonzola, parmesan, and ricotta',
        price: 16.99,
        image: '🍕',
        category: 'Pizza',
        isAvailable: true,
        preparationTime: 22,
        tags: ['vegetarian', 'premium', 'cheese-lover'],
      },
      {
        name: 'Diavola Pizza',
        description: 'Spicy salami, mozzarella, hot peppers, and chili oil',
        price: 15.99,
        image: '🍕',
        category: 'Pizza',
        isAvailable: true,
        preparationTime: 20,
        tags: ['spicy', 'meat', 'hot'],
      },
      
      // Pasta
      {
        name: 'Spaghetti Carbonara',
        description: 'Creamy pasta with crispy bacon, parmesan, egg yolk, and black pepper',
        price: 13.99,
        image: '🍝',
        category: 'Pasta',
        isAvailable: true,
        preparationTime: 18,
        tags: ['popular', 'creamy', 'italian'],
      },
      {
        name: 'Penne Arrabiata',
        description: 'Spicy tomato sauce with garlic, chili peppers, and fresh parsley',
        price: 11.99,
        image: '🍝',
        category: 'Pasta',
        isAvailable: true,
        preparationTime: 15,
        tags: ['vegetarian', 'spicy', 'vegan-option'],
      },
      
      // Sides
      {
        name: 'Garlic Bread',
        description: 'Toasted ciabatta with garlic butter, herbs, and melted cheese',
        price: 4.99,
        image: '🥖',
        category: 'Sides',
        isAvailable: true,
        preparationTime: 8,
        tags: ['side', 'vegetarian'],
      },
      {
        name: 'Caesar Salad',
        description: 'Romaine lettuce, croutons, parmesan, and Caesar dressing',
        price: 8.99,
        image: '🥗',
        category: 'Salads',
        isAvailable: true,
        preparationTime: 10,
        tags: ['healthy', 'fresh', 'light'],
      },
      
      // Desserts
      {
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream',
        price: 6.99,
        image: '🍰',
        category: 'Desserts',
        isAvailable: true,
        preparationTime: 5,
        tags: ['dessert', 'sweet', 'coffee'],
      },
      {
        name: 'Panna Cotta',
        description: 'Silky Italian cream dessert with berry compote',
        price: 5.99,
        image: '🍮',
        category: 'Desserts',
        isAvailable: true,
        preparationTime: 5,
        tags: ['dessert', 'sweet', 'creamy'],
      },
      
      // Beverages
      {
        name: 'Italian Soda',
        description: 'Sparkling water with flavored syrup',
        price: 3.99,
        image: '🥤',
        category: 'Beverages',
        isAvailable: true,
        preparationTime: 3,
        tags: ['drink', 'refreshing'],
      },
      {
        name: 'Espresso',
        description: 'Strong Italian coffee',
        price: 2.99,
        image: '☕',
        category: 'Beverages',
        isAvailable: true,
        preparationTime: 3,
        tags: ['drink', 'coffee'],
      },
    ];
    
    // Xóa menu items cũ
    await MenuItemModel.deleteMany({ restaurantId: restaurant._id });
    
    // Tạo menu items mới
    const menuItems = [];
    for (const itemData of menuItemsData) {
      const item = await MenuItemModel.create({
        ...itemData,
        restaurantId: restaurant._id, // ← QUAN TRỌNG: Liên kết với restaurant
      });
      menuItems.push(item);
      console.log(`   ✓ ${item.name} ($${item.price})`);
    }

    // ============================================
    // 📊 TỔNG KẾT
    // ============================================
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  ✅ Restaurant Owner Setup Complete!  ║');
    console.log('╚════════════════════════════════════════╝\n');
    
    console.log('📋 Summary:');
    console.log(`   Owner ID: ${owner._id}`);
    console.log(`   Restaurant ID: ${restaurant._id}`);
    console.log(`   Menu Items: ${menuItems.length}`);
    
    console.log('\n🔑 Login Information:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│  Email:    owner@pizzapalace.com        │');
    console.log('│  Password: 123456                       │');
    console.log('│  Role:     restaurant                   │');
    console.log('└─────────────────────────────────────────┘');
    
    console.log('\n📍 Restaurant Location (for Map View):');
    console.log(`   Latitude:  ${restaurant.address.coordinates.lat}`);
    console.log(`   Longitude: ${restaurant.address.coordinates.lng}`);
    console.log(`   Address:   ${restaurant.address.street}`);
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Visit: http://localhost:3000/auth/signin');
    console.log('   3. Login with: owner@pizzapalace.com / 123456');
    console.log('   4. You can now:');
    console.log('      - Add/Edit/Delete menu items');
    console.log('      - Manage orders');
    console.log('      - View analytics');
    console.log('      - Restaurant appears on Map View!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup error:', error);
    process.exit(1);
  }
}

// Chạy script
seedRestaurantOwner();