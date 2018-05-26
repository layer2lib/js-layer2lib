const { RandomPieceGenerator, MergedRandomGenerator } = require('../src/random.js');

function testPieceGenerator() {
  console.log('Test Piece Generator\n')
  const length = 5;
  const aliceSeed = 'alice_seed';
  const aliceRandom = new RandomPieceGenerator(aliceSeed, length);
  console.log(`Alice Hashes: ${aliceRandom.hashes}\n`);

  for(let i = length; i >= 0; i--) {
    const alicePreimage = aliceRandom.getNextRandom();
    console.log(`Alice's Next Random: ${alicePreimage}`);
  }

  console.log();
}

function testMergedGenerator() {
  console.log('Test Merged Generator\n');
  const length = 5;
  const aliceSeed = 'alice_seed';
  const bobSeed = 'bob_seed';

  const aliceRandom = new RandomPieceGenerator(aliceSeed, length);
  const bobRandom = new RandomPieceGenerator(bobSeed, length);

  console.log(`Alice Hashes: ${aliceRandom.hashes}\n`);
  console.log(`Bob Hashes: ${bobRandom.hashes}\n`);

  const randomGenerator = new MergedRandomGenerator(aliceRandom.getNextRandom(), bobRandom.getNextRandom());
  const startingRandom = randomGenerator.getCurrentRandom();
  console.log(`Starting Random: ${startingRandom}\n`);

  for(let i = length - 1; i >= 0; i--) {
    console.log(`Round ${length - i}`);
    const alicePreimage = aliceRandom.getNextRandom();
    const bobPreimage = bobRandom.getNextRandom();
    console.log(`Alice's Next Preimage: ${alicePreimage}`);
    console.log(`Bob's Next Preimage: ${bobPreimage}`);

    const nextRandom = randomGenerator.getNextRandom(alicePreimage, bobPreimage);

    console.log(`Next Random: ${nextRandom.modulo(100)}\n`);
  }

}

testPieceGenerator();
testMergedGenerator();
//TODO: Test failure/malicious scenarios
