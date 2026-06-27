require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

const MONGO_URI = process.env.MONGO_URI;

const makeSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const categories = [
  { name: 'Men', slug: 'men', description: 'Premium menswear collection', image: { url: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600' } },
  { name: 'Women', slug: 'women', description: 'Luxury womenswear collection', image: { url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600' } },
  { name: 'Accessories', slug: 'accessories', description: 'Premium fashion accessories', image: { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600' } },
  { name: 'Footwear', slug: 'footwear', description: 'Designer footwear', image: { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600' } },
  { name: 'Outerwear', slug: 'outerwear', description: 'Premium coats and jackets', image: { url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600' } },
  { name: 'Streetwear', slug: 'streetwear', description: 'Urban street style', image: { url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600' } },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Shahzaib Zaman',
      email: 'shahzaibzaman465@gmail.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('👤 Admin created: shahzaibzaman465@gmail.com / admin123');

    // Create test user
    await User.create({
      name: 'Test User',
      email: 'user@shahverse.com',
      password: 'user123456',
    });
    console.log('👤 Test user created: user@shahverse.com / user123456');

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`📂 ${createdCategories.length} categories created`);

    const menCat = createdCategories.find(c => c.name === 'Men');
    const womenCat = createdCategories.find(c => c.name === 'Women');
    const accessoriesCat = createdCategories.find(c => c.name === 'Accessories');
    const footwearCat = createdCategories.find(c => c.name === 'Footwear');
    const outerwearCat = createdCategories.find(c => c.name === 'Outerwear');
    const streetwearCat = createdCategories.find(c => c.name === 'Streetwear');

    const products = [
      {
        name: 'Shah Luxe Tailored Blazer',
        description: 'A masterfully crafted blazer that epitomizes modern luxury. Cut from premium Italian wool blend with structured shoulders and a refined silhouette.',
        shortDescription: 'Premium Italian wool blend tailored blazer',
        price: 18500,
        comparePrice: 24000,
        category: menCat._id,
        gender: 'Men',
        stock: 45,
        isFeatured: true,
        isTrending: true,
        images: [
          { url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800', alt: 'Luxe Blazer Front' },
          { url: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800', alt: 'Luxe Blazer Detail' },
        ],
        sizes: [{ size: 'S', stock: 10 }, { size: 'M', stock: 15 }, { size: 'L', stock: 12 }, { size: 'XL', stock: 8 }],
        tags: ['blazer', 'formal', 'luxury', 'wool'],
        material: 'Italian Wool Blend',
        rating: 4.8,
        numReviews: 23,
        soldCount: 67,
      },
      {
        name: 'Verse Silk Maxi Dress',
        description: 'Flowing silk maxi dress with delicate ruching at the waist. Features a deep V-neckline and adjustable straps for a timeless feminine silhouette.',
        shortDescription: 'Pure silk flowing maxi dress',
        price: 14500,
        comparePrice: 19500,
        category: womenCat._id,
        gender: 'Women',
        stock: 38,
        isFeatured: true,
        isNewArrival: true,
        images: [
          { url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800', alt: 'Silk Dress Front' },
          { url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800', alt: 'Silk Dress Detail' },
        ],
        sizes: [{ size: 'XS', stock: 8 }, { size: 'S', stock: 12 }, { size: 'M', stock: 10 }, { size: 'L', stock: 8 }],
        tags: ['dress', 'silk', 'luxury', 'evening'],
        material: 'Pure Silk',
        rating: 4.9,
        numReviews: 41,
        soldCount: 112,
      },
      {
        name: 'Shah Monogram Leather Belt',
        description: 'Handcrafted from full-grain calfskin leather, this belt features our signature monogram hardware in brushed gold. A timeless accessory for every wardrobe.',
        shortDescription: 'Full-grain leather belt with gold monogram',
        price: 5500,
        comparePrice: 7500,
        category: accessoriesCat._id,
        gender: 'Unisex',
        stock: 80,
        isFeatured: true,
        images: [
          { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800', alt: 'Leather Belt' },
        ],
        sizes: [{ size: 'S/M', stock: 40 }, { size: 'L/XL', stock: 40 }],
        tags: ['belt', 'leather', 'accessories', 'luxury'],
        material: 'Full-Grain Calfskin Leather',
        rating: 4.7,
        numReviews: 18,
        soldCount: 89,
      },
      {
        name: 'Verse Low-Top Sneakers',
        description: 'Premium Italian leather sneakers with a minimalist profile. Features a vulcanized rubber sole and hand-stitched detailing for understated luxury.',
        shortDescription: 'Italian leather luxury sneakers',
        price: 12800,
        comparePrice: 16000,
        category: footwearCat._id,
        gender: 'Unisex',
        stock: 55,
        isNewArrival: true,
        isTrending: true,
        images: [
          { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', alt: 'Sneakers Side' },
          { url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800', alt: 'Sneakers Top' },
        ],
        sizes: [{ size: '40', stock: 8 }, { size: '41', stock: 12 }, { size: '42', stock: 15 }, { size: '43', stock: 12 }, { size: '44', stock: 8 }],
        tags: ['sneakers', 'leather', 'footwear', 'luxury'],
        material: 'Italian Calfskin Leather',
        rating: 4.6,
        numReviews: 31,
        soldCount: 78,
      },
      {
        name: 'Noir Cashmere Overcoat',
        description: 'Impeccably tailored from pure Scottish cashmere, this overcoat is the pinnacle of cold-weather luxury. Double-breasted closure with peak lapels.',
        shortDescription: 'Pure Scottish cashmere double-breasted overcoat',
        price: 42000,
        comparePrice: 55000,
        category: outerwearCat._id,
        gender: 'Men',
        stock: 20,
        isFeatured: true,
        images: [
          { url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800', alt: 'Cashmere Overcoat' },
          { url: 'https://images.unsplash.com/photo-1542338347-4fff3276af78?w=800', alt: 'Overcoat Detail' },
        ],
        sizes: [{ size: 'S', stock: 4 }, { size: 'M', stock: 8 }, { size: 'L', stock: 5 }, { size: 'XL', stock: 3 }],
        tags: ['coat', 'cashmere', 'luxury', 'winter'],
        material: 'Pure Scottish Cashmere',
        rating: 4.9,
        numReviews: 12,
        soldCount: 34,
      },
      {
        name: 'Shah Cargo Track Pants',
        description: 'Elevated street style cargo pants crafted from technical fabric. Features multiple utility pockets and an adjustable drawstring waist.',
        shortDescription: 'Technical fabric utility cargo pants',
        price: 7800,
        comparePrice: 9500,
        category: streetwearCat._id,
        gender: 'Unisex',
        stock: 65,
        isTrending: true,
        isNewArrival: true,
        images: [
          { url: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4730?w=800', alt: 'Cargo Pants' },
        ],
        sizes: [{ size: 'S', stock: 15 }, { size: 'M', stock: 20 }, { size: 'L', stock: 20 }, { size: 'XL', stock: 10 }],
        tags: ['cargo', 'streetwear', 'pants', 'urban'],
        material: 'Technical Nylon Blend',
        rating: 4.5,
        numReviews: 27,
        soldCount: 145,
      },
      {
        name: 'Verse Embroidered Kurti',
        description: 'A masterpiece of Pakistani craftsmanship. Hand-embroidered with intricate floral patterns using silk thread. Perfect for formal occasions.',
        shortDescription: 'Hand-embroidered silk thread formal kurti',
        price: 9500,
        comparePrice: 13000,
        category: womenCat._id,
        gender: 'Women',
        stock: 30,
        isFeatured: true,
        isNewArrival: true,
        images: [
          { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800', alt: 'Embroidered Kurti' },
          { url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800', alt: 'Kurti Detail' },
        ],
        sizes: [{ size: 'XS', stock: 5 }, { size: 'S', stock: 8 }, { size: 'M', stock: 10 }, { size: 'L', stock: 7 }],
        tags: ['kurti', 'embroidered', 'formal', 'pakistani'],
        material: 'Silk with Thread Embroidery',
        rating: 4.8,
        numReviews: 36,
        soldCount: 93,
      },
      {
        name: 'Shah Classic Oxford Shoes',
        description: 'Handcrafted Goodyear-welted Oxford shoes in rich mahogany leather. A cornerstone of the gentleman\'s wardrobe, built to last a lifetime.',
        shortDescription: 'Goodyear-welted mahogany Oxford shoes',
        price: 22500,
        comparePrice: 28000,
        category: footwearCat._id,
        gender: 'Men',
        stock: 25,
        isFeatured: true,
        images: [
          { url: 'https://images.unsplash.com/photo-1614252234498-fd5e6d5e3399?w=800', alt: 'Oxford Shoes' },
          { url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800', alt: 'Oxford Detail' },
        ],
        sizes: [{ size: '40', stock: 4 }, { size: '41', stock: 6 }, { size: '42', stock: 7 }, { size: '43', stock: 5 }, { size: '44', stock: 3 }],
        tags: ['oxford', 'formal', 'leather', 'shoes'],
        material: 'Full-Grain Mahogany Leather',
        rating: 4.9,
        numReviews: 19,
        soldCount: 42,
      },
      {
        name: 'Verse Pleated Wide-Leg Trousers',
        description: 'Sophisticated wide-leg trousers with front pleats and a high-waisted silhouette. Crafted from a luxurious crepe fabric that drapes beautifully.',
        shortDescription: 'High-waisted crepe wide-leg trousers',
        price: 8900,
        comparePrice: 12000,
        category: womenCat._id,
        gender: 'Women',
        stock: 42,
        isTrending: true,
        images: [
          { url: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4730?w=800', alt: 'Wide-Leg Trousers' },
        ],
        sizes: [{ size: 'XS', stock: 8 }, { size: 'S', stock: 12 }, { size: 'M', stock: 14 }, { size: 'L', stock: 8 }],
        tags: ['trousers', 'wide-leg', 'formal', 'women'],
        material: 'Premium Crepe Fabric',
        rating: 4.6,
        numReviews: 22,
        soldCount: 58,
      },
      {
        name: 'Shah Silk Pocket Square Set',
        description: 'A curated set of three pure silk pocket squares in complementary colors. Hand-rolled edges and vibrant patterns make these a must-have accessory.',
        shortDescription: 'Set of 3 pure silk pocket squares',
        price: 3500,
        comparePrice: 5000,
        category: accessoriesCat._id,
        gender: 'Men',
        stock: 100,
        isNewArrival: true,
        images: [
          { url: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=800', alt: 'Pocket Squares' },
        ],
        sizes: [{ size: 'One Size', stock: 100 }],
        tags: ['pocket square', 'silk', 'accessories', 'men'],
        material: 'Pure Silk',
        rating: 4.7,
        numReviews: 14,
        soldCount: 187,
      },
      {
        name: 'Urban Bomber Jacket',
        description: 'A sleek bomber jacket with a premium satin finish. Features ribbed cuffs and hem, zip-through closure, and multiple interior pockets.',
        shortDescription: 'Satin finish premium bomber jacket',
        price: 11500,
        comparePrice: 15000,
        category: streetwearCat._id,
        gender: 'Unisex',
        stock: 50,
        isTrending: true,
        isFeatured: true,
        images: [
          { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800', alt: 'Bomber Jacket' },
          { url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800', alt: 'Bomber Detail' },
        ],
        sizes: [{ size: 'XS', stock: 8 }, { size: 'S', stock: 12 }, { size: 'M', stock: 15 }, { size: 'L', stock: 10 }, { size: 'XL', stock: 5 }],
        tags: ['bomber', 'jacket', 'streetwear', 'urban'],
        material: 'Premium Satin Polyester',
        rating: 4.5,
        numReviews: 33,
        soldCount: 201,
      },
      {
        name: 'Verse Linen Summer Set',
        description: 'Effortlessly chic co-ord set in breathable premium linen. The relaxed blazer and wide-leg trouser combo is perfect for resort wear.',
        shortDescription: 'Premium linen co-ord blazer & trouser set',
        price: 13500,
        comparePrice: 18000,
        category: womenCat._id,
        gender: 'Women',
        stock: 35,
        isNewArrival: true,
        images: [
          { url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800', alt: 'Linen Set' },
          { url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800', alt: 'Linen Set Detail' },
        ],
        sizes: [{ size: 'XS', stock: 6 }, { size: 'S', stock: 10 }, { size: 'M', stock: 12 }, { size: 'L', stock: 7 }],
        tags: ['linen', 'co-ord', 'set', 'resort', 'summer'],
        material: 'Premium Belgian Linen',
        rating: 4.8,
        numReviews: 28,
        soldCount: 76,
      },
    ];

    // Use create() one by one so pre-save slug hook fires
    const createdProducts = [];
    for (const p of products) {
      const created = await Product.create(p);
      createdProducts.push(created);
    }
    console.log(`📦 ${createdProducts.length} products created`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('================================');
    console.log('Admin: admin@shahverse.com / admin123456');
    console.log('User:  user@shahverse.com / user123456');
    console.log('================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
