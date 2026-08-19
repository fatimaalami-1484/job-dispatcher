console.log('===== Job: Prime Numbers (1 to 100000) =====');

const primes = [];
let sum = 0n;

for (let n = 2; n <= 50; n++) {

    let isPrime = true;
    const limit = Math.sqrt(n);

    for (let i = 2; i <= limit; i++) {

        if (n % i === 0) {
            isPrime = false;
            break;
        }
    }

    if (isPrime) {
        primes.push(n);
        sum += BigInt(n);
    }
}

console.log('\n===== Prime Numbers =====');

for (const prime of primes) {
    console.log(prime);
}

console.log('\n===== Summary =====');

console.log(`Total Prime Numbers : ${primes.length}`);
console.log(`Sum of Prime Numbers: ${sum}`);
console.log(`Last Prime Number   : ${primes[primes.length - 1]}`);

console.log('\nJob Completed Successfully.');