console.log('===== Job: Random Numbers =====');

const numbers = [];

for (let i = 0; i < 30; i++) {
    const randomNumber = Math.floor(Math.random() * 20) + 1;
    numbers.push(randomNumber);
}

console.log('\nGenerated Numbers:');
console.log(numbers.join(', '));

let product = 1n;

for (const n of numbers) {
    product *= BigInt(n);
}

console.log('\nProduct:');
console.log(product.toString());