const csvData = `
Level,Color,PV,Black,Blue,Green,Red,White
1,Black,0,0,1,1,1,1
1,Black,0,0,2,1,1,1
1,Black,0,0,2,0,1,2
1,Black,0,1,0,1,3,0
1,Black,0,0,0,2,1,0
1,Black,0,0,0,2,0,2
1,Black,0,0,0,3,0,0
1,Black,1,0,4,0,0,0
1,Blue,0,1,0,1,1,1
1,Blue,0,1,0,1,2,1
1,Blue,0,0,0,2,2,1
1,Blue,0,0,1,3,1,0
1,Blue,0,2,0,0,0,1
1,Blue,0,2,0,2,0,0
1,Blue,0,3,0,0,0,0
1,Blue,1,0,0,0,4,0
1,White,0,1,1,1,1,0
1,White,0,1,1,2,1,0
1,White,0,1,2,2,0,0
1,White,0,1,1,0,0,3
1,White,0,1,0,0,2,0
1,White,0,2,2,0,0,0
1,White,0,0,3,0,0,0
1,White,1,0,0,4,0,0
1,Green,0,1,1,0,1,1
1,Green,0,2,1,0,1,1
1,Green,0,2,1,0,2,0
1,Green,0,0,3,1,0,1
1,Green,0,0,1,0,0,2
1,Green,0,0,2,0,2,0
1,Green,0,0,0,0,3,0
1,Green,1,4,0,0,0,0
1,Red,0,1,1,1,0,1
1,Red,0,1,1,1,0,2
1,Red,0,2,0,1,0,2
1,Red,0,3,0,0,1,1
1,Red,0,0,2,1,0,0
1,Red,0,0,0,0,2,2
1,Red,0,0,0,0,0,3
1,Red,1,0,0,0,0,4
2,Black,1,0,2,2,0,3
2,Black,1,2,0,3,0,3
2,Black,2,0,1,4,2,0
2,Black,2,0,0,5,3,0
2,Black,2,0,0,0,0,5
2,Black,3,6,0,0,0,0
2,Blue,1,0,2,2,3,0
2,Blue,1,3,2,3,0,0
2,Blue,2,0,3,0,0,5
2,Blue,2,4,0,0,1,2
2,Blue,2,0,5,0,0,0
2,Blue,3,0,6,0,0,0
2,White,1,2,0,3,2,0
2,White,1,0,3,0,3,2
2,White,2,2,0,1,4,0
2,White,2,3,0,0,5,0
2,White,2,0,0,0,5,0
2,White,3,0,0,0,0,6
2,Green,1,0,0,2,3,3
2,Green,1,2,3,0,0,2
2,Green,2,1,2,0,0,4
2,Green,2,0,5,3,0,0
2,Green,2,0,0,5,0,0
2,Green,3,0,0,6,0,0
2,Red,1,3,0,0,2,2
2,Red,1,3,3,0,2,0
2,Red,2,0,4,2,0,1
2,Red,2,5,0,0,0,3
2,Red,2,5,0,0,0,0
2,Red,3,0,0,0,6,0
3,Black,3,0,3,5,3,3
3,Black,4,0,0,0,7,0
3,Black,4,3,0,3,6,0
3,Black,5,3,0,0,7,0
3,Blue,3,5,0,3,3,3
3,Blue,4,0,0,0,0,7
3,Blue,4,3,3,0,0,6
3,Blue,5,0,3,0,0,7
3,White,3,3,3,3,5,0
3,White,4,7,0,0,0,0
3,White,4,6,0,0,3,3
3,White,5,7,0,0,0,3
3,Green,3,3,3,0,3,5
3,Green,4,0,7,0,0,0
3,Green,4,0,6,3,0,3
3,Green,5,0,7,3,0,0
3,Red,3,3,5,3,0,3
3,Red,4,0,0,7,0,0
3,Red,4,0,3,6,3,0
3,Red,5,0,0,7,3,0
`;
class noble {
    constructor(PV,black,blue,green,red,white){
        this.PV = PV
        this.Black = black
        this.Blue = blue
        this.Green = green
        this.Red = red
        this.White = white
    }
}
const nobleObjects = [
    new noble(3,0,3,3,3,0),
    new noble(3,4,0,0,0,4),
    new noble(3,3,0,3,3,0),
    new noble(3,0,0,3,3,0),
    new noble(3,0,3,3,0,3),
    new noble(3,3,3,0,0,3),
    new noble(3,0,4,4,0,0),
    new noble(3,4,0,0,4,0),
    new noble(3,0,4,0,0,4),
    new noble(3,0,0,4,4,0),
];
// Splitting the CSV data into rows
const rows = csvData.trim().split('\n').map(row => row.split(','));

// Extracting headers
const headers = rows.shift();

// Creating arrays to store objects for each level
const level1Objects = [];
const level2Objects = [];
const level3Objects = [];

// Iterating over each row to create objects for each level
rows.forEach(row => {
    const level = parseInt(row[0]);
    const color = row[1];
    const pv = parseInt(row[2]);
    const black = parseInt(row[3]);
    const blue = parseInt(row[4]);
    const green = parseInt(row[5]);
    const red = parseInt(row[6]);
    const white = parseInt(row[7]);

    // Creating the object
    const obj = {
        Color: color,
        PV: pv,
        Black: black,
        Blue: blue,
        Green: green,
        Red: red,
        White: white
    };

    // Adding the object to the corresponding array based on the level
    switch (level) {
        case 1:
            level1Objects.push(obj);
            break;
        case 2:
            level2Objects.push(obj);
            break;
        case 3:
            level3Objects.push(obj);
            break;
        default:
            break;
    }
});

console.log("Level 1 Objects:");
console.log(level1Objects);

console.log("\nLevel 2 Objects:");
console.log(level2Objects);

console.log("\nLevel 3 Objects:");
console.log(level3Objects);

console.log("\nNoble Objects:");
console.log(nobleObjects);

const shipIt = {level1Objects,level2Objects,level3Objects,nobleObjects};

export default shipIt;