// seed-nike.mjs - Auto-generated Nike product seed
// 250 products from inventory CSV + GOAT product data
//
// Size mapping:
//   Kids whole: 10=US1C, 20=US2C ... 130=US13C
//   H = adult half: 03H=US3.5, 04H=US4.5 ... 11H=US11.5
//   K = adult whole: 06K=US6, 07K=US7 ... 13K=US13
//
// Usage: node prisma/seed-nike.mjs

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: true } });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const products = [
  {
    "sku": "553558-067",
    "name": "Air Jordan 1 Low 'Bred'",
    "color": "Black/Varsity Red/White",
    "price": 849,
    "stock": 7,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/107/226/590/original/1494703_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 12C": 1,
      "US 13C": 1,
      "US 7.5": 2,
      "US 8.5": 1,
      "US 9.5": 1,
      "US 10.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "553560-092",
    "name": "Air Jordan 1 Low GS 'Black Toe Medium Olive'",
    "color": "Black/White/Medium Olive",
    "price": 699,
    "stock": 51,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/104/994/286/original/1456194_00.png.png",
    "category": "shoes",
    "shoeType": "grade_school",
    "sizes": {
      "US 4C": 12,
      "US 5C": 15,
      "US 6C": 2,
      "US 7C": 3,
      "US 3.5": 3,
      "US 4.5": 8,
      "US 5.5": 8
    },
    "brand": "Nike"
  },
  {
    "sku": "553560-152",
    "name": "Air Jordan 1 Low GS 'Iron Grey Black'",
    "color": "White/Black/Iron Grey",
    "price": 699,
    "stock": 62,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/102/571/981/original/553560_152.png.png",
    "category": "shoes",
    "shoeType": "grade_school",
    "sizes": {
      "US 4C": 7,
      "US 5C": 11,
      "US 6C": 4,
      "US 7C": 5,
      "US 3.5": 13,
      "US 4.5": 14,
      "US 5.5": 8
    },
    "brand": "Nike"
  },
  {
    "sku": "BQ7196-041",
    "name": "Air Jordan Sky Jordan 1 TD 'University Blue'",
    "color": "Black/University Blue/White",
    "price": 399,
    "stock": 4,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/108/959/490/original/BQ7196_041.png.png",
    "category": "shoes",
    "shoeType": "toddler",
    "sizes": {
      "US 8": 3,
      "US 10": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "BQ7196-092",
    "name": "Air Jordan Sky Jordan 1 TD 'Black Toe Medium Olive'",
    "color": "Black/Medium Olive/White",
    "price": 399,
    "stock": 1,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/108/959/491/original/BQ7196_092.png.png",
    "category": "shoes",
    "shoeType": "toddler",
    "sizes": {
      "US 6": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "BQ7197-041",
    "name": "Air Jordan Sky Jordan 1 PS 'University Blue'",
    "color": "Black/University Blue/White",
    "price": 499,
    "stock": 3,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/108/959/492/original/BQ7197_041.png.png",
    "category": "shoes",
    "shoeType": "preschool",
    "sizes": {
      "US 1C": 2,
      "US 13": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "BQ7197-092",
    "name": "Air Jordan Sky Jordan 1 PS 'Black Toe Medium Olive'",
    "color": "Black/Medium Olive/White",
    "price": 499,
    "stock": 5,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/108/959/493/original/BQ7197_092.png.png",
    "category": "shoes",
    "shoeType": "preschool",
    "sizes": {
      "US 2C": 1,
      "US 11": 3,
      "US 13": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "CD7069-108",
    "name": "Nike CD7069-108",
    "color": "",
    "price": 1099,
    "stock": 9,
    "imageUrl": "",
    "category": "",
    "shoeType": "adult",
    "sizes": {
      "US 8C": 1,
      "US 9C": 1,
      "US 10C": 1,
      "US 11C": 1,
      "US 12C": 1,
      "US 13C": 1,
      "US 7.5": 1,
      "US 8.5": 1,
      "US 9.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "DA8571-001",
    "name": "Nike Air Force 1 '07 Premium 'Silver Chain - Black'",
    "color": "Black/White/Metal Silver/Black",
    "price": 999,
    "stock": 26,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/061/103/144/original/811629_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 2,
      "US 8C": 9,
      "US 9C": 6,
      "US 8.5": 6,
      "US 9.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "DC0774-162",
    "name": "Wmns Air Jordan 1 Low 'Pink Oxford'",
    "color": "White/Pink Oxford/Sail",
    "price": 849,
    "stock": 2,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/447/114/original/1451467_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 7.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "DC0774-202",
    "name": "Wmns Air Jordan 1 Low 'Archaeo Brown'",
    "color": "Archaeo Brown/White",
    "price": 849,
    "stock": 1,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/104/910/315/original/1476248_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 7C": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "DC9486-105",
    "name": "Nike Wmns Air Force 1 '07 Next Nature 'Sail Canyon Pink'",
    "color": "Sail/Canyon Pink",
    "price": 799,
    "stock": 3,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/712/484/original/1490989_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 9C": 2,
      "US 8.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "DD0204-301",
    "name": "Nike Quest 5 'Black Olive Aura'",
    "color": "Olive Aura/Black/White/Bronzine",
    "price": 599,
    "stock": 66,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/111/039/412/original/DD0204_301.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 9,
      "US 8C": 1,
      "US 9C": 2,
      "US 10C": 11,
      "US 11C": 6,
      "US 12C": 5,
      "US 13C": 2,
      "US 7.5": 5,
      "US 8.5": 1,
      "US 9.5": 7,
      "US 10.5": 17
    },
    "brand": "Nike"
  },
  {
    "sku": "DD1391-100",
    "name": "Nike Dunk Low 'Black White'",
    "color": "White/Black/White",
    "price": 749,
    "stock": 18,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/071/445/308/original/719082_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 8C": 5,
      "US 9C": 3,
      "US 10C": 1,
      "US 7.5": 1,
      "US 8.5": 3,
      "US 9.5": 4,
      "US 10.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "DD1869-103",
    "name": "Nike Wmns Dunk High 'Black White'",
    "color": "White/Black/University Red",
    "price": 799,
    "stock": 15,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/102/364/283/original/758358_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 1,
      "US 7C": 5,
      "US 8C": 1,
      "US 9C": 1,
      "US 7.5": 2,
      "US 8.5": 5
    },
    "brand": "Nike"
  },
  {
    "sku": "DD1873-109",
    "name": "Nike Wmns Dunk Low Next Nature 'Light Wild Mango'",
    "color": "White/Light Wild Mango",
    "price": 749,
    "stock": 62,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/104/326/616/original/1450961_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 7,
      "US 7C": 13,
      "US 8C": 8,
      "US 9C": 4,
      "US 5.5": 2,
      "US 6.5": 6,
      "US 7.5": 13,
      "US 8.5": 9
    },
    "brand": "Nike"
  },
  {
    "sku": "DD1873-110",
    "name": "Nike Wmns Dunk Low Next Nature 'Hot Fuchsia'",
    "color": "White/Hot Fuchsia",
    "price": 749,
    "stock": 117,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/104/994/431/original/1475189_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 13,
      "US 7C": 27,
      "US 8C": 21,
      "US 9C": 5,
      "US 5.5": 1,
      "US 6.5": 15,
      "US 7.5": 23,
      "US 8.5": 12
    },
    "brand": "Nike"
  },
  {
    "sku": "DD1873-113",
    "name": "Nike Wmns Dunk Low Next Nature 'Light Smoke Grey'",
    "color": "White/Light Smoke Grey",
    "price": 749,
    "stock": 8,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/107/859/232/original/1508674_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 2,
      "US 8C": 2,
      "US 5.5": 1,
      "US 8.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "DH9393-002",
    "name": "Nike Air Max Interlock Lite GS 'Black Anthracite'",
    "color": "Black/Anthracite/Wolf Grey/White",
    "price": 569,
    "stock": 8,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/101/452/110/original/953686_00.png.png",
    "category": "shoes",
    "shoeType": "grade_school",
    "sizes": {
      "US 4C": 1,
      "US 5C": 1,
      "US 7C": 1,
      "US 3.5": 1,
      "US 5.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "DH9394-002",
    "name": "Nike Air Max Interlock Lite PS 'Black Anthracite'",
    "color": "Black/Anthracite/Wolf Grey/White",
    "price": 429,
    "stock": 10,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/077/488/405/original/DH9394-002.png.png",
    "category": "shoes",
    "shoeType": "preschool",
    "sizes": {
      "US 1C": 4,
      "US 11": 1,
      "US 12": 4,
      "US 13": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "DH9410-002",
    "name": "Nike Air Max Interlock Lite TD 'Black Anthracite'",
    "color": "Black/Anthracite/Wolf Grey/White",
    "price": 369,
    "stock": 7,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/103/825/110/original/1008115_00.png.png",
    "category": "shoes",
    "shoeType": "toddler",
    "sizes": {
      "US 7": 3,
      "US 8": 1,
      "US 9": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "DH9765-001",
    "name": "Nike Dunk Low GS 'Pure Platinum Wolf Grey'",
    "color": "Pure Platinum/White/Wolf Grey",
    "price": 599,
    "stock": 24,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/068/829/100/original/907039_00.png.png",
    "category": "shoes",
    "shoeType": "grade_school",
    "sizes": {
      "US 4C": 5,
      "US 5C": 1,
      "US 6C": 4,
      "US 7C": 2,
      "US 3.5": 3,
      "US 4.5": 5,
      "US 5.5": 2,
      "US 6.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "DJ4702-004",
    "name": "Nike Wmns Air Max Scorpion Flyknit 'Black Burgundy'",
    "color": "Black/Burgundy",
    "price": 1699,
    "stock": 33,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/110/854/375/original/DJ4702_004.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 4,
      "US 7C": 10,
      "US 8C": 4,
      "US 9C": 1,
      "US 6.5": 7,
      "US 7.5": 5,
      "US 8.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "DJ6566-105",
    "name": "Nike ZoomX Streakfly 'Guava Ice'",
    "color": "Pale Ivory/Guava Ice/Black",
    "price": 1099,
    "stock": 95,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/136/463/original/DJ6566_105.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 1,
      "US 8C": 5,
      "US 9C": 18,
      "US 10C": 16,
      "US 11C": 7,
      "US 12C": 7,
      "US 13C": 1,
      "US 7.5": 2,
      "US 8.5": 10,
      "US 9.5": 14,
      "US 10.5": 14
    },
    "brand": "Nike"
  },
  {
    "sku": "DJ7884-101",
    "name": "Nike Wmns Air Zoom Structure 25 'White Metallic Silver'",
    "color": "White/Pure Platinum/Metallic Silver",
    "price": 899,
    "stock": 50,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/093/432/274/original/DJ7884_101.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 9,
      "US 7C": 9,
      "US 8C": 2,
      "US 9C": 4,
      "US 5.5": 5,
      "US 6.5": 10,
      "US 7.5": 4,
      "US 8.5": 7
    },
    "brand": "Nike"
  },
  {
    "sku": "DJ7884-110",
    "name": "Nike Wmns Air Zoom Structure 25 'Mink Brown Varsity Maize'",
    "color": "Summit White/Mink Brown/Varsity Maize/Black",
    "price": 899,
    "stock": 52,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/648/187/original/DJ7884_110.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 5,
      "US 7C": 11,
      "US 8C": 10,
      "US 9C": 1,
      "US 5.5": 3,
      "US 6.5": 6,
      "US 7.5": 8,
      "US 8.5": 8
    },
    "brand": "Nike"
  },
  {
    "sku": "DM0113-100",
    "name": "Nike Wmns Court Vision Alta 'Triple White'",
    "color": "White/White/White",
    "price": 649,
    "stock": 44,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/064/745/476/original/836136_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 4,
      "US 7C": 7,
      "US 8C": 10,
      "US 9C": 4,
      "US 5.5": 2,
      "US 6.5": 4,
      "US 7.5": 7,
      "US 8.5": 6
    },
    "brand": "Nike"
  },
  {
    "sku": "DR2615-010",
    "name": "Nike ZoomX Invincible Run Flyknit 3 'Phantom Burgundy Crush'",
    "color": "Phantom/Burgundy Crush/Taupe Grey",
    "price": 1399,
    "stock": 17,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/110/222/803/original/1593157_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 2,
      "US 9C": 2,
      "US 10C": 1,
      "US 11C": 3,
      "US 12C": 3,
      "US 7.5": 2,
      "US 8.5": 1,
      "US 10.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "DV0833-111",
    "name": "Nike Dunk Low 'Vintage Green'",
    "color": "White/Vintage Green/White",
    "price": 749,
    "stock": 2,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/104/495/395/original/1449746_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 10C": 1,
      "US 10.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "DV0833-112",
    "name": "Nike Dunk Low 'Violet Ore'",
    "color": "Violet Ore/White",
    "price": 749,
    "stock": 1,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/104/994/261/original/1450514_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "DV0833-113",
    "name": "Nike Dunk Low 'University Blue Coconut Milk'",
    "color": "Coconut Milk/University Blue/Gym Red/Sail/White",
    "price": 749,
    "stock": 4,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/104/890/373/original/1450512_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 10C": 1,
      "US 10.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "DV0833-115",
    "name": "Nike Dunk Low 'Redwood'",
    "color": "White/Redwood/Gym Red",
    "price": 749,
    "stock": 4,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/104/379/926/original/1450513_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 11C": 1,
      "US 12C": 2,
      "US 9.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "DV3337-010",
    "name": "Nike Air Max DN 'Hyper Cobalt Rage Green'",
    "color": "Black/White/Hyper Cobalt/Rage Green/Cool Grey",
    "price": 1199,
    "stock": 5,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/102/572/037/original/DV3337_010.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 8C": 1,
      "US 11C": 2,
      "US 10.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "DV3337-011",
    "name": "Nike Air Max DN 'Light Smoke Grey Persian Violet'",
    "color": "Light Smoke Grey/Photon Dust/Persian Violet/Black",
    "price": 1199,
    "stock": 51,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/108/959/540/original/DV3337_011.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 5,
      "US 9C": 6,
      "US 10C": 7,
      "US 11C": 6,
      "US 12C": 2,
      "US 13C": 2,
      "US 7.5": 1,
      "US 8.5": 4,
      "US 9.5": 8,
      "US 10.5": 10
    },
    "brand": "Nike"
  },
  {
    "sku": "DV3865-001",
    "name": "Nike Wmns Pegasus Trail 5 'Black White'",
    "color": "Black/Anthracite/Wolf Grey/White",
    "price": 1049,
    "stock": 122,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/100/394/352/original/DV3865_001.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 15,
      "US 7C": 23,
      "US 8C": 22,
      "US 9C": 3,
      "US 5.5": 2,
      "US 6.5": 14,
      "US 7.5": 24,
      "US 8.5": 19
    },
    "brand": "Nike"
  },
  {
    "sku": "DV3865-007",
    "name": "Nike Wmns Pegasus Trail 5 'Phantom Black'",
    "color": "Phantom/Washed Coral/University Gold/Black",
    "price": 1049,
    "stock": 118,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/812/980/original/DV3865_007.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 16,
      "US 7C": 19,
      "US 8C": 19,
      "US 9C": 3,
      "US 5.5": 5,
      "US 6.5": 14,
      "US 7.5": 22,
      "US 8.5": 20
    },
    "brand": "Nike"
  },
  {
    "sku": "DV4022-006",
    "name": "Nike Air Winflo 10 'Sea Glass University Red'",
    "color": "Sea Glass/Midnight Navy/Blue Joy/University Red",
    "price": 799,
    "stock": 1,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/093/623/410/original/DV4022_006.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 10C": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "DV4023-003",
    "name": "Nike Wmns Winflo 10 'Black White'",
    "color": "Black/Black/White",
    "price": 799,
    "stock": 15,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/086/913/484/original/DV4023_003.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 2,
      "US 7C": 6,
      "US 7.5": 6,
      "US 8.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "DV4129-103",
    "name": "Nike ZoomX VaporFly Next% 3 'Sail Crimson Tint'",
    "color": "Sail/Crimson Tint/Guava Ice/Black",
    "price": 1699,
    "stock": 26,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/107/449/607/original/1509850_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 8C": 3,
      "US 9C": 3,
      "US 10C": 5,
      "US 11C": 1,
      "US 12C": 1,
      "US 7.5": 1,
      "US 8.5": 6,
      "US 9.5": 3,
      "US 10.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "DV4130-104",
    "name": "Nike Wmns ZoomX VaporFly Next% 3 'White Vivid Purple'",
    "color": "White/Vivid Purple/Purple Agate/Black",
    "price": 1699,
    "stock": 12,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/102/069/452/original/DV4130_104.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 2,
      "US 7C": 2,
      "US 8C": 2,
      "US 6.5": 1,
      "US 7.5": 3,
      "US 8.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "DV4130-700",
    "name": "Nike Wmns ZoomX VaporFly Next% 3 'Fast Pack'",
    "color": "Volt/Scream Green/Barely Volt/Black",
    "price": 1699,
    "stock": 21,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/104/747/503/original/1392705_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 6,
      "US 7C": 3,
      "US 8C": 1,
      "US 5.5": 2,
      "US 7.5": 9
    },
    "brand": "Nike"
  },
  {
    "sku": "DV5477-101",
    "name": "Nike Force 58 SB 'White Stadium Green Black'",
    "color": "White/Stadium Green/White/Black",
    "price": 599,
    "stock": 29,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/107/385/664/original/DV5477_101.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 1,
      "US 8C": 1,
      "US 9C": 6,
      "US 10C": 4,
      "US 11C": 2,
      "US 12C": 1,
      "US 7.5": 2,
      "US 8.5": 2,
      "US 9.5": 6,
      "US 10.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "DX1978-600",
    "name": "Nike ZoomX Ultrafly Trail 'Bright Crimson'",
    "color": "Bright Crimson/White/Black",
    "price": 1399,
    "stock": 44,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/101/340/466/original/DX1978_600.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 1,
      "US 8C": 3,
      "US 10C": 8,
      "US 11C": 6,
      "US 13C": 6,
      "US 7.5": 4,
      "US 9.5": 8,
      "US 10.5": 8
    },
    "brand": "Nike"
  },
  {
    "sku": "DZ2617-007",
    "name": "Nike Metcon 9 'Black Sesame'",
    "color": "Black/Gum Light Brown/Anthracite/Sesame",
    "price": 999,
    "stock": 6,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/924/868/original/1488974_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 1,
      "US 8C": 1,
      "US 9C": 1,
      "US 7.5": 2,
      "US 9.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "DZ2617-104",
    "name": "Nike Metcon 9 'White Volt'",
    "color": "White/White/Volt",
    "price": 999,
    "stock": 6,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/107/612/645/original/DZ2617_104.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 1,
      "US 8C": 2,
      "US 13C": 1,
      "US 7.5": 1,
      "US 10.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "DZ2794-001",
    "name": "Nike Wmns Dunk Low Twist 'Panda'",
    "color": "Black/Black/White",
    "price": 849,
    "stock": 75,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/090/482/323/original/1172474_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 5C": 1,
      "US 6C": 18,
      "US 7C": 12,
      "US 8C": 12,
      "US 9C": 3,
      "US 5.5": 1,
      "US 6.5": 11,
      "US 7.5": 14,
      "US 8.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "FB2207-407",
    "name": "Nike Revolution 7 'Armory Navy Desert Khaki'",
    "color": "Armory Navy/Green Strike/Hyper Pink/Desert Khaki",
    "price": 499,
    "stock": 60,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/812/984/original/FB2207_407.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 3,
      "US 8C": 5,
      "US 9C": 1,
      "US 10C": 5,
      "US 11C": 1,
      "US 12C": 7,
      "US 13C": 5,
      "US 7.5": 8,
      "US 8.5": 8,
      "US 9.5": 4,
      "US 10.5": 13
    },
    "brand": "Nike"
  },
  {
    "sku": "FB2598-100",
    "name": "Nike Air Zoom GT Cut Academy EP 'White Black'",
    "color": "White/Black",
    "price": 799,
    "stock": 10,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/098/402/569/original/FB2598_100.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 9C": 2,
      "US 11C": 1,
      "US 7.5": 2,
      "US 9.5": 1,
      "US 10.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "FB2689-001",
    "name": "Nike Air Zoom Crossover 2 GS 'Black Volt'",
    "color": "Black/Volt/White",
    "price": 599,
    "stock": 17,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/096/688/344/original/FB2689_001.png.png",
    "category": "shoes",
    "shoeType": "grade_school",
    "sizes": {
      "US 5C": 3,
      "US 6C": 2,
      "US 7C": 3,
      "US 4.5": 2,
      "US 5.5": 7
    },
    "brand": "Nike"
  },
  {
    "sku": "FB6877-002",
    "name": "Nike Wmns Cortez '23 Premium 'Black Anthracite'",
    "color": "Black/Anthracite/Black",
    "price": 799,
    "stock": 3,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/267/377/original/FB6877_002.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 5C": 1,
      "US 7C": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "FB7910-601",
    "name": "Nike Wmns Dunk Low 'Light Soft Pink'",
    "color": "Light Soft Pink/Platinum Tint/Coconut Milk",
    "price": 849,
    "stock": 1,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/262/116/original/1451471_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 8.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FB8502-001",
    "name": "Nike Wmns Vomero 17 'Black White'",
    "color": "Black/Anthracite/White",
    "price": 1099,
    "stock": 53,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/094/121/880/original/FB8502_001.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 11,
      "US 7C": 6,
      "US 8C": 7,
      "US 9C": 3,
      "US 5.5": 4,
      "US 6.5": 5,
      "US 7.5": 14,
      "US 8.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "FB8875-301",
    "name": "Nike Air Force 1 '07 Pro-Tech 'Sequoia'",
    "color": "Sequoia/Sequoia/Medium Olive",
    "price": 999,
    "stock": 42,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/103/681/383/original/FB8875_301.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 1,
      "US 8C": 4,
      "US 9C": 5,
      "US 10C": 7,
      "US 11C": 3,
      "US 12C": 2,
      "US 13C": 3,
      "US 7.5": 3,
      "US 8.5": 4,
      "US 9.5": 5,
      "US 10.5": 5
    },
    "brand": "Nike"
  },
  {
    "sku": "FB9109-121",
    "name": "Nike Dunk Low GS 'Cement Royal Pulse'",
    "color": "Summit White/Cement Grey/Royal Pulse",
    "price": 599,
    "stock": 4,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/102/266/241/original/FB9109_121.png.png",
    "category": "shoes",
    "shoeType": "grade_school",
    "sizes": {
      "US 4C": 1,
      "US 3.5": 1,
      "US 4.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "FB9149-003",
    "name": "Nike Air Zoom Vomero 5 'Yankees'",
    "color": "Vast Grey/Blue Void",
    "price": 1099,
    "stock": 47,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/108/422/595/original/1514321_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 9C": 1,
      "US 10C": 15,
      "US 11C": 6,
      "US 12C": 1,
      "US 13C": 3,
      "US 7.5": 3,
      "US 9.5": 6,
      "US 10.5": 12
    },
    "brand": "Nike"
  },
  {
    "sku": "FD0591-007",
    "name": "Air Jordan Zion 4 PF 'Mud to Marble'",
    "color": "Black/Mint Foam/Bright Crimson",
    "price": 1099,
    "stock": 6,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/488/original/FD0591_007.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 13C": 1,
      "US 7.5": 1,
      "US 9.5": 2,
      "US 10.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "FD0736-201",
    "name": "Nike Wmns V2K Run 'Particle Beige'",
    "color": "Particle Beige/College Grey/Light Bone/Particle Beige",
    "price": 849,
    "stock": 95,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/666/784/original/FD0736_201.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 12,
      "US 7C": 13,
      "US 8C": 16,
      "US 9C": 2,
      "US 5.5": 7,
      "US 6.5": 15,
      "US 7.5": 18,
      "US 8.5": 12
    },
    "brand": "Nike"
  },
  {
    "sku": "FD2196-004",
    "name": "Nike Wmns Phoenix Waffle 'Phantom'",
    "color": "Phantom/Sail/Black/Platinum Violet",
    "price": 699,
    "stock": 4,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/666/785/original/FD2196_004.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 7C": 1,
      "US 6.5": 1,
      "US 7.5": 1,
      "US 8.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FD2292-107",
    "name": "Nike FD2292-107",
    "color": "",
    "price": 649,
    "stock": 30,
    "imageUrl": "",
    "category": "",
    "shoeType": "adult",
    "sizes": {
      "US 6C": 3,
      "US 7C": 6,
      "US 8C": 4,
      "US 9C": 1,
      "US 5.5": 2,
      "US 6.5": 4,
      "US 7.5": 9,
      "US 8.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FD2722-109",
    "name": "Nike Air Zoom Pegasus 41 'Pale Ivory Limelight'",
    "color": "Pale Ivory/Limelight/Olive Aura/Sequoia",
    "price": 949,
    "stock": 7,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/666/791/original/FD2722_109.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 1,
      "US 8C": 1,
      "US 10C": 1,
      "US 12C": 1,
      "US 13C": 1,
      "US 7.5": 1,
      "US 10.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FD2722-602",
    "name": "Nike Air Zoom Pegasus 41 'University Red Black'",
    "color": "University Red/Light Crimson/Summit White/Black",
    "price": 949,
    "stock": 40,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/495/original/FD2722_602.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 5,
      "US 8C": 7,
      "US 9C": 6,
      "US 10C": 4,
      "US 11C": 1,
      "US 12C": 2,
      "US 7.5": 9,
      "US 8.5": 4,
      "US 9.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "FD2723-007",
    "name": "Nike Wmns Air Zoom Pegasus 41 'Photon Dust Metallic Pewter'",
    "color": "Photon Dust/Sail/Echo Pink/Metallic Pewter",
    "price": 949,
    "stock": 16,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/192/648/original/FD2723_007.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 8,
      "US 8C": 3,
      "US 9C": 1,
      "US 7.5": 2,
      "US 8.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "FD2723-008",
    "name": "Nike Wmns Air Zoom Pegasus 41 'Phantom Mink Brown'",
    "color": "Phantom/Mink Brown/Copper Moon/White",
    "price": 949,
    "stock": 10,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/110/021/968/original/1545885_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 2,
      "US 8C": 2,
      "US 9C": 1,
      "US 7.5": 3,
      "US 8.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "FD2723-009",
    "name": "Nike Wmns Air Zoom Pegasus 41 'Black Jade Pink'",
    "color": "Black/Jade Horizon/Bicoastal/Pink Foam",
    "price": 949,
    "stock": 89,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/136/468/original/FD2723_009.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 9,
      "US 7C": 18,
      "US 8C": 17,
      "US 9C": 2,
      "US 5.5": 2,
      "US 6.5": 4,
      "US 7.5": 20,
      "US 8.5": 17
    },
    "brand": "Nike"
  },
  {
    "sku": "FD2723-102",
    "name": "Nike Wmns Air Zoom Pegasus 41 'Pure Platinum'",
    "color": "White/Pure Platinum/Metallic Silver/White",
    "price": 949,
    "stock": 18,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/101/097/401/original/FD2723_102.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 8C": 8,
      "US 7.5": 7,
      "US 8.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "FD2723-107",
    "name": "Nike Wmns Air Zoom Pegasus 41 'Coconut Milk Hot Punch'",
    "color": "Coconut Milk/Photon Dust/Sail/Hot Punch",
    "price": 949,
    "stock": 51,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/107/612/653/original/FD2723_107.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 1,
      "US 7C": 4,
      "US 8C": 14,
      "US 9C": 2,
      "US 6.5": 8,
      "US 7.5": 9,
      "US 8.5": 13
    },
    "brand": "Nike"
  },
  {
    "sku": "FD2723-108",
    "name": "Nike Wmns Air Zoom Pegasus 41 'Sail Black'",
    "color": "Sail/Phantom/White/Black",
    "price": 949,
    "stock": 18,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/192/649/original/FD2723_108.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 3,
      "US 7C": 7,
      "US 8C": 2,
      "US 7.5": 6
    },
    "brand": "Nike"
  },
  {
    "sku": "FD2723-109",
    "name": "Nike Wmns Air Zoom Pegasus 41 'White Magic Ember'",
    "color": "White/Magic Ember/Black/Bright Crimson",
    "price": 949,
    "stock": 33,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/192/650/original/FD2723_109.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 5,
      "US 7C": 9,
      "US 8C": 6,
      "US 7.5": 7,
      "US 8.5": 6
    },
    "brand": "Nike"
  },
  {
    "sku": "FD4328-107",
    "name": "Nike Wmns Air Max 90 LV9 'Sail Night Maroon'",
    "color": "Sail/Night Maroon/Phantom/Black",
    "price": 999,
    "stock": 53,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/201/156/original/FD4328_107.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 7C": 14,
      "US 8C": 12,
      "US 9C": 1,
      "US 6.5": 1,
      "US 7.5": 14,
      "US 8.5": 11
    },
    "brand": "Nike"
  },
  {
    "sku": "FD4328-109",
    "name": "Nike Wmns Air Max 90 LV9 'Bold Berry Wolf Grey'",
    "color": "White/Bold Berry/Wolf Grey/Photon Dust",
    "price": 999,
    "stock": 79,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/108/171/522/original/FD4328_109.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 8,
      "US 7C": 12,
      "US 8C": 11,
      "US 9C": 5,
      "US 5.5": 3,
      "US 6.5": 13,
      "US 7.5": 8,
      "US 8.5": 19
    },
    "brand": "Nike"
  },
  {
    "sku": "FD4328-110",
    "name": "Nike Wmns Air Max 90 LV9 'Pink Foam'",
    "color": "White/Summit White/Elemental Pink/Pink Foam",
    "price": 999,
    "stock": 89,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/496/original/FD4328_110.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 17,
      "US 7C": 8,
      "US 8C": 14,
      "US 9C": 6,
      "US 5.5": 1,
      "US 6.5": 10,
      "US 7.5": 16,
      "US 8.5": 17
    },
    "brand": "Nike"
  },
  {
    "sku": "FD4691-004",
    "name": "Nike Vertebrae SB 'Light Smoke Grey Red'",
    "color": "Light Smoke Grey/Dark Smoke Grey/Black/Dark Team Red",
    "price": 649,
    "stock": 49,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/108/037/207/original/1545895_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 2,
      "US 8C": 5,
      "US 9C": 7,
      "US 10C": 7,
      "US 11C": 4,
      "US 12C": 2,
      "US 13C": 1,
      "US 7.5": 3,
      "US 8.5": 6,
      "US 9.5": 7,
      "US 10.5": 5
    },
    "brand": "Nike"
  },
  {
    "sku": "FD5131-202",
    "name": "Nike Calm Mule 'Medium Olive'",
    "color": "Medium Olive/Gum Medium Brown/Medium Olive",
    "price": 499,
    "stock": 24,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/498/original/FD5131_202.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 1,
      "US 8C": 7,
      "US 9C": 9,
      "US 10C": 3,
      "US 11C": 2,
      "US 13C": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "FD5131-400",
    "name": "Nike Calm Mule 'Navy Gum'",
    "color": "Navy/Gum Medium Brown",
    "price": 499,
    "stock": 44,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/212/116/original/FD5131_400.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 5,
      "US 8C": 6,
      "US 9C": 6,
      "US 10C": 12,
      "US 11C": 7,
      "US 12C": 6,
      "US 13C": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "FD7327-002",
    "name": "Nike Ja 2 EP 'Exposure'",
    "color": "Iron Grey/Cobalt Bliss/Light Bone/Bright Crimson/Black",
    "price": 899,
    "stock": 7,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/506/original/FD7327_002.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 1,
      "US 8C": 2,
      "US 12C": 1,
      "US 13C": 1,
      "US 7.5": 1,
      "US 8.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FJ2028-100",
    "name": "Nike Wmns Air Zoom Vomero 5 'White Hot Fuchsia'",
    "color": "White/Metallic Platinum/Pure Platinum/Hot Fuchsia/Black",
    "price": 1099,
    "stock": 8,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/104/985/262/original/FJ2028_100.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 2,
      "US 7C": 1,
      "US 8C": 2,
      "US 6.5": 1,
      "US 7.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "FJ2028-101",
    "name": "Nike Wmns Air Zoom Vomero 5 'Summit White Pure Platinum'",
    "color": "Summit White/Pure Platinum/Smoke Grey",
    "price": 1099,
    "stock": 55,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/107/858/972/original/1472457_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 4,
      "US 7C": 9,
      "US 8C": 6,
      "US 9C": 3,
      "US 5.5": 1,
      "US 6.5": 5,
      "US 7.5": 12,
      "US 8.5": 15
    },
    "brand": "Nike"
  },
  {
    "sku": "FJ4146-104",
    "name": "Nike Air Force 1 '07 'White Midnight Navy'",
    "color": "White/White/Midnight Navy",
    "price": 799,
    "stock": 1,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/102/926/718/original/1449758_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 13C": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FJ4151-003",
    "name": "Nike Air Zoom Vomero 5 'Wolf Grey'",
    "color": "Wolf Grey/Metallic Silver/Cool Grey/White",
    "price": 1099,
    "stock": 7,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/102/716/022/original/1412241_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 11C": 1,
      "US 10.5": 6
    },
    "brand": "Nike"
  },
  {
    "sku": "FJ4250-105",
    "name": "Nike Book 1 EP 'Forrest Gump'",
    "color": "White/Varsity Red/Varsity Blue",
    "price": 1099,
    "stock": 5,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/107/106/858/original/FJ4250_105.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 8C": 2,
      "US 9C": 1,
      "US 9.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "FJ4250-300",
    "name": "Nike Book 1 EP 'Flagstaff'",
    "color": "Fir/Phantom/Hemp/White",
    "price": 1099,
    "stock": 100,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/510/original/FJ4250_300.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 3,
      "US 8C": 11,
      "US 9C": 13,
      "US 10C": 14,
      "US 11C": 5,
      "US 12C": 4,
      "US 13C": 3,
      "US 7.5": 7,
      "US 8.5": 10,
      "US 9.5": 16,
      "US 10.5": 14
    },
    "brand": "Nike"
  },
  {
    "sku": "FJ7126-004",
    "name": "Nike Wmns Free Metcon 6 'Football Grey Hot Fuchsia'",
    "color": "Football Grey/Armory Navy/Hot Fuchsia",
    "price": 899,
    "stock": 3,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/107/855/688/original/FJ7126_004.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 2,
      "US 6.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FJ7126-103",
    "name": "Nike Wmns Free Metcon 6 'Sail Monarch'",
    "color": "Sail/White/Monarch",
    "price": 899,
    "stock": 79,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/512/original/FJ7126_103.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 8,
      "US 7C": 11,
      "US 8C": 12,
      "US 9C": 2,
      "US 5.5": 3,
      "US 6.5": 12,
      "US 7.5": 17,
      "US 8.5": 14
    },
    "brand": "Nike"
  },
  {
    "sku": "FJ7409-101",
    "name": "Nike Wmns Air Force 1 Dance Low 'Summit White Silver'",
    "color": "Summit White/Metallic Silver/Photon Dust",
    "price": 849,
    "stock": 3,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/104/461/439/original/FJ7409_101.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 1,
      "US 5.5": 1,
      "US 6.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FJ7765-110",
    "name": "Nike Wmns Journey Run 'Light Orewood Brown'",
    "color": "Light Orewood Brown/Hemp/Coconut Milk/White",
    "price": 699,
    "stock": 18,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/515/original/FJ7765_110.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 2,
      "US 7C": 2,
      "US 8C": 3,
      "US 5.5": 2,
      "US 6.5": 2,
      "US 7.5": 4,
      "US 8.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "FJ7808-101",
    "name": "Nike GT Hustle Academy EP 'White Glacier Blue'",
    "color": "White/Glacier Blue/Pure Platinum",
    "price": 799,
    "stock": 7,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/108/872/823/original/FJ7808_101.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 9C": 1,
      "US 10C": 1,
      "US 12C": 1,
      "US 13C": 1,
      "US 10.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "FJ7808-300",
    "name": "Nike GT Hustle Academy EP 'Vintage Green'",
    "color": "Vintage Green/Stadium Green/Jade Horizon/Sail",
    "price": 799,
    "stock": 38,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/107/612/663/original/FJ7808_300.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 1,
      "US 8C": 5,
      "US 9C": 3,
      "US 10C": 2,
      "US 11C": 3,
      "US 12C": 4,
      "US 13C": 1,
      "US 7.5": 6,
      "US 8.5": 1,
      "US 9.5": 8,
      "US 10.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "FJ9488-800",
    "name": "Nike KD 17 EP 'Slim Reaper'",
    "color": "Safety Orange/Sundial/Total Orange/Black/Sail",
    "price": 1299,
    "stock": 14,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/519/original/FJ9488_800.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 1,
      "US 8C": 2,
      "US 12C": 1,
      "US 13C": 2,
      "US 7.5": 1,
      "US 8.5": 3,
      "US 9.5": 1,
      "US 10.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "FJ9509-200",
    "name": "Nike Air Winflo 11 'Cave Stone Burgundy Crush'",
    "color": "Cave Stone/Vast Grey/Dark Smoke Grey/Burgundy Crush",
    "price": 799,
    "stock": 122,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/108/171/527/original/FJ9509_200.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 9,
      "US 8C": 14,
      "US 9C": 15,
      "US 10C": 13,
      "US 11C": 4,
      "US 12C": 4,
      "US 13C": 4,
      "US 7.5": 15,
      "US 8.5": 16,
      "US 9.5": 14,
      "US 10.5": 14
    },
    "brand": "Nike"
  },
  {
    "sku": "FJ9510-104",
    "name": "Nike Wmns Air Winflo 11 'Cement Grey Black Bold Berry'",
    "color": "White/Black/Cement Grey/Bold Berry",
    "price": 799,
    "stock": 51,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/520/original/FJ9510_104.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 4,
      "US 7C": 4,
      "US 8C": 9,
      "US 9C": 3,
      "US 7.5": 15,
      "US 8.5": 16
    },
    "brand": "Nike"
  },
  {
    "sku": "FJ9510-105",
    "name": "Nike Wmns Air Winflo 11 'Sail Bright Crimson'",
    "color": "Sail/Bright Crimson/Magic Ember",
    "price": 799,
    "stock": 113,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/521/original/FJ9510_105.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 14,
      "US 7C": 15,
      "US 8C": 18,
      "US 9C": 4,
      "US 5.5": 1,
      "US 6.5": 14,
      "US 7.5": 22,
      "US 8.5": 25
    },
    "brand": "Nike"
  },
  {
    "sku": "FN0237-113",
    "name": "Nike Force 1 Low EasyOn PS 'White Safety Orange'",
    "color": "White/White/Safety Orange",
    "price": 569,
    "stock": 8,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/201/175/original/FN0237_113.png.png",
    "category": "shoes",
    "shoeType": "preschool",
    "sizes": {
      "US 3C": 4,
      "US 11": 1,
      "US 12": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "FN0237-115",
    "name": "Nike Force 1 Low EasyOn PS 'White Blue Beyond Gum'",
    "color": "White/Gum Light Brown/Blue Beyond",
    "price": 569,
    "stock": 25,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/524/original/FN0237_115.png.png",
    "category": "shoes",
    "shoeType": "preschool",
    "sizes": {
      "US 1C": 4,
      "US 3C": 5,
      "US 11": 5,
      "US 12": 8,
      "US 13": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "FN1294-005",
    "name": "Nike Flex Runner 3 GS 'Black White'",
    "color": "Black/White",
    "price": 399,
    "stock": 3,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/099/425/922/original/FN1294_005.png.png",
    "category": "shoes",
    "shoeType": "grade_school",
    "sizes": {
      "US 7C": 1,
      "US 3.5": 1,
      "US 4.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FN5032-100",
    "name": "Wmns Air Jordan 1 Low Method of Make 'Sail Metallic Gold'",
    "color": "Sail/Metallic Gold",
    "price": 899,
    "stock": 7,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/100/130/566/original/FN5032_100.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 8C": 2,
      "US 5.5": 1,
      "US 8.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "FN6742-300",
    "name": "Nike Wmns Air Zoom Vomero 5 'Vintage Green'",
    "color": "Vintage Green/Chrome/Light Orewood Brown/Hemp",
    "price": 1149,
    "stock": 61,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/026/407/original/1476249_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 7,
      "US 7C": 11,
      "US 8C": 9,
      "US 9C": 2,
      "US 5.5": 3,
      "US 6.5": 8,
      "US 7.5": 13,
      "US 8.5": 8
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ0908-004",
    "name": "Nike Pegasus Trail 5 GORE-TEX 'Light Silver Wild Mango'",
    "color": "Light Silver/Light Wild Mango/Vintage Coral/Hyper Crimson",
    "price": 1199,
    "stock": 6,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/110/802/973/original/FQ0908_004.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 1,
      "US 11C": 1,
      "US 12C": 1,
      "US 13C": 1,
      "US 7.5": 1,
      "US 10.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ0908-006",
    "name": "Nike Pegasus Trail 5 GORE-TEX 'Cement Grey Midnight Navy'",
    "color": "Cement Grey/Jade Horizon/Burgundy Crush/Midnight Navy",
    "price": 1199,
    "stock": 14,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/212/139/original/FQ0908_006.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 4,
      "US 9C": 1,
      "US 10C": 1,
      "US 11C": 1,
      "US 12C": 1,
      "US 13C": 3,
      "US 7.5": 2,
      "US 10.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ0908-007",
    "name": "Nike Pegasus Trail 5 GORE-TEX 'Black Monarch'",
    "color": "Off Noir/Black/Monarch/Pale Ivory",
    "price": 1199,
    "stock": 49,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/107/385/690/original/FQ0908_007.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 6,
      "US 8C": 12,
      "US 9C": 7,
      "US 10C": 6,
      "US 13C": 6,
      "US 7.5": 4,
      "US 8.5": 7,
      "US 10.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ0908-102",
    "name": "Nike Pegasus Trail 5 GORE-TEX 'Light Silver Sequoia'",
    "color": "Summit White/Light Silver/College Grey/Sequoia",
    "price": 1199,
    "stock": 30,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/736/151/original/FQ0908_102.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 5,
      "US 8C": 10,
      "US 9C": 4,
      "US 10C": 1,
      "US 12C": 1,
      "US 13C": 3,
      "US 7.5": 3,
      "US 8.5": 1,
      "US 9.5": 1,
      "US 10.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ0912-003",
    "name": "Nike Wmns Pegasus Trail 5 GORE-TEX 'Phantom Black University Gold'",
    "color": "Phantom/White/University Gold/Black",
    "price": 1199,
    "stock": 37,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/676/262/original/FQ0912_003.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 8,
      "US 7C": 6,
      "US 8C": 7,
      "US 6.5": 8,
      "US 7.5": 2,
      "US 8.5": 6
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ0912-005",
    "name": "Nike Wmns Pegasus Trail 5 GORE-TEX 'Black Monarch'",
    "color": "Off Noir/Black/Monarch/Pale Ivory",
    "price": 1199,
    "stock": 43,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/812/993/original/FQ0912_005.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 10,
      "US 7C": 8,
      "US 8C": 6,
      "US 6.5": 2,
      "US 7.5": 10,
      "US 8.5": 7
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ0912-102",
    "name": "Nike Wmns Pegasus Trail 5 GORE-TEX 'Sail Photon Dust'",
    "color": "Sail/Photon Dust",
    "price": 1199,
    "stock": 23,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/107/612/670/original/FQ0912_102.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 7C": 6,
      "US 8C": 5,
      "US 9C": 1,
      "US 6.5": 3,
      "US 7.5": 5,
      "US 8.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ0912-400",
    "name": "Nike Wmns Pegasus Trail 5 GORE-TEX 'Armory Navy Platinum Violet'",
    "color": "Armory Navy/Vintage Green/Platinum Violet/Armory Navy",
    "price": 1199,
    "stock": 129,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/107/612/671/original/FQ0912_400.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 13,
      "US 7C": 26,
      "US 8C": 22,
      "US 9C": 3,
      "US 5.5": 3,
      "US 6.5": 18,
      "US 7.5": 28,
      "US 8.5": 16
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ0912-601",
    "name": "Nike Wmns Pegasus Trail 5 GORE-TEX 'Pink Oxford'",
    "color": "Pink Oxford/Red Sepia/Red Stardust",
    "price": 1199,
    "stock": 54,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/104/882/139/original/FQ0912_601.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 6,
      "US 7C": 7,
      "US 8C": 10,
      "US 9C": 3,
      "US 5.5": 4,
      "US 6.5": 7,
      "US 7.5": 7,
      "US 8.5": 10
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ1285-003",
    "name": "Air Jordan Luka 3 PF 'Motorsports'",
    "color": "Black/Game Royal/White",
    "price": 899,
    "stock": 39,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/536/original/FQ1285_003.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 3,
      "US 8C": 4,
      "US 9C": 5,
      "US 10C": 1,
      "US 11C": 3,
      "US 12C": 4,
      "US 13C": 2,
      "US 7.5": 3,
      "US 8.5": 5,
      "US 9.5": 5,
      "US 10.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ1285-100",
    "name": "Air Jordan Luka 3 PF 'Safari'",
    "color": "White/Laser Orange/Gum Light Brown/Hyper Jade",
    "price": 899,
    "stock": 37,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/107/612/673/original/FQ1285_100.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 3,
      "US 8C": 3,
      "US 9C": 2,
      "US 10C": 4,
      "US 11C": 5,
      "US 12C": 3,
      "US 13C": 2,
      "US 7.5": 4,
      "US 8.5": 3,
      "US 9.5": 4,
      "US 10.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ1356-002",
    "name": "Nike Air Zoom Pegasus 41 GORE-TEX 'Iron Grey Summit White'",
    "color": "Black/Anthracite/Iron Grey/Summit White",
    "price": 1099,
    "stock": 2,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/447/194/original/1496315_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 1,
      "US 13C": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ1356-003",
    "name": "Nike Air Zoom Pegasus 41 GORE-TEX 'Light Pumice Burgundy Crush'",
    "color": "Light Pumice/Burgundy Crush/Dark Smoke Grey/Ashen Slate",
    "price": 1099,
    "stock": 17,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/104/656/903/original/FQ1356_003.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 2,
      "US 8C": 4,
      "US 9C": 4,
      "US 10C": 1,
      "US 13C": 2,
      "US 7.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ1357-002",
    "name": "Nike Wmns Air Zoom Pegasus 41 GORE-TEX 'Black Iron Grey'",
    "color": "Black/Anthracite/Iron Grey/Summit White",
    "price": 1099,
    "stock": 9,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/212/142/original/FQ1357_002.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 8C": 3,
      "US 5.5": 1,
      "US 6.5": 1,
      "US 7.5": 2,
      "US 8.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ1357-100",
    "name": "Nike Wmns Air Zoom Pegasus 41 GORE-TEX 'Guava Ice'",
    "color": "Sail/Guava Ice/Crimson Tint/Anthracite",
    "price": 1099,
    "stock": 7,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/104/656/908/original/FQ1357_100.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 7C": 2,
      "US 9C": 1,
      "US 7.5": 3,
      "US 8.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ1357-400",
    "name": "Nike Wmns Air Zoom Pegasus 41 GORE-TEX 'Cobalt Bliss'",
    "color": "Cobalt Bliss/Armory Navy/Royal Pulse/Metallic Red Bronze",
    "price": 1099,
    "stock": 25,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/973/210/original/1496405_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 8,
      "US 7C": 10,
      "US 8C": 2,
      "US 6.5": 4,
      "US 8.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ1358-003",
    "name": "Nike Air Winflo 11 GORE-TEX 'Light Pumice Ashen Slate'",
    "color": "Light Pumice/Dark Smoke Grey/Burgundy Crush/Ashen Slate",
    "price": 949,
    "stock": 70,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/267/384/original/FQ1358_003.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 4,
      "US 8C": 5,
      "US 9C": 11,
      "US 10C": 12,
      "US 11C": 4,
      "US 12C": 2,
      "US 7.5": 8,
      "US 8.5": 5,
      "US 9.5": 11,
      "US 10.5": 8
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ1359-002",
    "name": "Nike Wmns Air Winflo 11 GORE-TEX 'Phantom Cobalt Bliss'",
    "color": "Phantom/Football Grey/Cobalt Bliss/Metallic Red Bronze",
    "price": 949,
    "stock": 50,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/267/386/original/FQ1359_002.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 8,
      "US 7C": 9,
      "US 8C": 8,
      "US 5.5": 1,
      "US 6.5": 6,
      "US 7.5": 11,
      "US 8.5": 7
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ1359-004",
    "name": "Nike Wmns Air Winflo 11 GORE-TEX 'Anthracite'",
    "color": "Anthracite/Black/Photon Dust/Metallic Silver",
    "price": 949,
    "stock": 43,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/540/original/FQ1359_004.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 7,
      "US 7C": 10,
      "US 8C": 6,
      "US 6.5": 4,
      "US 7.5": 14,
      "US 8.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ1759-102",
    "name": "Air Jordan Spizike Low 'White Cool Grey'",
    "color": "White/Anthracite/Wolf Grey/Cool Grey",
    "price": 1199,
    "stock": 9,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/648/220/original/FQ1759_102.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 1,
      "US 8C": 2,
      "US 9C": 1,
      "US 13C": 1,
      "US 7.5": 1,
      "US 8.5": 1,
      "US 10.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ1759-141",
    "name": "Air Jordan Spizike Low 'UNC'",
    "color": "White/University Blue/Wolf Grey/Anthracite",
    "price": 1199,
    "stock": 14,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/226/988/original/1450507_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 8C": 1,
      "US 10C": 2,
      "US 11C": 2,
      "US 12C": 1,
      "US 13C": 2,
      "US 7.5": 1,
      "US 8.5": 1,
      "US 9.5": 2,
      "US 10.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ3859-007",
    "name": "Air Jordan Heir PF 'Classic'",
    "color": "Black/Sail/Metallic Gold",
    "price": 799,
    "stock": 32,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/107/612/676/original/FQ3859_007.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 4,
      "US 8C": 3,
      "US 9C": 4,
      "US 11C": 4,
      "US 12C": 2,
      "US 13C": 1,
      "US 7.5": 3,
      "US 8.5": 1,
      "US 9.5": 5,
      "US 10.5": 5
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ3859-107",
    "name": "Air Jordan Heir PF 'Sail Volt'",
    "color": "Sail/Volt/Black",
    "price": 799,
    "stock": 63,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/267/389/original/FQ3859_107.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 2,
      "US 8C": 8,
      "US 9C": 9,
      "US 10C": 9,
      "US 11C": 3,
      "US 12C": 2,
      "US 13C": 3,
      "US 7.5": 3,
      "US 8.5": 7,
      "US 9.5": 8,
      "US 10.5": 9
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ5027-100",
    "name": "Nike Wmns ZoomX Invincible 3 Premium 'Sanddrift Pink Oxford'",
    "color": "Sanddrift/Pink Oxford/Light Soft Pink/Anthracite",
    "price": 1449,
    "stock": 44,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/107/367/115/original/FQ5027_100.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 5,
      "US 7C": 9,
      "US 8C": 9,
      "US 6.5": 3,
      "US 7.5": 8,
      "US 8.5": 10
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ7261-003",
    "name": "Nike Wmns Pegasus Plus 'Black Glacier Blue'",
    "color": "Black/Dark Grey/Beyond Pink/Glacier Blue",
    "price": 1299,
    "stock": 27,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/545/original/FQ7261_003.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 5,
      "US 7C": 3,
      "US 8C": 5,
      "US 9C": 2,
      "US 6.5": 3,
      "US 7.5": 5,
      "US 8.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ7261-108",
    "name": "Nike Wmns Pegasus Plus 'White Platinum Violet Bronze'",
    "color": "White/Platinum Violet/Plum Dust/Metallic Red Bronze",
    "price": 1299,
    "stock": 17,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/547/original/FQ7261_108.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 8C": 5,
      "US 9C": 2,
      "US 5.5": 1,
      "US 7.5": 4,
      "US 8.5": 5
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ7261-402",
    "name": "Nike Wmns Pegasus Plus 'Aluminum'",
    "color": "Aluminum/Royal Pulse/White/Black",
    "price": 1299,
    "stock": 5,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/549/original/FQ7261_402.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 1,
      "US 8C": 1,
      "US 6.5": 1,
      "US 7.5": 1,
      "US 8.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ7262-003",
    "name": "Nike Pegasus Plus 'Platinum Tint University Red'",
    "color": "Platinum Tint/Phantom/Black/University Red",
    "price": 1299,
    "stock": 12,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/107/367/116/original/FQ7262_003.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 2,
      "US 10C": 1,
      "US 12C": 2,
      "US 13C": 3,
      "US 7.5": 3,
      "US 10.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ7262-005",
    "name": "Nike Pegasus Plus 'Olive Grey Maroon'",
    "color": "Olive Grey/College Grey",
    "price": 1299,
    "stock": 19,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/550/original/FQ7262_005.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 1,
      "US 8C": 2,
      "US 11C": 2,
      "US 12C": 3,
      "US 13C": 1,
      "US 7.5": 1,
      "US 8.5": 4,
      "US 10.5": 5
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ7860-003",
    "name": "Nike Air Max DN8 'Black Volt'",
    "color": "Black/Volt/Light Smoke Grey",
    "price": 1399,
    "stock": 1,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/108/522/631/original/1530833_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 9.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ7860-200",
    "name": "Nike Air Max DN8 'Desert Khaki'",
    "color": "Desert Khaki/Black",
    "price": 1399,
    "stock": 6,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/685/829/original/1588782_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 10C": 2,
      "US 9.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ7860-300",
    "name": "Nike Air Max DN8 'Cargo Khaki'",
    "color": "Cargo Khaki/Cargo Khaki/Black/Oil Green",
    "price": 1399,
    "stock": 16,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/552/original/FQ7860_300.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 9C": 6,
      "US 10C": 4,
      "US 9.5": 5,
      "US 10.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ7939-103",
    "name": "Air Jordan 4 RM 'Pine Green'",
    "color": "White/Pine Green/Neutral Grey/Wolf Grey/Varsity Red/Gum Dark Brown",
    "price": 1099,
    "stock": 41,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/644/225/original/FQ7939_103.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 2,
      "US 8C": 4,
      "US 9C": 5,
      "US 10C": 5,
      "US 11C": 4,
      "US 12C": 2,
      "US 13C": 1,
      "US 7.5": 3,
      "US 8.5": 5,
      "US 9.5": 4,
      "US 10.5": 6
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ7940-001",
    "name": "Wmns Air Jordan 4 RM 'Grey Sail'",
    "color": "Light Smoke Grey/Light Smoke Grey/Coconut Milk",
    "price": 1099,
    "stock": 34,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/104/054/620/original/FQ7940_001.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 4,
      "US 7C": 5,
      "US 8C": 5,
      "US 9C": 2,
      "US 5.5": 2,
      "US 6.5": 5,
      "US 7.5": 6,
      "US 8.5": 5
    },
    "brand": "Nike"
  },
  {
    "sku": "FQ8185-100",
    "name": "Air Jordan Luka 3 GS 'Safari'",
    "color": "White/Laser Orange/Gum Light Brown/Hyper Jade",
    "price": 769,
    "stock": 8,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/110/312/original/FQ8185_100.png.png",
    "category": "shoes",
    "shoeType": "grade_school",
    "sizes": {
      "US 6C": 2,
      "US 7C": 5,
      "US 4.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FV1302-003",
    "name": "Nike Air Max Verse 'Black White'",
    "color": "Black/White/Black/White",
    "price": 799,
    "stock": 123,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/107/612/680/original/FV1302_003.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 7,
      "US 8C": 10,
      "US 9C": 11,
      "US 10C": 18,
      "US 11C": 12,
      "US 12C": 5,
      "US 13C": 5,
      "US 7.5": 7,
      "US 8.5": 14,
      "US 9.5": 19,
      "US 10.5": 15
    },
    "brand": "Nike"
  },
  {
    "sku": "FV1302-100",
    "name": "Nike Air Max Verse 'White Cosmic Clay'",
    "color": "White/Cosmic Clay/Summit White/Photon Dust",
    "price": 799,
    "stock": 15,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/564/original/FV1302_100.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 1,
      "US 8C": 2,
      "US 9C": 1,
      "US 10C": 3,
      "US 11C": 1,
      "US 12C": 1,
      "US 13C": 1,
      "US 8.5": 1,
      "US 9.5": 2,
      "US 10.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "FV2295-001",
    "name": "Nike Zoom Vomero Roam 'Black Light Silver'",
    "color": "Black/Light Silver/Jade Horizon/Black",
    "price": 1299,
    "stock": 20,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/475/765/original/1508655_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 9C": 1,
      "US 10C": 3,
      "US 11C": 3,
      "US 12C": 4,
      "US 7.5": 1,
      "US 8.5": 1,
      "US 9.5": 3,
      "US 10.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "FV2295-400",
    "name": "Nike Zoom Vomero Roam 'Racer Blue'",
    "color": "Racer Blue/Summit White/Black/Racer Blue",
    "price": 1299,
    "stock": 32,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/914/370/original/1508660_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 2,
      "US 8C": 3,
      "US 9C": 2,
      "US 10C": 9,
      "US 11C": 2,
      "US 12C": 2,
      "US 13C": 1,
      "US 7.5": 2,
      "US 8.5": 1,
      "US 9.5": 4,
      "US 10.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "FV5285-005",
    "name": "Nike Promina 'Black Copper Moon'",
    "color": "Black/College Grey/Copper Moon",
    "price": 499,
    "stock": 85,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/736/178/original/FV5285_005.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 4,
      "US 8C": 2,
      "US 9C": 7,
      "US 10C": 12,
      "US 11C": 11,
      "US 12C": 3,
      "US 13C": 3,
      "US 7.5": 7,
      "US 8.5": 10,
      "US 9.5": 13,
      "US 10.5": 13
    },
    "brand": "Nike"
  },
  {
    "sku": "FV5285-102",
    "name": "Nike Promina 'Light Orewood Brown Deep Royal'",
    "color": "Light Orewood Brown/Sail/Deep Royal Blue",
    "price": 499,
    "stock": 31,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/567/original/FV5285_102.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 8C": 2,
      "US 10C": 2,
      "US 11C": 8,
      "US 12C": 3,
      "US 13C": 3,
      "US 7.5": 3,
      "US 9.5": 5,
      "US 10.5": 5
    },
    "brand": "Nike"
  },
  {
    "sku": "FV5633-500",
    "name": "Nike Ja 2 GS 'Purple Sky'",
    "color": "Bold Berry/Baltic Blue/Light Lemon Twist/Dark Raisin",
    "price": 669,
    "stock": 1,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/104/287/765/original/FV5633_500.png.png",
    "category": "shoes",
    "shoeType": "grade_school",
    "sizes": {
      "US 3C": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FV5948-115",
    "name": "Nike Air Force 1 GS 'White Blue Beyond Gum'",
    "color": "White/Gum Light Brown/Blue Beyond",
    "price": 649,
    "stock": 29,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/569/original/FV5948_115.png.png",
    "category": "shoes",
    "shoeType": "grade_school",
    "sizes": {
      "US 4C": 2,
      "US 5C": 5,
      "US 6C": 4,
      "US 7C": 5,
      "US 3.5": 3,
      "US 4.5": 6,
      "US 5.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "FV5952-001",
    "name": "Nike Air Zoom GT Hustle 3 EP 'Swoosh Fly'",
    "color": "Anthracite/Ashen Slate/Metallic Gold/Light Wild Mango",
    "price": 1499,
    "stock": 13,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/361/700/original/FV5952_001.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 1,
      "US 9C": 4,
      "US 13C": 1,
      "US 7.5": 2,
      "US 8.5": 3,
      "US 9.5": 1,
      "US 10.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FV5952-004",
    "name": "Nike Air Zoom GT Hustle 3 EP 'Pure Platinum Glacier Blue'",
    "color": "Pure Platinum/White/Light Lemon Twist/Glacier Blue",
    "price": 1499,
    "stock": 16,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/570/original/FV5952_004.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 8C": 3,
      "US 10C": 3,
      "US 7.5": 3,
      "US 8.5": 1,
      "US 9.5": 3,
      "US 10.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "FV5952-300",
    "name": "Nike Air Zoom GT Hustle 3 EP 'Our Holiday Pack'",
    "color": "Jade Horizon/Cargo Khaki/Light Silver/Oil Green/University Red/Metallic Gold",
    "price": 1499,
    "stock": 5,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/571/original/FV5952_300.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 8C": 1,
      "US 9C": 2,
      "US 13C": 1,
      "US 8.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FV5960-200",
    "name": "Nike Wmns Dunk High Next Nature 'Light British Tan'",
    "color": "Light British Tan/White/Black",
    "price": 799,
    "stock": 13,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/612/230/original/FV5960_200.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 2,
      "US 7C": 3,
      "US 8C": 3,
      "US 9C": 1,
      "US 6.5": 2,
      "US 7.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "FV6040-001",
    "name": "Nike Air Zoom Rival Fly 4 'Black White Volt'",
    "color": "Black/Wolf Grey/Volt/White",
    "price": 699,
    "stock": 66,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/572/original/FV6040_001.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 2,
      "US 8C": 4,
      "US 9C": 5,
      "US 10C": 12,
      "US 11C": 4,
      "US 12C": 6,
      "US 13C": 5,
      "US 7.5": 3,
      "US 8.5": 8,
      "US 9.5": 7,
      "US 10.5": 10
    },
    "brand": "Nike"
  },
  {
    "sku": "FV8493-002",
    "name": "Nike PS8 SB 'Cool Grey Metallic Silver'",
    "color": "Cool Grey/Metallic Silver/Anthracite/Wolf Grey/Clear",
    "price": 899,
    "stock": 3,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/145/538/original/1487431_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 1,
      "US 7.5": 1,
      "US 9.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FZ1526-400",
    "name": "Nike KD 17 EP 'Christmas Pack'",
    "color": "Aquarius Blue/Glacier Blue/White/Metallic Silver",
    "price": 1299,
    "stock": 1,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/114/826/715/original/1565220_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 10C": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FZ1621-001",
    "name": "Nike Giannis Freak 6 EP 'Christmas Pack'",
    "color": "Black/Blue Tint/White/Baltic Blue",
    "price": 899,
    "stock": 18,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/576/original/FZ1621_001.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 1,
      "US 8C": 1,
      "US 9C": 4,
      "US 10C": 2,
      "US 11C": 2,
      "US 7.5": 2,
      "US 8.5": 1,
      "US 9.5": 1,
      "US 10.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "FZ2473-103",
    "name": "Nike FZ2473-103",
    "color": "",
    "price": 799,
    "stock": 21,
    "imageUrl": "",
    "category": "",
    "shoeType": "adult",
    "sizes": {
      "US 6C": 1,
      "US 7C": 3,
      "US 8C": 3,
      "US 9C": 5,
      "US 5.5": 1,
      "US 6.5": 1,
      "US 7.5": 4,
      "US 8.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "FZ2552-100",
    "name": "Nike Wmns Dunk Low 'Muslin Team Gold'",
    "color": "Muslin/Team Gold/Pale Ivory/Laser Orange/Coconut Milk",
    "price": 799,
    "stock": 6,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/026/508/original/1481213_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 7C": 1,
      "US 8C": 2,
      "US 9C": 2,
      "US 8.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FZ2552-500",
    "name": "Nike Wmns Dunk Low 'Viotech'",
    "color": "Viotech/Hot Fuchsia/Khaki/Black",
    "price": 799,
    "stock": 27,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/489/854/original/1514315_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 3,
      "US 7C": 6,
      "US 8C": 5,
      "US 9C": 1,
      "US 5.5": 1,
      "US 6.5": 4,
      "US 7.5": 4,
      "US 8.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "FZ3052-300",
    "name": "Nike Dunk Low SE 'Vintage Green Denim Turquoise'",
    "color": "Vintage Green/Denim Turquoise/Anthracite/Black",
    "price": 849,
    "stock": 14,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/293/783/original/1510474_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 1,
      "US 8C": 1,
      "US 9C": 1,
      "US 10C": 1,
      "US 11C": 4,
      "US 7.5": 1,
      "US 8.5": 1,
      "US 9.5": 1,
      "US 10.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "FZ3863-011",
    "name": "Nike C1TY 'Smoke Grey'",
    "color": "Smoke Grey/Medium Ash/Aquarius Blue/Summit White",
    "price": 849,
    "stock": 27,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/111/045/638/original/1548202_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 2,
      "US 9C": 2,
      "US 10C": 5,
      "US 11C": 3,
      "US 12C": 2,
      "US 13C": 1,
      "US 7.5": 2,
      "US 8.5": 4,
      "US 9.5": 2,
      "US 10.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "FZ3863-200",
    "name": "Nike C1TY 'Brownstone'",
    "color": "Flax/Sesame/Stadium Green/Black",
    "price": 849,
    "stock": 22,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/110/599/811/original/1506541_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 2,
      "US 8C": 2,
      "US 9C": 3,
      "US 10C": 2,
      "US 11C": 2,
      "US 12C": 1,
      "US 13C": 1,
      "US 7.5": 2,
      "US 8.5": 1,
      "US 9.5": 4,
      "US 10.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "FZ3863-300",
    "name": "Nike C1TY 'Surplus'",
    "color": "Light Army/Cargo Khaki/University Gold/Black",
    "price": 849,
    "stock": 7,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/168/782/original/1497553_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 1,
      "US 10C": 1,
      "US 12C": 1,
      "US 7.5": 1,
      "US 8.5": 1,
      "US 10.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "FZ5222-001",
    "name": "Nike Air Force 1 '07 LV8 'Light Smoke Grey Gold'",
    "color": "Light Smoke Grey/Metallic Gold/Pale Ivory/Light Smoke Grey",
    "price": 899,
    "stock": 5,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/035/788/original/FZ5222_001.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 8C": 1,
      "US 11C": 1,
      "US 12C": 2,
      "US 9.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "FZ5225-100",
    "name": "Nike Air Force 1 '07 LV8 'Coconut Milk Khaki'",
    "color": "Summit White/Khaki/Coconut Milk/Summit White",
    "price": 899,
    "stock": 48,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/110/194/813/original/1488936_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 2,
      "US 8C": 3,
      "US 10C": 3,
      "US 11C": 7,
      "US 12C": 8,
      "US 13C": 5,
      "US 7.5": 4,
      "US 10.5": 16
    },
    "brand": "Nike"
  },
  {
    "sku": "FZ5627-300",
    "name": "Nike Aqua Turf 'Jade Horizon Off Noir'",
    "color": "Jade Horizon/Off Noir/Light Orewood Brown/Ironstone",
    "price": 499,
    "stock": 49,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/648/245/original/FZ5627_300.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 2,
      "US 8C": 15,
      "US 9C": 14,
      "US 10C": 14,
      "US 11C": 2,
      "US 12C": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "FZ5627-500",
    "name": "Nike Aqua Turf 'Deep Night Laser Orange'",
    "color": "Deep Night/Laser Orange/Sesame/Black",
    "price": 499,
    "stock": 48,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/110/290/558/original/1544798_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 2,
      "US 8C": 13,
      "US 9C": 14,
      "US 10C": 15,
      "US 11C": 2,
      "US 12C": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "FZ6601-001",
    "name": "Air Jordan Tatum 3 PF 'Zen'",
    "color": "Platinum Tint/Particle Grey/Grey Fog/Black",
    "price": 899,
    "stock": 38,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/190/214/original/FZ6601_001.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 8C": 4,
      "US 9C": 3,
      "US 10C": 3,
      "US 11C": 4,
      "US 12C": 5,
      "US 13C": 3,
      "US 7.5": 5,
      "US 8.5": 1,
      "US 9.5": 3,
      "US 10.5": 7
    },
    "brand": "Nike"
  },
  {
    "sku": "FZ8587-700",
    "name": "Nike Vomero 17 'Talaria'",
    "color": "Volt/White/Bright Crimson/Black",
    "price": 1099,
    "stock": 56,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/104/750/911/original/FZ8587_700.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 2,
      "US 8C": 5,
      "US 9C": 9,
      "US 10C": 9,
      "US 11C": 4,
      "US 12C": 4,
      "US 13C": 3,
      "US 7.5": 4,
      "US 8.5": 4,
      "US 9.5": 8,
      "US 10.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "HF0711-004",
    "name": "Nike Zoom LeBron NXXT Genisus EP 'Black'",
    "color": "Black/Anthracite/Black",
    "price": 1199,
    "stock": 15,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/601/original/HF0711_004.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 2,
      "US 8C": 5,
      "US 9C": 3,
      "US 10C": 2,
      "US 7.5": 2,
      "US 8.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "HF0952-100",
    "name": "Nike Air Force 1 LV8 GS 'White Team Red'",
    "color": "White/Team Red/White",
    "price": 699,
    "stock": 1,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/736/204/original/HF0952_100.png.png",
    "category": "shoes",
    "shoeType": "grade_school",
    "sizes": {
      "US 5C": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "HF1553-002",
    "name": "Nike Air Zoom Vomero 5 'Dark Stucco'",
    "color": "Dark Stucco/Light Smoke Grey/Phantom",
    "price": 1099,
    "stock": 7,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/104/838/397/original/1485852_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 10C": 2,
      "US 11C": 2,
      "US 9.5": 1,
      "US 10.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "HF1553-701",
    "name": "Nike Air Zoom Vomero 5 'Alabaster Black'",
    "color": "Alabaster/Pale Ivory/Black/White/Black",
    "price": 1099,
    "stock": 86,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/110/926/500/original/1513622_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 6,
      "US 8C": 4,
      "US 9C": 5,
      "US 10C": 17,
      "US 11C": 6,
      "US 12C": 3,
      "US 13C": 5,
      "US 7.5": 9,
      "US 8.5": 6,
      "US 9.5": 11,
      "US 10.5": 14
    },
    "brand": "Nike"
  },
  {
    "sku": "HF1804-002",
    "name": "Nike GT Jump Academy EP 'Pure Platinum Glacier Blue'",
    "color": "Pure Platinum/Glacier Blue/Light Lemon Twist/Medium Ash",
    "price": 599,
    "stock": 21,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/614/original/HF1804_002.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 2,
      "US 8C": 1,
      "US 9C": 3,
      "US 10C": 1,
      "US 12C": 1,
      "US 13C": 1,
      "US 7.5": 1,
      "US 8.5": 4,
      "US 9.5": 3,
      "US 10.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "HF1985-001",
    "name": "Nike Wmns Dunk Low 'Ghost Denim'",
    "color": "Ghost/Summit White/Platinum Tint",
    "price": 799,
    "stock": 6,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/114/033/637/original/1504668_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 1,
      "US 7C": 1,
      "US 9C": 1,
      "US 8.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "HF2014-200",
    "name": "Nike Wmns Air Force 1 '07 'Mink Brown Puffy Swoosh'",
    "color": "Mink Brown/Light Khaki/Black/Mink Brown",
    "price": 849,
    "stock": 16,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/617/original/HF2014_200.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 3,
      "US 7C": 4,
      "US 8C": 2,
      "US 6.5": 2,
      "US 7.5": 3,
      "US 8.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "HF3053-100",
    "name": "Nike Wmns Air Max Portal 'White Pure Platinum'",
    "color": "White/White/Pure Platinum",
    "price": 799,
    "stock": 67,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/330/481/original/1447365_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 5C": 4,
      "US 6C": 11,
      "US 7C": 12,
      "US 8C": 12,
      "US 9C": 2,
      "US 5.5": 5,
      "US 6.5": 4,
      "US 7.5": 11,
      "US 8.5": 6
    },
    "brand": "Nike"
  },
  {
    "sku": "HF3087-103",
    "name": "Air Jordan Tatum 3 PF 'Year of the Snake'",
    "color": "Summit White/Barely Green/Football Grey",
    "price": 899,
    "stock": 8,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/113/991/119/original/1565148_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 8C": 2,
      "US 8.5": 2,
      "US 9.5": 2,
      "US 10.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "HF3136-002",
    "name": "Air Jordan Tatum 3 GS 'Zero Days Off'",
    "color": "Seafoam/Apricot Agate/Spruce Aura/Arctic Orange/Quartz Patina",
    "price": 649,
    "stock": 10,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/103/966/072/original/HF3136_002.png.png",
    "category": "shoes",
    "shoeType": "grade_school",
    "sizes": {
      "US 5C": 2,
      "US 6C": 3,
      "US 7C": 1,
      "US 4.5": 2,
      "US 5.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "HF3182-100",
    "name": "Air Jordan Wmns Jordan Legacy 312 Low 'Year of the Snake'",
    "color": "Summit White/Light Bone/Sail/Crimson Tint",
    "price": 1099,
    "stock": 46,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/384/565/original/HF3182_100.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 7,
      "US 7C": 6,
      "US 8C": 6,
      "US 9C": 3,
      "US 5.5": 4,
      "US 6.5": 6,
      "US 7.5": 6,
      "US 8.5": 8
    },
    "brand": "Nike"
  },
  {
    "sku": "HF3227-100",
    "name": "Nike Wmns LD 1000 'Summit White Black'",
    "color": "Summit White/White/Black",
    "price": 749,
    "stock": 13,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/915/743/original/HF3227_100.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 5C": 2,
      "US 6C": 4,
      "US 7C": 3,
      "US 6.5": 2,
      "US 7.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "HF5441-101",
    "name": "Nike Men's Dunk Low 'Malachite' 2025",
    "color": "White/Malachite",
    "price": 749,
    "stock": 53,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/107/691/870/original/1505927_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 2,
      "US 8C": 1,
      "US 9C": 10,
      "US 10C": 10,
      "US 11C": 3,
      "US 12C": 1,
      "US 7.5": 2,
      "US 8.5": 4,
      "US 9.5": 10,
      "US 10.5": 10
    },
    "brand": "Nike"
  },
  {
    "sku": "HF5493-201",
    "name": "Nike Air Zoom Vomero 5 'Cave Stone'",
    "color": "Cave Stone/Multi-Color/Medium Ash/Metallic Silver",
    "price": 1099,
    "stock": 91,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/102/133/563/original/HF5493_201.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 7,
      "US 8C": 7,
      "US 9C": 6,
      "US 10C": 11,
      "US 11C": 8,
      "US 12C": 4,
      "US 13C": 2,
      "US 7.5": 9,
      "US 8.5": 7,
      "US 9.5": 14,
      "US 10.5": 16
    },
    "brand": "Nike"
  },
  {
    "sku": "HJ4401-300",
    "name": "Nike Wmns Air Force 1 Low 'Jade Horizon'",
    "color": "Jade Horizon/Olive Aura/Summit White",
    "price": 849,
    "stock": 2,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/104/169/047/original/HJ4401_300.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 8C": 1,
      "US 6.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "HJ4497-001",
    "name": "Nike V2K Run 'Black Anthracite'",
    "color": "Black/Anthracite/Dark Smoke Grey",
    "price": 849,
    "stock": 28,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/101/598/287/original/1404250_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 2,
      "US 8C": 1,
      "US 9C": 2,
      "US 10C": 2,
      "US 11C": 2,
      "US 12C": 2,
      "US 13C": 2,
      "US 7.5": 3,
      "US 8.5": 3,
      "US 9.5": 6,
      "US 10.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "HJ4497-100",
    "name": "Nike Men's V2K Run 'Pure Platinum Metallic Silver'",
    "color": "Summit White/Pure Platinum/Light Iron Ore/Metallic Silver",
    "price": 849,
    "stock": 18,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/100/142/837/original/1404255_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 8C": 2,
      "US 9C": 2,
      "US 10C": 3,
      "US 11C": 2,
      "US 12C": 1,
      "US 7.5": 1,
      "US 8.5": 2,
      "US 9.5": 1,
      "US 10.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "HJ7037-100",
    "name": "Eliud Kipchoge x Nike Air Zoom Pegasus 41 'It's Just The Start'",
    "color": "White/Black/Pale Ivory/Dragon Red/Stadium Green",
    "price": 949,
    "stock": 11,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/685/008/original/1455670_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 2,
      "US 13C": 2,
      "US 7.5": 4,
      "US 9.5": 2,
      "US 10.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "HJ7038-100",
    "name": "Nike Eliud Kipchoge x Zoom Fly 6 'It's Just The Start'",
    "color": "White/Black/Pale Ivory/Sail/Stadium Green",
    "price": 999,
    "stock": 4,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/914/364/original/1504301_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 8C": 2,
      "US 13C": 1,
      "US 10.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "HJ7673-001",
    "name": "Nike Women's Dunk Low Next Nature 'Red Sepia'",
    "color": "Phantom/Red Sepia/Sail/White",
    "price": 749,
    "stock": 5,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/152/894/original/1460746_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 7C": 1,
      "US 8C": 3,
      "US 8.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "HJ7673-002",
    "name": "Nike Wmns Dunk Low Next Nature 'Vintage Green'",
    "color": "Photon Dust/Vintage Green/Sail/White",
    "price": 749,
    "stock": 4,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/199/651/original/1468744_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 9C": 1,
      "US 6.5": 1,
      "US 8.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "HJ7677-900",
    "name": "Paige Bueckers x Nike Air Zoom GT Hustle 3 EP 'Be You, Be Great!'",
    "color": "Multi-Color/Multi-Color",
    "price": 1499,
    "stock": 1,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/467/373/original/HJ7677_900.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 9.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "HJ8080-401",
    "name": "Nike Wmns Air Sunder Max 'Obsidian Grey Haze'",
    "color": "Obsidian/Black/Grey Haze",
    "price": 1299,
    "stock": 35,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/802/170/original/HJ8080_401.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 10,
      "US 7C": 10,
      "US 5.5": 3,
      "US 6.5": 9,
      "US 7.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "HM6803-103",
    "name": "Nike Vomero 18 'Geode Teal'",
    "color": "Summit White/Dusty Cactus/Geode Teal/Black",
    "price": 1099,
    "stock": 2,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/108/608/000/original/1572488_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 1,
      "US 7.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "HM6804-105",
    "name": "Nike Wmns Vomero 18 'Summit White Elemental Pink'",
    "color": "Summit White/Elemental Pink/Red Plum/Black",
    "price": 1099,
    "stock": 4,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/108/570/846/original/1572522_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 9C": 1,
      "US 6.5": 1,
      "US 7.5": 1,
      "US 8.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "HM9431-001",
    "name": "Nike Killshot 2 Leather 'College Grey Gum'",
    "color": "College Grey/Gum Medium Brown/White",
    "price": 749,
    "stock": 66,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/712/920/original/1578038_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 8C": 8,
      "US 9C": 7,
      "US 10C": 11,
      "US 11C": 6,
      "US 12C": 5,
      "US 13C": 4,
      "US 7.5": 2,
      "US 8.5": 4,
      "US 9.5": 9,
      "US 10.5": 10
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ0264-004",
    "name": "Nike Wmns ReactX Infinity Run 4 GORE-TEX 'Black White Volt'",
    "color": "Black/White/Anthracite/Volt",
    "price": 1349,
    "stock": 2,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/107/612/716/original/HQ0264_004.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6.5": 1,
      "US 8.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ0265-100",
    "name": "Nike ReactX Infinity Run 4 GORE-TEX 'Sail Total Orange Blue'",
    "color": "Sail/Thunder Blue/Total Orange",
    "price": 1349,
    "stock": 1,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/104/770/233/original/HQ0265_100.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 9C": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ0458-200",
    "name": "Nike Wmns Air Zoom Vomero 5 'Beach'",
    "color": "Beach/Light Khaki/Pale Ivory/Sail",
    "price": 1199,
    "stock": 25,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/108/135/590/original/1542573_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 8,
      "US 7C": 4,
      "US 8C": 5,
      "US 7.5": 4,
      "US 8.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ1474-200",
    "name": "Nike Wmns Air Rift Premium 'Parachute Beige'",
    "color": "Parachute Beige/Hemp",
    "price": 949,
    "stock": 12,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/107/717/830/original/HQ1474_200.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 5C": 6,
      "US 6C": 6
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ1474-201",
    "name": "Nike Wmns Air Rift Premium 'Red Sepia'",
    "color": "Red Sepia/Mink Brown",
    "price": 949,
    "stock": 25,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/110/222/823/original/1603906_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 5C": 10,
      "US 6C": 11,
      "US 7C": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ2181-006",
    "name": "Nike Wmns Zoom Vomero Roam 'Light Bone Mink Brown'",
    "color": "Light Bone/Court Purple/Gum Dark Brown/Mink Brown",
    "price": 1299,
    "stock": 36,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/110/926/364/original/1504318_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 7,
      "US 7C": 3,
      "US 8C": 7,
      "US 9C": 2,
      "US 5.5": 1,
      "US 6.5": 5,
      "US 7.5": 6,
      "US 8.5": 5
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ2181-200",
    "name": "Nike Wmns Zoom Vomero Roam 'Flax'",
    "color": "Flax/Khaki/Anthracite/University Gold/Racer Blue/Metallic Silver",
    "price": 1299,
    "stock": 38,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/475/462/original/1496387_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 6,
      "US 7C": 5,
      "US 8C": 6,
      "US 5.5": 1,
      "US 6.5": 7,
      "US 7.5": 9,
      "US 8.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ2637-600",
    "name": "Nike Ja 2 EP 'Nightmare'",
    "color": "University Red/Celestial Gold/Black/Jade Horizon",
    "price": 899,
    "stock": 2,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/033/177/original/1514896_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 8C": 1,
      "US 10C": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ3219-902",
    "name": "Nike ZoomX VaporFly Next% 3 'Multi-Color'",
    "color": "Multi-Color/Volt/Hyper Pink/Black",
    "price": 1699,
    "stock": 5,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/495/225/original/1496314_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 13C": 2,
      "US 7.5": 2,
      "US 10.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ3440-101",
    "name": "Wmns Air Jordan 1 Low SE 'Sanddrift Glacier Blue'",
    "color": "Sanddrift/Black/Muslin/Glacier Blue/Coconut Milk",
    "price": 899,
    "stock": 6,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/102/833/682/original/HQ3440_101.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 1,
      "US 11C": 1,
      "US 7.5": 2,
      "US 8.5": 1,
      "US 11.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ3441-111",
    "name": "Wmns Air Jordan 4 RM 'White Silver Glitter'",
    "color": "White/Metallic Silver",
    "price": 1149,
    "stock": 19,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/330/800/original/1472472_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 7C": 1,
      "US 8C": 5,
      "US 9C": 1,
      "US 5.5": 2,
      "US 6.5": 4,
      "US 7.5": 3,
      "US 8.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ3449-001",
    "name": "Cheung Ka Long x Nike Air Zoom Vomero 5 'Don't Lose Your Way'",
    "color": "Black/Metallic Silver/Phantom/Aegean Storm/Muslin/Team Red",
    "price": 1099,
    "stock": 15,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/317/161/original/00001_10000CKLXAZ.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 9C": 11,
      "US 5.5": 1,
      "US 9.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ3450-147",
    "name": "Nike ZoomX VaporFly Next% 3 'Wherever Whenever'",
    "color": "Sail/Volt/Pacific Moss/Glacier Blue",
    "price": 1749,
    "stock": 1,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/603/652/original/1500840_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 11C": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ3452-041",
    "name": "Nike Air Zoom Pegasus 41 'Wherever Whenever'",
    "color": "Black/Sail/Volt/Glacier Blue",
    "price": 949,
    "stock": 3,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/104/985/333/original/HQ3452_041.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 9C": 1,
      "US 6.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ3462-191",
    "name": "Nike Wmns Dunk Low LX 'Glitter Swoosh'",
    "color": "White/White/Light Smoke Grey/Multi-Color",
    "price": 849,
    "stock": 3,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/495/249/original/1497811_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6.5": 1,
      "US 8.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ3464-143",
    "name": "Nike Wmns ZoomX VaporFly Next% 3 'Wherever Whenever'",
    "color": "Sail/Olive Aura/Volt/Glacier Blue",
    "price": 1749,
    "stock": 13,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/110/290/130/original/1500879_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 1,
      "US 7C": 3,
      "US 6.5": 3,
      "US 7.5": 2,
      "US 8.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ3473-122",
    "name": "Nike Air Force 1 Low GS 'Passing Notes Pack'",
    "color": "Coconut Milk/Baroque Brown/Sesame/Seafoam",
    "price": 769,
    "stock": 5,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/104/486/617/original/HQ3473_122.png.png",
    "category": "shoes",
    "shoeType": "grade_school",
    "sizes": {
      "US 4C": 1,
      "US 3.5": 1,
      "US 4.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ3477-001",
    "name": "Nike Vomero 5 GS 'Halloween - Spider'",
    "color": "Photon Dust/Black/Vapor Green/Black",
    "price": 949,
    "stock": 3,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/330/857/original/1488997_00.png.png",
    "category": "shoes",
    "shoeType": "grade_school",
    "sizes": {
      "US 5C": 2,
      "US 5.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ3478-104",
    "name": "Nike Air Max DN 'Light Orewood Brown'",
    "color": "Light Orewood Brown/Black/Denim Turquoise/Light Orewood Brown",
    "price": 1199,
    "stock": 22,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/110/072/077/original/1491166_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 1,
      "US 8C": 3,
      "US 9C": 2,
      "US 10C": 3,
      "US 11C": 1,
      "US 12C": 1,
      "US 13C": 1,
      "US 7.5": 2,
      "US 8.5": 3,
      "US 9.5": 3,
      "US 10.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ3483-104",
    "name": "Nike Men's Dunk Low 'Light Orewood Bicoastal'",
    "color": "Light Orewood Brown/Cream Ii/Black/Bicoastal",
    "price": 799,
    "stock": 12,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/740/228/original/1486867_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 10C": 1,
      "US 11C": 1,
      "US 13C": 1,
      "US 8.5": 4,
      "US 9.5": 2,
      "US 10.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ3499-100",
    "name": "Nike Wmns Air Force 1 '07 SE 'Sail Glittery Suede'",
    "color": "White/Sail/Team Red/White",
    "price": 899,
    "stock": 5,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/052/654/original/1505885_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 1,
      "US 5.5": 1,
      "US 7.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ3500-100",
    "name": "Nike Wmns V2K Run SE 'White Black Team Red'",
    "color": "White/Black/Team Red",
    "price": 899,
    "stock": 82,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/127/281/original/1515530_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 11,
      "US 7C": 12,
      "US 8C": 15,
      "US 9C": 2,
      "US 5.5": 4,
      "US 6.5": 12,
      "US 7.5": 14,
      "US 8.5": 12
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ3502-100",
    "name": "Nike Wmns Dunk Low SE 'White Glittery Suede'",
    "color": "White/Black/Team Red",
    "price": 849,
    "stock": 2,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/064/369/original/1514428_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ3603-201",
    "name": "Air Jordan 1 Low SE 'Flax Baroque Brown'",
    "color": "Flax/Baroque Brown/Vintage Coral/Black",
    "price": 899,
    "stock": 27,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/199/653/original/1488942_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 9C": 6,
      "US 10C": 3,
      "US 8.5": 5,
      "US 9.5": 9,
      "US 10.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ3612-113",
    "name": "Nike Air Force 1 '07 LV8 'Dark Team Red Vintage Green'",
    "color": "Coconut Milk/Dark Team Red/Bronzine/Vintage Green",
    "price": 849,
    "stock": 42,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/058/770/original/HQ3612_113.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 6C": 1,
      "US 7C": 3,
      "US 8C": 9,
      "US 9C": 4,
      "US 10C": 6,
      "US 11C": 1,
      "US 12C": 1,
      "US 6.5": 2,
      "US 7.5": 1,
      "US 8.5": 2,
      "US 9.5": 10,
      "US 10.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ3613-133",
    "name": "Nike Men's Dunk Low 'Harlem Globetrotters Pack'",
    "color": "Sail/University Red/Tour Yellow/Photo Blue/White",
    "price": 849,
    "stock": 4,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/262/380/original/1486675_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 8C": 1,
      "US 13C": 1,
      "US 8.5": 1,
      "US 10.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ3639-720",
    "name": "Nike Air Force 1 '07 LV8 'Sunset Russet'",
    "color": "Sunset/Cacao Wow/Coconut Milk/Russet",
    "price": 899,
    "stock": 5,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/227/856/original/1486666_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 9C": 2,
      "US 10C": 2,
      "US 10.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ4345-300",
    "name": "Nike Wmns Sabrina 2 EP 'Oregon'",
    "color": "Apple Green/White/Yellow Strike",
    "price": 899,
    "stock": 4,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/104/931/101/original/HQ4345_300.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 9C": 2,
      "US 10C": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "HQ4987-010",
    "name": "Nike Air Force 1 Low 'Vintage Coral'",
    "color": "Black/Vintage Coral/Phantom/Pale Ivory",
    "price": 849,
    "stock": 5,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/428/196/original/1450967_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 10C": 1,
      "US 13C": 1,
      "US 9.5": 1,
      "US 10.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "HV0842-133",
    "name": "Nike Wmns Dunk Low 'Green Strike'",
    "color": "Green Strike/Sail",
    "price": 749,
    "stock": 6,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/920/679/original/1481739_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 2,
      "US 7C": 2,
      "US 8.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "HV1800-101",
    "name": "Nike Wmns Dunk Low SE 'Double Swoosh - Photon Dust'",
    "color": "White/Photon Dust/White/Metallic Silver/Anthracite",
    "price": 799,
    "stock": 1,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/107/612/725/original/HV1800_101.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 8C": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "HV4298-100",
    "name": "Air Jordan Stadium 90 GS 'Year of the Snake'",
    "color": "Summit White/Black/Photon Dust/Sail",
    "price": 799,
    "stock": 22,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/685/original/HV4298_100.png.png",
    "category": "shoes",
    "shoeType": "grade_school",
    "sizes": {
      "US 4C": 5,
      "US 5C": 4,
      "US 6C": 4,
      "US 3.5": 3,
      "US 4.5": 2,
      "US 5.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "HV4312-025",
    "name": "Nike Wmns P-6000 'Photon Dust Light Khaki'",
    "color": "Photon Dust/Light Khaki/Phantom/White",
    "price": 749,
    "stock": 4,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/107/987/505/original/HV4312_025.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 2,
      "US 7C": 1,
      "US 7.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "HV4366-072",
    "name": "Nike Men's Zoom Fly 6 Premium 'Cave Stone Blue Void'",
    "color": "Light Bone/Cave Stone/Blue Void/Burgundy Crush",
    "price": 999,
    "stock": 4,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/915/758/original/HV4366_072.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 1,
      "US 9C": 1,
      "US 12C": 1,
      "US 7.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "HV4861-600",
    "name": "Nike Wmns Air Max DN 'Elemental Pink'",
    "color": "Elemental Pink/Desert Berry/Red Stardust",
    "price": 1199,
    "stock": 56,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/110/194/915/original/1497526_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 10,
      "US 7C": 14,
      "US 8C": 8,
      "US 9C": 1,
      "US 5.5": 3,
      "US 6.5": 7,
      "US 7.5": 7,
      "US 8.5": 6
    },
    "brand": "Nike"
  },
  {
    "sku": "HV5064-002",
    "name": "Nike P-6000 GS 'Metallic Silver Gym Red'",
    "color": "Metallic Silver/Flat Silver/Cool Grey/Gym Red",
    "price": 649,
    "stock": 32,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/861/116/original/1544959_00.png.png",
    "category": "shoes",
    "shoeType": "grade_school",
    "sizes": {
      "US 4C": 3,
      "US 5C": 2,
      "US 6C": 7,
      "US 7C": 4,
      "US 3.5": 3,
      "US 4.5": 7,
      "US 5.5": 6
    },
    "brand": "Nike"
  },
  {
    "sku": "HV5161-600",
    "name": "Nike Wmns Air Zoom Structure 25 Premium 'Pink Oxford'",
    "color": "Pink Oxford/Pale Ivory/Platinum Violet/Anthracite",
    "price": 949,
    "stock": 37,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/648/321/original/HV5161_600.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 9,
      "US 7C": 6,
      "US 8C": 8,
      "US 5.5": 1,
      "US 6.5": 3,
      "US 7.5": 6,
      "US 8.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "HV5165-121",
    "name": "Nike Air Force 1 Low GS 'Valentine's Day 2025'",
    "color": "Summit White/Light Crimson/Fire Red/Pink Foam",
    "price": 699,
    "stock": 13,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/860/735/original/HV5165_121.png.png",
    "category": "shoes",
    "shoeType": "grade_school",
    "sizes": {
      "US 5C": 6,
      "US 6C": 2,
      "US 7C": 2,
      "US 5.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "HV5184-010",
    "name": "Air Jordan 4 RM 'Black Metallic'",
    "color": "Black/Fire Red/Wolf Grey/White",
    "price": 1099,
    "stock": 37,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/108/755/688/original/1550658_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 3,
      "US 8C": 5,
      "US 9C": 4,
      "US 10C": 4,
      "US 11C": 2,
      "US 13C": 1,
      "US 7.5": 4,
      "US 8.5": 5,
      "US 9.5": 5,
      "US 10.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "HV5951-100",
    "name": "Nike Zoom Vomero Roam 'Summit White'",
    "color": "Summit White/Light Bone/Light Iron Ore/Summit White",
    "price": 1299,
    "stock": 3,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/923/064/original/1514257_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 1,
      "US 13C": 1,
      "US 7.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "HV5969-003",
    "name": "Air Jordan Spizike Low 'Jade Horizon'",
    "color": "Metallic Silver/Jade Horizon/Mink Brown",
    "price": 1199,
    "stock": 53,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/840/318/original/HV5969_003.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 3,
      "US 8C": 4,
      "US 9C": 10,
      "US 10C": 8,
      "US 11C": 3,
      "US 12C": 2,
      "US 13C": 2,
      "US 7.5": 3,
      "US 8.5": 5,
      "US 9.5": 4,
      "US 10.5": 9
    },
    "brand": "Nike"
  },
  {
    "sku": "HV5976-121",
    "name": "Nike Air Zoom Structure 25 'Summit White Mink Brown'",
    "color": "Summit White/Summit White/Soft Yellow/Mink Brown",
    "price": 899,
    "stock": 65,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/108/004/707/original/HV5976_121.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 6,
      "US 8C": 9,
      "US 9C": 5,
      "US 10C": 8,
      "US 11C": 3,
      "US 12C": 7,
      "US 13C": 6,
      "US 7.5": 7,
      "US 8.5": 6,
      "US 10.5": 8
    },
    "brand": "Nike"
  },
  {
    "sku": "HV5981-120",
    "name": "Nike C1TY 'Smoke Grey Vachetta Tan'",
    "color": "Summit White/Smoke Grey/Light Smoke Grey/Vachetta Tan",
    "price": 899,
    "stock": 29,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/107/717/834/original/HV5981_120.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 2,
      "US 8C": 4,
      "US 9C": 3,
      "US 10C": 4,
      "US 11C": 1,
      "US 12C": 1,
      "US 7.5": 2,
      "US 8.5": 2,
      "US 9.5": 5,
      "US 10.5": 5
    },
    "brand": "Nike"
  },
  {
    "sku": "HV5984-001",
    "name": "Nike P-6000 'Smoke Grey Platinum Purple'",
    "color": "Smoke Grey/Tan/Platinum Purple",
    "price": 849,
    "stock": 12,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/690/original/HV5984_001.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 1,
      "US 8C": 1,
      "US 9C": 1,
      "US 10C": 2,
      "US 12C": 1,
      "US 7.5": 1,
      "US 8.5": 1,
      "US 9.5": 3,
      "US 10.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "HV5987-121",
    "name": "Nike Wmns Air Zoom Structure 25 'Magic Ember Mink Brown'",
    "color": "Sail/Magic Ember/Mink Brown",
    "price": 899,
    "stock": 13,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/691/original/HV5987_121.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 2,
      "US 7C": 3,
      "US 8C": 3,
      "US 6.5": 1,
      "US 8.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "HV6000-131",
    "name": "Nike Air Force 1 LV8 GS 'Year of the Snake'",
    "color": "Sail/Jade Horizon/Light Bone/University Red/Metallic Gold/Sail",
    "price": 769,
    "stock": 20,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/860/740/original/HV6000_131.png.png",
    "category": "shoes",
    "shoeType": "grade_school",
    "sizes": {
      "US 4C": 4,
      "US 5C": 5,
      "US 6C": 4,
      "US 7C": 3,
      "US 3.5": 2,
      "US 5.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "HV6004-111",
    "name": "Nike Force 1 Low LV8 EasyOn PS 'Year of the Snake'",
    "color": "Sail/White/Sail",
    "price": 599,
    "stock": 5,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/107/367/174/original/HV6004_111.png.png",
    "category": "shoes",
    "shoeType": "preschool",
    "sizes": {
      "US 1C": 1,
      "US 2C": 3,
      "US 13": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "HV6006-121",
    "name": "Nike Air Zoom Pegasus 41 GS 'White Mink Brown Yellow'",
    "color": "Summit White/Mink Brown/Summit White/Soft Yellow",
    "price": 699,
    "stock": 42,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/693/original/HV6006_121.png.png",
    "category": "shoes",
    "shoeType": "grade_school",
    "sizes": {
      "US 4C": 4,
      "US 5C": 7,
      "US 6C": 7,
      "US 7C": 7,
      "US 3.5": 3,
      "US 4.5": 7,
      "US 5.5": 7
    },
    "brand": "Nike"
  },
  {
    "sku": "HV6009-111",
    "name": "Nike Vomero 5 GS 'Pale Ivory Mink Brown'",
    "color": "Pale Ivory/Pale Ivory/Mink Brown/Pale Ivory",
    "price": 899,
    "stock": 31,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/629/799/original/1564919_00.png.png",
    "category": "shoes",
    "shoeType": "grade_school",
    "sizes": {
      "US 4C": 2,
      "US 5C": 8,
      "US 6C": 5,
      "US 7C": 5,
      "US 3.5": 2,
      "US 4.5": 5,
      "US 5.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "HV6349-200",
    "name": "Nike Men's Shox Ride 2 'Baroque Brown'",
    "color": "Baroque Brown/Phantom/Diffused Blue",
    "price": 1299,
    "stock": 13,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/255/633/original/1565056_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 9C": 5,
      "US 10C": 2,
      "US 9.5": 3,
      "US 10.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "HV6410-100",
    "name": "Nike Wmns Zoom Vomero Roam 'Summit White'",
    "color": "Summit White/Light Bone/Light Iron Ore/Summit White",
    "price": 1299,
    "stock": 5,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/105/369/203/original/1503145_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 1,
      "US 7C": 1,
      "US 7.5": 1,
      "US 8.5": 2
    },
    "brand": "Nike"
  },
  {
    "sku": "HV6417-001",
    "name": "Nike Wmns Air Zoom Vomero 5 'Chrome Platinum Violet'",
    "color": "Vast Grey/Metallic Silver/Platinum Violet/Taupe Grey",
    "price": 1199,
    "stock": 3,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/141/119/original/1505403_00.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 8.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "HV6528-100",
    "name": "Air Jordan Spizike Low 'Sanddrift'",
    "color": "Sanddrift/White/White/Vast Grey",
    "price": 1199,
    "stock": 39,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/700/original/HV6528_100.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 3,
      "US 8C": 3,
      "US 9C": 7,
      "US 10C": 4,
      "US 11C": 2,
      "US 12C": 2,
      "US 13C": 1,
      "US 7.5": 4,
      "US 8.5": 4,
      "US 9.5": 5,
      "US 10.5": 4
    },
    "brand": "Nike"
  },
  {
    "sku": "HV8453-100",
    "name": "Nike LeBron 22 EP 'Mogul'",
    "color": "White/Black/Metallic Gold",
    "price": 1399,
    "stock": 5,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/728/416/original/HV8453_100.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 8C": 2,
      "US 8.5": 2,
      "US 9.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "HV8456-600",
    "name": "Nike LeBron 22 EP 'I Promise'",
    "color": "Pink Foam/Photo Blue/Pinksicle/Hyper Pink/Green Strike",
    "price": 1399,
    "stock": 22,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/255/654/original/1567434_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 7C": 2,
      "US 8C": 5,
      "US 9C": 5,
      "US 13C": 1,
      "US 7.5": 1,
      "US 8.5": 5,
      "US 9.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "HV8476-300",
    "name": "Nike Air Max DN8 'Snakeskin Pack - Cargo Khaki'",
    "color": "Cargo Khaki/Cargo Khaki/Black",
    "price": 1599,
    "stock": 6,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/112/445/583/original/1586730_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 9C": 3,
      "US 9.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "HV8621-300",
    "name": "Monopoly x Nike LeBron 22 EP 'Tie-Dye'",
    "color": "Mint Foam/Cerise/Light Lemon Twist/Aquarius Blue/Persian Violet/Pink Foam",
    "price": 1599,
    "stock": 18,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/701/original/HV8621_300.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 8C": 1,
      "US 9C": 6,
      "US 10C": 4,
      "US 8.5": 2,
      "US 9.5": 4,
      "US 10.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "IB2996-010",
    "name": "Nike Pegasus Wave Premium 'NOLA'",
    "color": "Black/Metallic Gold/Anthracite/Gridiron",
    "price": 1099,
    "stock": 122,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/769/537/original/IB2996_010.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 8C": 1,
      "US 9C": 28,
      "US 10C": 26,
      "US 11C": 1,
      "US 12C": 1,
      "US 8.5": 11,
      "US 9.5": 31,
      "US 10.5": 23
    },
    "brand": "Nike"
  },
  {
    "sku": "IB3079-200",
    "name": "Nike Dunk Low 'Desert Khaki'",
    "color": "Desert Khaki/Medium Ash/Summit White",
    "price": 899,
    "stock": 8,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/053/039/original/1554819_00.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 10C": 5,
      "US 9.5": 3
    },
    "brand": "Nike"
  },
  {
    "sku": "IB6656-108",
    "name": "Nike Air Zoom Pegasus 41 'White Black Magic Ember'",
    "color": "White/Black/Magic Ember",
    "price": 949,
    "stock": 16,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/109/440/714/original/IB6656_108.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 8C": 1,
      "US 9C": 2,
      "US 10C": 1,
      "US 9.5": 1,
      "US 10.5": 11
    },
    "brand": "Nike"
  },
  {
    "sku": "IB7251-002",
    "name": "Nike Ja 2 GS 'Tree Top'",
    "color": "Light Silver/Iron Grey/Metallic Gold",
    "price": 669,
    "stock": 3,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/113/642/010/original/1544904_00.png.png",
    "category": "shoes",
    "shoeType": "grade_school",
    "sizes": {
      "US 4C": 1,
      "US 5C": 1,
      "US 4.5": 1
    },
    "brand": "Nike"
  },
  {
    "sku": "IF0667-001",
    "name": "Nike Field General 82 'Snakeskin Pack - Dark Grey'",
    "color": "Dark Grey/Sail/Black/Multi-Color",
    "price": 799,
    "stock": 115,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/840/326/original/IF0667_001.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 8C": 4,
      "US 9C": 26,
      "US 10C": 22,
      "US 11C": 5,
      "US 12C": 2,
      "US 8.5": 11,
      "US 9.5": 24,
      "US 10.5": 21
    },
    "brand": "Nike"
  },
  {
    "sku": "IF0667-200",
    "name": "Nike Field General 82 'Snakeskin Pack - Light British Tan'",
    "color": "Light British Tan/Sail/Black/Multi-Color",
    "price": 799,
    "stock": 118,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/840/329/original/IF0667_200.png.png",
    "category": "shoes",
    "shoeType": "adult",
    "sizes": {
      "US 8C": 6,
      "US 9C": 23,
      "US 10C": 28,
      "US 11C": 4,
      "US 12C": 2,
      "US 8.5": 12,
      "US 9.5": 22,
      "US 10.5": 21
    },
    "brand": "Nike"
  },
  {
    "sku": "IH0821-679",
    "name": "Nike Wmns Dunk Low 'Mint Chocolate'",
    "color": "Pearl Pink/Gum Light Brown/Mint Foam/Alabaster",
    "price": 799,
    "stock": 2,
    "imageUrl": "https://image.goat.com/750/attachments/product_template_pictures/images/106/082/726/original/IH0821_679.png.png",
    "category": "shoes",
    "shoeType": "womens",
    "sizes": {
      "US 6C": 2
    },
    "brand": "Nike"
  }
];

async function main() {
  console.log('Seeding Nike products...');
  
  let created = 0;
  let skipped = 0;
  
  for (const p of products) {
    try {
      const existing = await prisma.product.findFirst({
        where: { sku: p.sku }
      });
      
      if (existing) {
        skipped++;
        continue;
      }
      
      await prisma.product.create({
        data: {
          title: p.name,
          sku: p.sku,
          brand: p.brand,
          price: p.price,
          stock: p.stock,
          imageUrl: p.imageUrl || null,
          images: p.imageUrl ? [p.imageUrl] : [],
          sizes: p.sizes,
          category: p.category || 'shoes',
          color: p.color || null,
          shoeType: p.shoeType || 'adult',
        }
      });
      created++;
    } catch (e) {
      console.error('Error with ' + p.sku + ': ' + e.message);
    }
  }
  
  console.log('Created: ' + created);
  console.log('Skipped: ' + skipped);
  console.log('Total: ' + (created + skipped));
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
