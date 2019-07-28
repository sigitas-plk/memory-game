export const shuffleArray = arr => arr.reduce(
    (newArr, _, i) => {
        var rand = (Math.floor(Math.random() * (newArr.length - i))) + i;
        [newArr[rand], newArr[i]] = [newArr[i], newArr[rand]]
        return newArr
    }, [...arr]
)