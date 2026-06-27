require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

const MONGO_URI = process.env.MONGO_URI;

// ── Categories with fresh images ──────────────────────────────────────────────
const categories = [
  {
    name: 'Men',
    slug: 'men',
    description: 'Premium menswear collection',
    image: { url: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&q=80' },
  },
  {
    name: 'Women',
    slug: 'women',
    description: 'Luxury womenswear collection',
    image: { url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80' },
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Premium fashion accessories',
    image: { url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80' },
  },
  {
    name: 'Footwear',
    slug: 'footwear',
    description: 'Designer footwear collection',
    image: { url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80' },
  },
  {
    name: 'Outerwear',
    slug: 'outerwear',
    description: 'Premium coats and jackets',
    image: { url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80' },
  },
  {
    name: 'Streetwear',
    slug: 'streetwear',
    description: 'Urban street style',
    image: { url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80' },
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('✅ Connected to MongoDB — database: shahverse');

    // Clear
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // ── Users ──────────────────────────────────────────────────────────────────
    await User.create({
      name: 'Shahzaib Zaman',
      email: 'shahzaibzaman465@gmail.com',
      password: 'admin123',
      role: 'admin',
      avatar: { url: 'https://ui-avatars.com/api/?name=Shahzaib+Zaman&background=d4821e&color=fff' },
    });
    console.log('👤 Admin → shahzaibzaman465@gmail.com / admin123');

    await User.create({
      name: 'Test User',
      email: 'user@shahverse.com',
      password: 'user123456',
      avatar: { url: 'https://ui-avatars.com/api/?name=Test+User&background=1a1a1a&color=fff' },
    });
    console.log('👤 User  → user@shahverse.com / user123456');

    // ── Categories ─────────────────────────────────────────────────────────────
    const cats = await Category.insertMany(categories);
    const getCat = (name) => cats.find(c => c.name === name)._id;
    console.log(`📂 ${cats.length} categories created`);

    // ── Products — all with unique Unsplash images ─────────────────────────────
    const products = [
      // ── MEN ──────────────────────────────────────────────────────────────────
      {
        name: 'ShahVerse Slim Fit Blazer',
        description: 'Impeccably tailored slim-fit blazer crafted from premium Italian wool blend. Features notch lapels, structured shoulders, and a two-button closure. Perfect for formal occasions or smart-casual styling.',
        shortDescription: 'Premium Italian wool slim-fit blazer',
        price: 18500, comparePrice: 24000,
        category: getCat('Men'), gender: 'Men',
        stock: 45, brand: 'ShahVerse',
        isFeatured: true, isTrending: true,
        material: 'Italian Wool Blend',
        images: [
          { url: 'https://images.unsplash.com/photo-1555069519-127aadecd35a?w=800&q=80', alt: 'Slim Fit Blazer Front' },
          { url: 'https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=800&q=80', alt: 'Slim Fit Blazer Detail' },
        ],
        sizes: [{ size: 'S', stock: 10 }, { size: 'M', stock: 15 }, { size: 'L', stock: 12 }, { size: 'XL', stock: 8 }],
        tags: ['blazer', 'formal', 'luxury', 'wool', 'men'],
        rating: 4.8, numReviews: 23, soldCount: 67,
      },
      {
        name: 'ShahVerse Classic Oxford Shirt',
        description: 'A wardrobe essential crafted from 100% premium Egyptian cotton. The classic Oxford weave offers both comfort and refinement, with mother-of-pearl buttons and a tailored fit.',
        shortDescription: '100% Egyptian cotton Oxford shirt',
        price: 5500, comparePrice: 7500,
        category: getCat('Men'), gender: 'Men',
        stock: 80, brand: 'ShahVerse',
        isNewArrival: true,
        material: 'Egyptian Cotton',
        images: [
          { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80', alt: 'Oxford Shirt' },
          { url: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&q=80', alt: 'Oxford Shirt Detail' },
        ],
        sizes: [{ size: 'S', stock: 20 }, { size: 'M', stock: 25 }, { size: 'L', stock: 20 }, { size: 'XL', stock: 15 }],
        tags: ['shirt', 'cotton', 'formal', 'men'],
        rating: 4.6, numReviews: 18, soldCount: 142,
      },
      {
        name: 'ShahVerse Tailored Chinos',
        description: 'Refined chino trousers with a modern slim-fit silhouette. Crafted from stretch-cotton blend for all-day comfort without sacrificing style.',
        shortDescription: 'Stretch-cotton slim fit chinos',
        price: 7200, comparePrice: 9500,
        category: getCat('Men'), gender: 'Men',
        stock: 60, brand: 'ShahVerse',
        isTrending: true,
        material: 'Stretch Cotton Blend',
        images: [
          { url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80', alt: 'Tailored Chinos' },
        ],
        sizes: [{ size: '30', stock: 15 }, { size: '32', stock: 20 }, { size: '34', stock: 15 }, { size: '36', stock: 10 }],
        tags: ['chinos', 'trousers', 'men', 'smart casual'],
        rating: 4.5, numReviews: 31, soldCount: 98,
      },

      // ── WOMEN ─────────────────────────────────────────────────────────────────
      {
        name: 'Verse Silk Wrap Dress',
        description: 'Effortlessly elegant wrap dress in pure silk charmeuse. The fluid drape and adjustable wrap silhouette flatters every figure. Features a plunging V-neckline and flutter sleeves.',
        shortDescription: 'Pure silk charmeuse wrap dress',
        price: 16500, comparePrice: 22000,
        category: getCat('Women'), gender: 'Women',
        stock: 35, brand: 'ShahVerse',
        isFeatured: true, isNewArrival: true,
        material: 'Pure Silk Charmeuse',
        images: [
          { url: 'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=800&q=80', alt: 'Silk Wrap Dress' },
          { url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80', alt: 'Silk Dress Detail' },
        ],
        sizes: [{ size: 'XS', stock: 8 }, { size: 'S', stock: 10 }, { size: 'M', stock: 10 }, { size: 'L', stock: 7 }],
        tags: ['dress', 'silk', 'evening', 'women', 'luxury'],
        rating: 4.9, numReviews: 44, soldCount: 118,
      },
      {
        name: 'Verse Embroidered Lawn Suit',
        description: 'Exquisite three-piece lawn suit with intricate hand-embroidery on the shirt front and dupatta border. Pakistani craftsmanship at its finest.',
        shortDescription: 'Hand-embroidered three-piece lawn suit',
        price: 12000, comparePrice: 16000,
        category: getCat('Women'), gender: 'Women',
        stock: 30, brand: 'ShahVerse',
        isFeatured: true, isNewArrival: true,
        material: 'Premium Lawn Fabric',
        images: [
          { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80', alt: 'Embroidered Lawn Suit' },
          { url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80', alt: 'Embroidery Detail' },
        ],
        sizes: [{ size: 'XS', stock: 6 }, { size: 'S', stock: 8 }, { size: 'M', stock: 10 }, { size: 'L', stock: 6 }],
        tags: ['lawn', 'suit', 'embroidered', 'pakistani', 'women'],
        rating: 4.8, numReviews: 52, soldCount: 203,
      },
      {
        name: 'Verse Wide-Leg Palazzo Pants',
        description: 'Sophisticated palazzo pants in premium crepe fabric. The wide-leg silhouette creates an elongating effect with a comfortable high-rise waist.',
        shortDescription: 'Premium crepe high-rise palazzo pants',
        price: 8500, comparePrice: 11000,
        category: getCat('Women'), gender: 'Women',
        stock: 45, brand: 'ShahVerse',
        isTrending: true,
        material: 'Premium Crepe',
        images: [
          { url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80', alt: 'Palazzo Pants' },
        ],
        sizes: [{ size: 'XS', stock: 10 }, { size: 'S', stock: 12 }, { size: 'M', stock: 14 }, { size: 'L', stock: 9 }],
        tags: ['pants', 'palazzo', 'women', 'luxury'],
        rating: 4.6, numReviews: 27, soldCount: 76,
      },

      // ── ACCESSORIES ───────────────────────────────────────────────────────────
      {
        name: 'ShahVerse Gold Monogram Belt',
        description: 'Handcrafted full-grain calfskin leather belt with brushed 24k gold-plated monogram hardware. A signature piece that elevates any outfit.',
        shortDescription: 'Full-grain leather belt with gold hardware',
        price: 6500, comparePrice: 8500,
        category: getCat('Accessories'), gender: 'Unisex',
        stock: 70, brand: 'ShahVerse',
        isFeatured: true,
        material: 'Full-Grain Calfskin Leather',
        images: [
          { url: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&q=80', alt: 'Gold Monogram Belt' },
          { url: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80', alt: 'Belt Detail' },
        ],
        sizes: [{ size: 'S/M', stock: 35 }, { size: 'L/XL', stock: 35 }],
        tags: ['belt', 'leather', 'gold', 'accessories'],
        rating: 4.7, numReviews: 19, soldCount: 94,
      },
      {
        name: 'ShahVerse Silk Pocket Square Set',
        description: 'Set of three hand-rolled pure silk pocket squares in curated complementary colorways. Adds a refined finishing touch to any formal ensemble.',
        shortDescription: 'Set of 3 hand-rolled silk pocket squares',
        price: 3800, comparePrice: 5200,
        category: getCat('Accessories'), gender: 'Men',
        stock: 100, brand: 'ShahVerse',
        isNewArrival: true,
        material: 'Pure Silk',
        images: [
          { url: 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=800&q=80', alt: 'Silk Pocket Squares' },
        ],
        sizes: [{ size: 'One Size', stock: 100 }],
        tags: ['pocket square', 'silk', 'accessories', 'men'],
        rating: 4.7, numReviews: 14, soldCount: 201,
      },

      // ── FOOTWEAR ──────────────────────────────────────────────────────────────
      {
        name: 'ShahVerse Leather Derby Shoes',
        description: 'Goodyear-welted Derby shoes in rich mahogany calfskin. Hand-burnished finish with leather sole and heel. Built to last a lifetime of distinguished wear.',
        shortDescription: 'Goodyear-welted mahogany Derby shoes',
        price: 24000, comparePrice: 30000,
        category: getCat('Footwear'), gender: 'Men',
        stock: 25, brand: 'ShahVerse',
        isFeatured: true,
        material: 'Full-Grain Mahogany Calfskin',
        images: [
          { url: 'https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=800&q=80', alt: 'Derby Shoes' },
          { url: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80', alt: 'Derby Sole Detail' },
        ],
        sizes: [{ size: '40', stock: 4 }, { size: '41', stock: 6 }, { size: '42', stock: 7 }, { size: '43', stock: 5 }, { size: '44', stock: 3 }],
        tags: ['derby', 'leather', 'formal', 'shoes', 'men'],
        rating: 4.9, numReviews: 21, soldCount: 48,
      },
      {
        name: 'Verse Strappy Heeled Sandals',
        description: 'Minimalist strappy sandals with a slender 8cm heel. Crafted from genuine nappa leather with adjustable ankle strap and cushioned insole.',
        shortDescription: 'Nappa leather strappy heeled sandals',
        price: 13500, comparePrice: 17500,
        category: getCat('Footwear'), gender: 'Women',
        stock: 30, brand: 'ShahVerse',
        isNewArrival: true, isTrending: true,
        material: 'Genuine Nappa Leather',
        images: [
          { url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80', alt: 'Heeled Sandals' },
          { url: 'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=800&q=80', alt: 'Sandal Detail' },
        ],
        sizes: [{ size: '36', stock: 6 }, { size: '37', stock: 8 }, { size: '38', stock: 9 }, { size: '39', stock: 5 }, { size: '40', stock: 2 }],
        tags: ['sandals', 'heels', 'women', 'leather'],
        rating: 4.6, numReviews: 33, soldCount: 82,
      },

      // ── OUTERWEAR ─────────────────────────────────────────────────────────────
      {
        name: 'ShahVerse Cashmere Overcoat',
        description: 'Pure Scottish cashmere double-breasted overcoat with peak lapels and a structured silhouette. The pinnacle of cold-weather luxury dressing.',
        shortDescription: 'Pure Scottish cashmere double-breasted overcoat',
        price: 45000, comparePrice: 58000,
        category: getCat('Outerwear'), gender: 'Men',
        stock: 15, brand: 'ShahVerse',
        isFeatured: true,
        material: 'Pure Scottish Cashmere',
        images: [
          { url: 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=800&q=80', alt: 'Cashmere Overcoat' },
          { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80', alt: 'Overcoat Detail' },
        ],
        sizes: [{ size: 'S', stock: 3 }, { size: 'M', stock: 5 }, { size: 'L', stock: 4 }, { size: 'XL', stock: 3 }],
        tags: ['overcoat', 'cashmere', 'luxury', 'winter', 'men'],
        rating: 4.9, numReviews: 11, soldCount: 29,
      },

      // ── STREETWEAR ────────────────────────────────────────────────────────────
      {
        name: 'ShahVerse Urban Bomber Jacket',
        description: 'Elevated streetwear bomber in premium satin-finish nylon. Features embroidered ShahVerse logo, ribbed cuffs and hem, and a quilted lining for warmth.',
        shortDescription: 'Premium satin bomber with ShahVerse embroidery',
        price: 13500, comparePrice: 18000,
        category: getCat('Streetwear'), gender: 'Unisex',
        stock: 50, brand: 'ShahVerse',
        isFeatured: true, isTrending: true,
        material: 'Premium Satin Nylon',
        images: [
          { url: 'https://images.unsplash.com/photo-1616290569868-5bc9dba3f2fd?w=800&q=80', alt: 'Urban Bomber Jacket' },
          { url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80', alt: 'Bomber Detail' },
        ],
        sizes: [{ size: 'XS', stock: 8 }, { size: 'S', stock: 12 }, { size: 'M', stock: 15 }, { size: 'L', stock: 10 }, { size: 'XL', stock: 5 }],
        tags: ['bomber', 'jacket', 'streetwear', 'urban'],
        rating: 4.7, numReviews: 38, soldCount: 215,
      },
      {
        name: 'ShahVerse Cargo Utility Pants',
        description: 'Technical utility pants in water-resistant nylon ripstop. Six-pocket design with adjustable ankle cuffs and a relaxed tapered fit.',
        shortDescription: 'Water-resistant nylon cargo utility pants',
        price: 8800, comparePrice: 11500,
        category: getCat('Streetwear'), gender: 'Unisex',
        stock: 65, brand: 'ShahVerse',
        isTrending: true, isNewArrival: true,
        material: 'Nylon Ripstop',
        images: [
          { url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80', alt: 'Cargo Pants' },
        ],
        sizes: [{ size: 'S', stock: 15 }, { size: 'M', stock: 20 }, { size: 'L', stock: 20 }, { size: 'XL', stock: 10 }],
        tags: ['cargo', 'pants', 'streetwear', 'utility'],
        rating: 4.5, numReviews: 29, soldCount: 167,
      },
    ];

    // Create products one by one (pre-save hooks run for slug generation)
    const created = [];
    for (const p of products) {
      const doc = await Product.create(p);
      created.push(doc);
      process.stdout.write(`  ✓ ${doc.name}\n`);
    }
    console.log(`\n📦 ${created.length} products created in [shahverse] database`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('═══════════════════════════════════════');
    console.log('  Database : shahverse');
    console.log('  Admin    : shahzaibzaman465@gmail.com');
    console.log('  Password : admin123');
    console.log('  User     : user@shahverse.com');
    console.log('  Password : user123456');
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
