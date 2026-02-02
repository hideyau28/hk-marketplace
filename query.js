const { PrismaClient } = require('./node_modules/@prisma/client');
const p = new PrismaClient();
async function main() {
  const [types,cats,colors,sizes,prices] = await Promise.all([
    p.product.findMany({where:{active:true},select:{shoeType:true},distinct:['shoeType']}),
    p.product.findMany({where:{active:true},select:{category:true},distinct:['category']}),
    p.product.findMany({where:{active:true},select:{color:true},distinct:['color']}),
    p.product.findMany({where:{active:true},take:3,select:{sizes:true}}),
    p.$queryRaw`SELECT MIN(price) as min, MAX(price) as max FROM "Product" WHERE active=true`
  ]);
  console.log(JSON.stringify({
    shoeTypes: types.map(x=>x.shoeType),
    categories: cats.map(x=>x.category),
    colors: colors.map(x=>x.color),
    sizesSample: sizes,
    priceRange: prices
  },null,2));
}
main().finally(()=>p.$disconnect());
