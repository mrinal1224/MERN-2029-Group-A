const fs = require('fs')

console.log("hello")


fs.readFile('f1.txt' , (err , data)=>{

    if(err){
        console.log(err)
    }

    console.log("F1 Data -> " + data)
})




console.log('Byeee')