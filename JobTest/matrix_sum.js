console.log('===== Job: Matrix Addition (30x30) =====');

const size = 30;

// Create Matrix A
const A = [];

for (let i = 0; i < size; i++) {
    const row = [];

    for (let j = 0; j < size; j++) {
        const randomNumber = Math.floor(Math.random() * 10) + 1;
        row.push(randomNumber);
    }

    A.push(row);
}


// Create Matrix B
const B = [];

for (let i = 0; i < size; i++) {
    const row = [];

    for (let j = 0; j < size; j++) {
        const randomNumber = Math.floor(Math.random() * 10) + 1;
        row.push(randomNumber);
    }

    B.push(row);
}


// Print Matrix A
console.log('\n===== Matrix A =====');

for (const row of A) {
    console.log(
        row.map(number => String(number).padStart(3, ' ')).join('')
    );
}


// Print Matrix B
console.log('\n===== Matrix B =====');

for (const row of B) {
    console.log(
        row.map(number => String(number).padStart(3, ' ')).join('')
    );
}


// Calculate Matrix C = A + B
const C = [];

for (let i = 0; i < size; i++) {
    const row = [];

    for (let j = 0; j < size; j++) {
        row.push(A[i][j] + B[i][j]);
    }

    C.push(row);
}


// Print Matrix C
console.log('\n===== Matrix A + B =====');

for (const row of C) {
    console.log(
        row.map(number => String(number).padStart(3, ' ')).join('')
    );
}


console.log('\nJob Completed Successfully.');