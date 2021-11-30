const {oddNum, evenNum} = require('./var');

function checkOddorEven(num){
    if(num%2){
        return oddNum;
    }
    return evenNum;
}
module.exports = checkOddorEven;