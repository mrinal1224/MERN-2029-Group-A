// File System Module
const fs = require('fs');


// Read File
const data = fs.readFileSync('f1.txt')

// Write a File

// fs.writeFileSync('f2.txt' , 'I am data from F3')


// How to updata a file

// fs.appendFileSync('f2.txt' , ' Extended Data')

// Delete a file

fs.unlinkSync('f3.txt')

console.log("F3 deleted")

