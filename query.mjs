import { prisma } from './lib/prisma.js';

const [types,cats,colors,sizes,prices] = await Promise.all([
  prisma.product.findMany({where:{active:true},select:{shoeType:true},distinct:['shoeType']}),
  prisma.product.findMany({where:{active:true},select:{category:true},distinct:['category']}),
  prisma.product.findMany({where:{active:true},select:{color:true},distinct:['color']}),
  prisma.product.findMany({where:{active:true},take:3,select:{sizes:true}}),
  prisma.$queryRaw`SELECT MIN(price) as min, MAX(price) as max FROM "Product" WHERE active=true`
]);

console.log(JSON.stringify({
  shoeTypes: types.map(x=>x.shoeType),
  categories: cats.map(x=>x.category),
  colors: colors.map(x=>x.color),
  sizesSample: sizes,
  priceRange: prices
},null,2));

await prisma.$disconnect();
