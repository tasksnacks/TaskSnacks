// rewards.js
// Big "reward engine" for TaskSnacks.
// Exposes: window.TaskSnacksRewards.getRandomReward()

(function () {
  // --- FUN FACTS ---
  const funFacts = [
    "Sea otters hold hands while sleeping so they don't drift apart.",
    "Cows have best friends and get stressed when separated.",
    "Your brain uses about 20% of your body's energy, even at rest.",
    "Ravens can remember human faces and hold grudges.",
    "Sloths can hold their breath longer than dolphins.",
    "Sharks existed before trees appeared on Earth.",
    "Wombats produce cube-shaped poop to mark territory.",
    "Koalas sleep up to 22 hours a day.",
    "A group of flamingos is called a flamboyance.",
    "Honey never spoils; archaeologists found edible honey in ancient tombs.",
    "Octopuses have three hearts and blue blood.",
    "Bananas are berries, but strawberries are not.",
    "There are more stars in the universe than grains of sand on Earth.",
    "Some turtles can breathe through their butts (cloacal respiration).",
    "A day on Venus is longer than a year on Venus.",
    "Caterpillars completely liquefy inside the cocoon before becoming butterflies.",
    "Rabbits can't vomit.",
    "Your taste buds are replaced about every 2 weeks.",
    "Pigeons can recognize themselves in a mirror.",
    "The Eiffel Tower can be 15 cm taller in the summer due to heat expansion.",
    "Crows can hold grudges against specific humans.",
    "Cats have a special reflective layer in their eyes called the tapetum lucidum that helps them see better in low light.",
    "Hedgehogs can have over 5,000 spines on their backs.",
    "Goldfish have a memory longer than three seconds; they can actually remember things for months.",
    "Human noses can distinguish at least 1 trillion different smells.",
    "Koalas have fingerprints almost indistinguishable from humans under a microscope.",
    "Penguins propose to their mates with a pebble.",
    "Some plants can 'talk' to each other using chemical signals through their roots.",
    "Owls can rotate their heads up to 270 degrees.",
    "The heart of a blue whale can weigh as much as a small car.",
    "Butterflies taste with their feet.",
    "There’s a species of jellyfish that can technically live forever (Turritopsis dohrnii).",
    "Bees can recognize human faces.",
    "A group of porcupines is called a prickle.",
    "The shortest war in history lasted about 38 minutes (Anglo-Zanzibar War).",
    "A cloud can weigh more than a million kilograms.",
    "Some frogs can freeze solid in winter and thaw back to life in spring.",
    "Hippos’ sweat acts as natural sunscreen.",
    "Giraffes have the same number of neck vertebrae as humans: seven.",
    "Starfish can regenerate lost arms; some can regenerate a whole body from one arm.",
    "Coconut water can be used as emergency blood plasma.",
    "Dolphins each have a unique whistle that functions like a name.",
    "Goats have rectangular pupils, giving them a very wide field of vision.",
    "Dragonflies can fly in any direction and hover like little helicopters.",
    "A group of crows is called a murder.",
    "Some snakes can glide through the air by flattening their bodies.",
    "Ants don’t have lungs; they breathe through tiny holes in their bodies called spiracles.",
    "Lightning can heat the air to temperatures hotter than the surface of the sun.",
    "There are more possible ways to shuffle a deck of cards than atoms on Earth.",
    "Tomatoes were once considered poisonous in parts of Europe.",
    "Raccoons wash their food in water when given the chance, even if it doesn’t need washing."
  ];

  // --- AFFIRMATIONS ---
  const affirmations = [
    "You’re doing better than you think.",
    "Tiny progress still counts as progress.",
    "Your future self is grateful for this.",
    "You don’t need to be perfect to be effective.",
    "You turned chaos into movement. That’s huge.",
    "You showed up. That’s the hardest part.",
    "Your brain is allowed to be messy. Your tasks don’t have to be.",
    "You made something real out of mental noise. That’s magic.",
    "You get to be both a work in progress and someone worth celebrating.",
    "Rest is not a reward; it’s part of the process.",
    "You don’t have to do everything, just the next thing.",
    "You are learning how you work best. That’s powerful.",
    "Your pace is your pace. It’s still forward.",
    "You gently proved your brain wrong about ‘I’ll never do this.’",
    "Even if today was messy, you still created momentum.",
    "You are allowed to be proud of small, quiet wins.",
    "You don’t need a perfect system; you just need one step.",
    "You chose action over avoidance. That’s brave.",
    "You are slowly building a future where this feels easier.",
    "You navigated your own brain today. That’s not easy.",
    "You are showing up for yourself in a very real way.",
    "Your value is not measured in completed tasks, but this still matters.",
    "You are allowed to try again tomorrow without shame.",
    "You balanced your energy and effort. That’s smart, not lazy.",
    "You just proved that future-you can trust present-you.",
    "You’re quietly rewriting your story about ‘I never follow through.’",
    "You’re not behind; you’re just on your path.",
    "You created a little island of order inside your chaos.",
    "You’re making it easier for tomorrow’s version of you.",
    "You honored your attention instead of fighting it.",
    "You’re doing real emotional work every time you complete a task.",
    "You’re building a life where your brain feels more safe and less overwhelmed.",
    "You don’t have to earn rest by suffering; this was enough.",
    "You just did something past-you was procrastinating on. Legendary.",
    "Somewhere in the background, your nervous system is quietly exhaling.",
    "Today you were your own ally instead of your own critic."
  ];

  // --- ASCII ANIMALS / FRIENDS ---
  const asciiAnimals = [
    {
      title: "Tiny cat",
      ascii: String.raw` /\_/\
( o.o )
 > ^ <`
    },
    {
      title: "Sleepy snail",
      ascii: String.raw`  __
 /o \_____
 \__/-="="`
    },
    {
      title: "Little duck",
      ascii: String.raw`  _
<(o )
 (   )
  " "`
    },
    {
      title: "Chill whale",
      ascii: String.raw`      __
 ____/  \___
(____    ___)
     \__/`
    },
    {
      title: "Happy dog",
      ascii: String.raw` / \__
(    @\___
 /         O
/   (_____/
/_____/   U`
    },
    {
      title: "Tiny bear",
      ascii: String.raw`ʕ•ᴥ•ʔ`
    },
    {
      title: "Cheerful bunny",
      ascii: String.raw` (\_/)
 ( •_•)
 / >🍪`
    },
    {
      title: "Baby dragon",
      ascii: String.raw`   / \__
  (    @\___
  /         \
 /  (_____/
/_____/   U`
    },
    {
      title: "Minimal frog",
      ascii: String.raw`  @..@
 (____)
 (____)
  ^^  ^^`
    },
    {
      title: "Tiny owl",
      ascii: String.raw`  ,_, 
 (O,O)
 (   )
  " "`
    },
    {
      title: "Cute seal",
      ascii: String.raw`   __
 _(  )_
(      )___
 (________)`
    },
    {
      title: "Tiny fox",
      ascii: String.raw` /\   /\
(  o o  )
 (  =  )
  (___)`
    },
    {
      title: "Excited hamster",
      ascii: String.raw`  (\_/)
 ( '.' )
 (")_(")`
    },
    {
      title: "Baby penguin",
      ascii: String.raw`   _
 ('v')
 /   \
(_____)`
    },
    {
      title: "Smol hedgehog",
      ascii: String.raw`  ,-"-.
 /     \
| 0   0 |
\  .-. /
 '---'`
    },
    {
      title: "Chill turtle",
      ascii: String.raw`   ____  
 _/    \_
/  o  o  \
\   --   /
 \______/`
    },
    {
      title: "Tiny mouse",
      ascii: String.raw` ()_()
( ' .')
(  > )`
    },
    {
      title: "Little crab",
      ascii: String.raw`  (\__/)
  ( •-•)
  /    \
 /______\`
    },
    {
      title: "Happy jellyfish",
      ascii: String.raw`   .-.
  (   ).
 (___(__)
  /  /  \
  ~  ~   ~`
    },
    {
      title: "Supportive blob",
      ascii: String.raw`  _____
 (     )
 ( •_• )
 (_____)`
    }
  ];

  // --- HELPERS ---
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function makeFunFactReward() {
    const fact = pick(funFacts);
    return {
      type: "fact",
      title: "Fun fact",
      body: fact,
      inlineText: `🎉 Fun fact: ${fact}`,
      confetti: true
    };
  }

  function makeAffirmationReward() {
    const text = pick(affirmations);
    return {
      type: "affirmation",
      title: "Nice work",
      body: text,
      inlineText: `✅ ${text}`,
      confetti: true
    };
  }

  function makeAsciiReward() {
    const animal = pick(asciiAnimals);
    return {
      type: "ascii",
      title: animal.title,
      body: "A tiny friend appears to celebrate:",
      ascii: animal.ascii,
      inlineText: `🐾 A tiny ${animal.title.toLowerCase()} came to say: well done.`,
      confetti: Math.random() < 0.5 // sometimes skip confetti so it feels varied
    };
  }

  function getRandomReward() {
    // Weighted a bit towards affirmations + fun facts
    const pool = [
      makeFunFactReward,
      makeFunFactReward,
      makeAffirmationReward,
      makeAffirmationReward,
      makeAsciiReward
    ];
    const gen = pick(pool);
    return gen();
  }

  window.TaskSnacksRewards = {
    getRandomReward
  };
})();
