const citizens = [];

// 1. Group names by gender
const maleFirstNames = ["Abel", "Mohamed", "Ali", "Samuel", "Henok"];
const femaleFirstNames = ["Bontu", "Selam", "Liya", "Mulu", "Meron"];

const fatherNames = ["Kebede", "Abebe", "Bekele", "Mohamed", "Tesfaye", "Haile", "Samuel", "Yonas", "Ali", "Solomon"];
const grandFatherNames = ["Ali", "Bekele", "Worku", "Mohamed", "Kebede", "Abate", "Mulugeta", "Hailu", "Tesfaye", "Yohannes"];

for (let i = 1; i <= 100; i++) {
  // 2. Determine gender first (e.g., even/odd or Math.random)
  const isFemale = i % 2 === 0;
  const gender = isFemale ? "Female" : "Male";

  // 3. Pick the name from the corresponding gender array
  const namePool = isFemale ? femaleFirstNames : maleFirstNames;
  const firstName = namePool[i % namePool.length];

  citizens.push({
    faydaId: (100000000000 + i).toString(),
    firstName,
    fatherName: fatherNames[i % fatherNames.length],
    grandfatherName: grandFatherNames[i % grandFatherNames.length],
    gender,
    dob: new Date(1995 + (i % 11), i % 12, (i % 28) + 1),
    phoneNumber: `09${(10000000 + i).toString()}`,
  });
}

export default citizens;