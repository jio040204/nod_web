const { oddNum, evenNum } = require("./var");
const checkOddorEven = require('./func');

function checkStringOddorEven(str){
    if(str.length % 2){
        return oddNum;
    }
    return evenNum;
}

console.log(checkOddorEven(10)); // 짝수
console.log(checkStringOddorEven('hello'));  //홀수