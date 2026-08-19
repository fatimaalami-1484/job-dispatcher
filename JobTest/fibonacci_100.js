console.log('===== Job: Fibonacci (100 Numbers) =====');

let a = 0n;
let b = 1n;

for (let i = 1; i <= 100; i++) {

    console.log(`${String(i).padStart(3, ' ')}. ${a}`);

    const next = a + b;
    a = b;
    b = next;
}

await new Promise(resolve => setTimeout(resolve, 1000));

console.log('\nJob Completed Successfully.');