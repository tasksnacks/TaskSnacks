// === CONFIG ===
const workerUrl = "https://tasksnacks.hikarufujiart.workers.dev/"; // your Worker URL

// Supabase config
const supabaseUrl = "https://fxexewdnbmiybbutcnyv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4ZXhld2RuYm1peWJidXRjbnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTA2MjQsImV4cCI6MjA3OTEyNjYyNH0.E_UQHGX4zeLUajwMIlTRchsCMnr99__cDESOHflp8cc";

// Supabase client
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Fun facts (local only to avoid API cost)
const funFacts = [
  "Sea otters hold hands while sleeping so they don't drift apart.",
  "Cows have best friends and get stressed when separated.",
  export const funFacts = [
  "Octopuses have three hearts and blue blood, because their blood uses copper instead of iron to carry oxygen.",
  "Bananas are berries, but strawberries are not according to botanical definitions.",
  "Honey found in 3,000-year-old Egyptian tombs was still edible thanks to honey’s low water content and acidity.",
  "Crows can remember human faces and hold grudges against people who treated them badly.",
  "Sloths can hold their breath longer than dolphins—up to 40 minutes—by slowing their heartbeat.",
  "Sharks existed before trees; sharks are over 400 million years old, while trees appeared around 350 million years ago.",
  "Wombat poop is cube-shaped, which helps keep it from rolling away and is used to mark territory.",
  "Sea otters hold hands while sleeping so they don’t float away from each other.",
  "There are more possible ways to shuffle a deck of cards than there are atoms on Earth.",
  "A day on Venus is longer than a year on Venus because it rotates very slowly on its axis.",
  "Jellyfish have existed for at least 500 million years, predating dinosaurs and even trees.",
  "Orcas have regional ‘dialects’—their calls differ between pods like accents in human language.",
  "Some turtles can breathe through their butts by absorbing oxygen through blood vessels in their cloaca.",
  "There’s a species of immortal jellyfish (Turritopsis dohrnii) that can revert to its juvenile form instead of dying.",
  "Koalas’ fingerprints are so similar to humans’ that they can confuse crime scene investigators.",
  "Pigeons can recognize themselves in a mirror, which is considered a sign of self-awareness.",
  "Cats can’t taste sweetness because they lack the receptors for sweet flavors.",
  "A group of flamingos is called a ‘flamboyance’.",
  "An ostrich’s eye is bigger than its brain.",
  "Cows have best friends and can become stressed when they are separated.",
  "Bees can be trained to detect explosives and even certain diseases by their sense of smell.",
  "Penguins propose to their mates with a pebble, offering it like a tiny engagement gift.",
  "Some frogs can freeze solid in winter and thaw out in spring and continue living.",
  "Elephants can recognize themselves in mirrors and grieve for their dead.",
  "Rats “laugh” when tickled; they make ultrasonic chirps associated with positive emotion.",
  "Goldfish have a longer attention span than the average human scrolling social media.",
  "The word ‘emoji’ comes from Japanese and is unrelated to ‘emotion’; it means ‘picture character’.",
  "High-fiving someone with your eyes closed makes it much more likely you’ll miss; your brain relies heavily on visual feedback.",
  "Yawning is contagious, and you’re more likely to ‘catch’ a yawn from someone you emotionally care about.",
  "People tend to walk faster when alone in a city but slower when walking with someone they like.",
  "Most people tilt their head to the right when kissing, a bias found across many cultures.",
  "You’re more likely to remember the first and last things on a list; this is called the serial position effect.",
  "Our brains automatically synchronize a bit with the people around us, including copying posture and speech patterns.",
  "Humans share about 50% of their DNA with bananas—not that we’re half banana, just that basic life chemistry is very reused.",
  "Hearing your own name activates unique regions of your brain that don’t respond the same way to other words.",
  "The placebo effect can still work even when people are told they’re taking a placebo.",
  "Your brain rewrites memories each time you recall them, which is why memories can slowly change over time.",
  "Most people have a dominant eye just like they have a dominant hand.",
  "People physically feel colder when they are lonely, according to multiple psychology studies.",
  "Blue is the rarest natural eye color, genetically speaking, and is caused by light scattering rather than blue pigment.",
  "The Eiffel Tower can grow about 15 cm taller in summer due to thermal expansion of the metal.",
  "In some parts of the world, your ‘birthday’ is culturally less important than your ‘name day’.",
  "Ancient Romans cleaned their teeth with urine because ammonia is a powerful cleaning agent.",
  "In Japan, black cats are considered good luck rather than bad luck as in many Western cultures.",
  "Superstitions often persist because of ‘confirmation bias’—we notice the hits and ignore the misses.",
  "The phrase ‘it’s raining cats and dogs’ may come from old roofs where animals sometimes fell during storms.",
  "In South Korea, it’s common for couples to wear matching outfits in public.",
  "There’s a town in Norway where it’s illegal to die because the cemetery is full and the ground is too frozen for new burials.",
  "McDonald’s once made bubblegum-flavored broccoli as a children’s menu experiment; kids were just confused by it.",
  "In medieval Europe, animals could be put on trial and sometimes sentenced for ‘crimes’.",
  "In Victorian England, it was fashionable to photograph the dead as if they were alive, called post-mortem photography.",
  "Some languages, like Guugu Yimithirr in Australia, use compass directions instead of left/right, so people are always mentally oriented.",
  "There are over 7,000 languages spoken in the world, but over half are at risk of disappearing.",
  "The Mongol Empire once stretched over about 16% of the Earth’s total land area.",
  "Cleopatra lived closer in time to the invention of the iPhone than to the building of the Great Pyramid of Giza.",
  "Oxford University is older than the Aztec Empire.",
  "In ancient Rome, purple dye was so expensive that only the very rich and powerful could wear it.",
  "During the Middle Ages, some European villages used giant wheels of cheese as dowries in marriage.",
  "For centuries, people thought tomatoes were poisonous in Europe because aristocrats ate them on pewter plates that leached lead.",
  "Medieval doctors sometimes diagnosed patients by tasting their urine.",
  "The Great Wall of China is not visible from space with the naked eye, contrary to a popular myth.",
  "The city of Istanbul has been officially known by at least three major names: Byzantium, Constantinople, and Istanbul.",
  "In the 19th century, many people believed riding a train at high speeds could cause brain damage.",
  "History’s shortest war is often considered the Anglo-Zanzibar War of 1896, which lasted around 38–45 minutes.",
  "Ancient Egyptians used moldy bread on wounds, accidentally harnessing the antibiotic power of mold long before penicillin.",
  "For a long time, sailors thought the ocean was full of giant sea monsters because of misidentified whales and squids.",
  "Before alarm clocks, ‘knocker-uppers’ would tap on windows with sticks to wake people up for work.",
  "In the 1800s, many people thought electricity could resurrect the dead, inspiring Frankenstein-style experiments.",
  "Roman concrete has survived for millennia and is often more durable than many modern concretes.",
  "The term ‘computer’ originally referred to people whose job was to do calculations by hand.",
  "The first ‘mouse’ for computers was made of wood.",
  "The first ever VCR in the 1950s was about the size of a piano.",
  "Wi-Fi doesn’t stand for anything scientific; it was just a catchy brand name inspired by ‘Hi-Fi’.",
  "The QWERTY keyboard layout was designed partly to slow typists down and reduce jamming on early typewriters.",
  "NASA’s Apollo guidance computer had less processing power than a modern smartphone.",
  "The first photograph of a person was taken by accident in 1838; a man getting his shoes shined stood still long enough to appear.",
  "Bluetooth is named after a Viking king, Harald ‘Bluetooth’ Gormsson, known for uniting tribes—just like Bluetooth unites devices.",
  "The first 1GB hard drive, introduced in 1980, weighed over 200 kilograms.",
  "Someone once ‘printed’ a working wrench on the International Space Station using a 3D printer.",
  "USB was famously confusing at first because it promised universality but came with multiple connector shapes.",
  "One of the earliest programming languages, COBOL, still runs a lot of critical banking systems today.",
  "Early mobile phones were called ‘bricks’ because some weighed over a kilogram.",
  "The first email was sent in 1971, and the @ symbol was chosen because it wasn’t commonly used in names.",
  "In 1999, a glitch known as the ‘Y2K bug’ made people worry computers would fail at midnight on New Year’s Eve.",
  "Before rubber erasers, people used breadcrumbs to erase pencil marks.",
  "The microwave oven was invented after a scientist noticed a chocolate bar melted in his pocket while he worked with radar.",
  "Bubble wrap was originally invented to be a type of textured wallpaper, not packaging material.",
  "The inventor of the Pringles can was buried in one of his own cans when he died.",
  "The stethoscope was invented because a doctor felt uncomfortable putting his ear directly on women’s chests.",
  "In 1977, a radio telescope picked up a strange 72-second signal from space, now known as the ‘Wow! signal’, still unexplained.",
  "There are more trees on Earth than stars in the Milky Way galaxy, according to some estimates.",
  "If you could drive your car straight up into space, you’d get there in about an hour, assuming highway speeds.",
  "On Mars, sunsets appear blue because of the way dust in the thin atmosphere scatters light.",
  "Neutron stars are so dense that a teaspoon of their material would weigh billions of tons.",
  "Space is not completely silent; sound can travel in certain regions with enough gas and plasma, just not like on Earth.",
  "The footprints left by astronauts on the Moon could last for millions of years because there’s no wind or water to erase them.",
  "A day on Mars is only about 40 minutes longer than a day on Earth.",
  "Saturn would float in a giant bathtub of water because its average density is lower than water’s.",
  "Venus rotates in the opposite direction from most planets in our solar system.",
  "If two pieces of the same type of metal touch in space, they can bond together permanently; this is called cold welding.",
  "The Great Red Spot on Jupiter is a storm that has been raging for at least 300 years.",
  "There’s a diamond planet called 55 Cancri e that appears to have a carbon-rich composition.",
  "Astronauts grow a little taller in space because their spines decompress without gravity’s constant pull.",
  "In space, tears don’t fall; they form floating blobs that stick to your eyes until wiped away.",
  "Lightning strikes the Earth about 8 million times a day.",
  "The hottest temperature ever recorded on Earth’s surface was over 56°C (around 134°F) in Death Valley, California.",
  "The coldest naturally occurring temperature on Earth was about −89°C (−128°F) in Antarctica.",
  "Some metals, like gallium, can melt in your hand because their melting point is just above room temperature.",
  "Glass is actually a very slow-flowing liquid at the molecular level, though it behaves like a solid in everyday life.",
  "You can boil water at room temperature if you lower the air pressure enough.",
  "If you drop a stone and a feather in a vacuum, they fall at the exact same speed.",
  "Time technically passes a tiny bit faster at the top of a mountain than at sea level due to gravity’s effect on time.",
  "Every person on Earth is technically slightly younger than their birth certificate suggests because of time dilation from movement.",
  "Your smartphone contains elements that were made in exploding stars billions of years ago.",
  "There’s enough DNA in your body’s cells that if stretched out, it could reach to the Sun and back many times.",
  "The acid in your stomach is strong enough to dissolve razor blades, though please don’t test that.",
  "Most of the cells in your body are not human; many are bacteria that live in and on you.",
  "Humans are bioluminescent—we emit a tiny amount of light—but it’s too faint for the naked eye to see.",
  "Your nose can remember around 50,000 different scents.",
  "Humans are the only animals known to blush, which fascinated Charles Darwin.",
  "When you blush, the lining of your stomach blushes too because of the same increased blood flow.",
  "You can’t tickle yourself easily because your brain predicts your own movements.",
  "The ‘brain freeze’ you get from ice cream is caused by blood vessels in your palate rapidly constricting and dilating.",
  "People are typically more honest when they’re tired because they have less energy to maintain a lie.",
  "Smiling, even when you don’t feel happy, can trick your brain into boosting your mood a bit.",
  "The color of a room can influence how people feel; blue tends to calm, while red can increase alertness.",
  "Most people dream in color, but some dream in black and white, often influenced by media they consume.",
  "We forget about 50–80% of new information within 24 hours if we don’t actively review it.",
  "When people talk, they gesture even when speaking on the phone, showing how deeply gestures are tied to thought.",
  "People tend to walk in circles when lost, even when they think they’re going straight.",
  "Humans seem to have a ‘negativity bias’, paying more attention to bad news than good news.",
  "Laughter is more about social bonding than jokes; people laugh more around others than alone.",
  "Many conspiracy theories start with a small truth that gets stretched and distorted over time.",
  "The CIA’s MK-Ultra program was once dismissed as a wild conspiracy theory before documents confirmed secret mind-control experiments.",
  "The Tuskegee syphilis study, where treatment was withheld from Black men without their informed consent, was once denied by officials but later fully exposed.",
  "For years, the idea that big tobacco companies hid research on the dangers of smoking sounded conspiratorial, but internal documents proved they did.",
  "The FBI’s COINTELPRO program secretly spied on and disrupted civil rights and activist groups, something many officials initially denied.",
  "At one point, many people believed governments didn’t conduct mass surveillance on citizens; leaks later revealed large-scale data collection programs existed.",
  "For a long time, it sounded like a conspiracy that corporate lobbyists helped write parts of laws, but many countries now openly acknowledge their influence.",
  "The idea that companies made products deliberately unreliable so you’d buy replacements—planned obsolescence—was once mocked but later found in internal memos.",
  "Some food companies secretly worked with scientists to find a ‘bliss point’ of sugar, salt, and fat to make products hard to resist.",
  "The notion that fast-food outlets tested drive-through cameras and license plate tracking sounded paranoid but has been documented in some pilot programs.",
  "For years, the presence of microplastics nearly everywhere—from ocean trenches to human blood—was doubted; now it’s widely measured.",
  "Whistleblowers have confirmed that some social media platforms ran secret experiments adjusting news feeds to study users’ moods and behavior.",
  "Historically, governments have used disinformation campaigns to influence public opinion, something that used to be dismissed as mere ‘paranoia’.",
  "In the 1950s, the idea that industries were dumping toxic chemicals into rivers and covering it up was seen as conspiratorial until major scandals surfaced.",
  "It was once hard to believe that companies secretly funded ‘independent’ research favorable to their products, but many such funding links have been exposed.",
  "Some cities quietly used algorithms to predict crime ‘hot spots’, which sounded like science fiction conspiracy, but later came out in public reports.",
  "For decades, rumors persisted that some countries spied on allied leaders; leaked documents later confirmed several such surveillance operations.",
  "Sugar industry groups once quietly paid researchers to downplay sugar’s role in heart disease and shift blame to fats.",
  "Several governments have admitted to secretly testing air pollution on unwitting populations in the mid-20th century.",
  "In the 1970s, it sounded far-fetched that governments kept secret lists of journalists and activists; later declassified files confirmed such lists existed.",
  "The idea that companies ‘shadow price’ airline tickets based on your browsing seemed conspiratorial, but some travel sites have been caught experimenting with dynamic pricing.",
  "Small groups can steer online conversation by coordinated posting, something once treated as a conspiracy theory but now openly discussed as ‘astroturfing’.",
  "Marketing teams have admitted to creating fake ‘grassroots’ campaigns to make products or ideas look organically popular.",
  "The phrase ‘conspiracy theory’ was popularized in part to discredit uncomfortable questions, though most theories still turn out to be wrong.",
  "Not all conspiracies are grand; many real ones are just a handful of people hiding inconvenient truths.",
  "A lot of real scandals were first uncovered by people who refused to accept the official story and kept asking for evidence.",
  "In many countries, once-secret archives declassified decades later have completely changed how historians understand past events.",
  "Despite real conspiracies existing, critical thinking and evidence are still the best tools to separate fact from fiction.",
  "In a typical large city, you’re almost always being recorded on at least one security camera when you walk downtown.",
  "People are more likely to share shocking or angry news online, even if they haven’t checked whether it’s true.",
  "False information often spreads faster on social media than true information because it tends to be more surprising.",
  "Urban legends evolve like living organisms, changing slightly with each retelling to better fit modern fears.",
  "In some countries, people can rent a professional ‘friend’ or ‘family member’ to attend events with them.",
  "Many countries have ‘ghost cities’—fully built urban areas with very few residents.",
  "In several cultures, people believe photos steal part of the soul; today, some feel similarly about facial recognition data.",
  "Money used to have intrinsic value (like gold coins), but now it’s mostly based on collective trust in institutions.",
  "Some economists argue that video games and virtual goods are becoming a kind of parallel economy.",
  "Many countries once banned coffee, seeing it as a dangerous social drink that encouraged political discussion.",
  "Tea once played such a big political role that it helped start wars and revolutions.",
  "In some parts of the world, people treat the number four as unlucky because it sounds like the word for ‘death’.",
  "There’s a small community of people who collect and trade rare airline sickness bags as a hobby.",
  "Some theme parks pump certain smells (like cookies or popcorn) into the air to influence what guests buy.",
  "Companies carefully design the ‘click’ sound of car doors and switches to make them feel more satisfying and high-quality.",
  "Supermarkets often place basic essentials like milk and bread at the very back so you’ll walk past more items and buy more.",
  "Many shopping apps use subtle design tricks, called ‘dark patterns’, to make it harder to cancel subscriptions.",
  "Some restaurants use slightly smaller plates to make portions look larger and more satisfying.",
  "Elevator ‘close door’ buttons often don’t work and are just there to make people feel more in control.",
  "Humans are surprisingly bad at noticing gradual changes, which is why ‘creeping’ changes in society can go largely unnoticed.",
  "People often judge the trustworthiness of a website in under a second based mostly on its design.",
  "The average person will spend years of their life looking at screens.",
  "Many airplane windows have a tiny hole in them to balance pressure between the window panes.",
  "Your phone’s autocorrect has effectively changed the way some people spell and even the slang they use.",
  "Most passwords are much weaker than people think, often based on simple patterns or predictable substitutions.",
  "Even though we feel unique, many of our ‘original’ opinions can be predicted from a handful of data points.",
  "Maps on your phone are not exact representations of reality; they’re simplified models tailored for usability, not truth.",
  "Subway and metro maps are deliberately distorted so lines and stations are easier to read.",
  "Some people experience ‘semantic satiation’, where repeating a word many times makes it temporarily lose its meaning.",
  "The word ‘robot’ comes from a Czech word meaning ‘forced labor’ or ‘drudgery’.",
  "English is a mash-up of many languages, borrowing heavily from Latin, French, Norse, and more.",
  "Languages constantly borrow words; ‘ketchup’, for example, likely comes from a Chinese or Malay word for a fermented fish sauce.",
  "Sign languages are full languages with their own grammar, not just hand versions of spoken words.",
  "Emoji use patterns differ by culture; some emojis are considered flirty in one place and harmless in another.",
  "People tend to use more emojis and exclamation marks in digital text to replace tone of voice and facial expression.",
  "Internet slang evolves so quickly that words can go from cool to cringe in a matter of months.",
  "Some online communities have developed dialects so distinct that outsiders struggle to understand them.",
  "Many of the biggest modern myths spread through misquoted or totally invented ‘scientific studies’.",
  "Social ‘challenges’ online can trace their roots back to much older traditions of dares and initiation rituals.",
  "The ‘bystander effect’ means people are less likely to help in emergencies if there are many other people around.",
  "Even small rituals—like a personal coffee routine—can make people feel more in control and less stressed.",
  "People who read fiction regularly tend to score higher on some measures of empathy.",
  "We’re living in one of the most peaceful periods in recorded human history in terms of per-person chance of dying in war, despite how it feels.",
  "Most of the plastic ever produced still exists in some form, because it breaks down extremely slowly.",
  "The modern weekend is a relatively recent invention; many workers historically had only one day off a week.",
  "Board games like Monopoly started as critiques of inequality but became casual family entertainment.",
  "A lot of what we think of as ‘traditional’ food in a country actually came from fairly recent global trade.",
  "Pizza as we know it became globally popular only in the last hundred years.",
  "There are people today whose job is to make fake food that looks perfect for advertising photos.",
  "Even in very different cultures, people’s facial expressions for basic emotions are surprisingly similar.",
  "Humans are so social that prolonged isolation can physically change the brain.",
  "When people clap in a crowd, their claps often synchronize without any leader, just like fireflies syncing flashes.",
  "Many of the world’s biggest cities started as small trading posts or forts in locations that seemed unimportant at the time.",
  "Cities at night from space mostly outline economic activity rather than actual borders.",
  "Global time zones were only standardized in the late 19th century, largely because of railways needing reliable schedules."
];
];

let lastFunFact = null;
function getRandomFunFact() {
  if (!funFacts.length) return null;
  let fact = funFacts[Math.floor(Math.random() * funFacts.length)];
  if (funFacts.length > 1 && fact === lastFunFact) {
    fact = funFacts[Math.floor(Math.random() * funFacts.length)];
  }
  lastFunFact = fact;
  return fact;
}

// DOM refs
const organizeBtn = document.getElementById("organizeBtn");
const brainDump = document.getElementById("brainDump");
const tasksContainer = document.getElementById("tasksContainer");
const funFactContainer = document.getElementById("funFactContainer");
const taskDateInput = document.getElementById("taskDate");

const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authStatus = document.getElementById("authStatus");

const calendarSection = document.getElementById("calendarSection");
const calendarGrid = document.getElementById("calendarGrid");
const calendarMonthLabel = document.getElementById("calendarMonthLabel");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");

const sortSection = document.getElementById("sortSection");
const sortMode = document.getElementById("sortMode");

const manualAddSection = document.getElementById("manualAddSection");
const manualTaskInput = document.getElementById("manualTaskInput");
const manualAddBtn = document.getElementById("manualAddBtn");

// === AUTH LOGIC ===
let currentUser = null;
let currentMonthDate = new Date(); // which month is shown in the calendar
let draggedTaskElement = null;     // for drag & drop

async function checkSession() {
  const { data } = await supabase.auth.getUser();
  currentUser = data.user || null;
  updateAuthUI();
  if (currentUser) {
    setToday();
    await loadTasksForSelectedDate();
    await renderCalendar();
  }
}

function updateAuthUI() {
  const hasCalendar = !!calendarSection;
  const hasSort = !!sortSection;
  const hasManual = !!manualAddSection;

  if (currentUser) {
    authStatus.textContent = `Logged in as ${currentUser.email}`;
    logoutBtn.style.display = "inline-block";
    loginBtn.style.display = "none";
    signupBtn.style.display = "none";
    if (hasCalendar) calendarSection.style.display = "block";
    if (hasSort) sortSection.style.display = "block";
    if (hasManual) manualAddSection.style.display = "flex";
    organizeBtn.disabled = false;
  } else {
    authStatus.textContent = "Not logged in.";
    logoutBtn.style.display = "none";
    loginBtn.style.display = "inline-block";
    signupBtn.style.display = "inline-block";
    if (hasCalendar) calendarSection.style.display = "none";
    if (hasSort) sortSection.style.display = "none";
    if (hasManual) manualAddSection.style.display = "none";
    organizeBtn.disabled = true;
    tasksContainer.innerHTML = "";
    funFactContainer.textContent = "";
  }
}

signupBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) return alert("Email and password required.");

  try {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error("Sign up error object:", error);
      return alert("Sign up error: " + error.message);
    }
    alert("Check your email to confirm your account.");
  } catch (e) {
    console.error("Sign up threw exception:", e);
    alert("Sign up error: " + e.message);
  }
});

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) return alert("Email and password required.");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return alert("Login error: " + error.message);
  currentUser = data.user;
  updateAuthUI();
  setToday();
  await loadTasksForSelectedDate();
  await renderCalendar();
});

logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  currentUser = null;
  updateAuthUI();
});

// === DATE & CALENDAR HANDLING ===
function setToday() {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10); // YYYY-MM-DD
  taskDateInput.value = todayStr;
  currentMonthDate = today;
}

sortMode.addEventListener("change", () => {
  if (currentUser) loadTasksForSelectedDate();
});

prevMonthBtn.addEventListener("click", () => {
  currentMonthDate.setMonth(currentMonthDate.getMonth() - 1);
  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
  renderCalendar();
});

async function renderCalendar() {
  if (!currentUser) return;

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-11

  // Label like "November 2025"
  calendarMonthLabel.textContent = currentMonthDate.toLocaleDateString(
    undefined,
    { month: "long", year: "numeric" }
  );

  const first = new Date(year, month, 1);
  const firstDay = (first.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthStart = first.toISOString().slice(0, 10);
  const last = new Date(year, month + 1, 0);
  const monthEnd = last.toISOString().slice(0, 10);

  // Which dates in this month have tasks?
  const { data, error } = await supabase
    .from("tasks")
    .select("task_date")
    .eq("user_id", currentUser.id)
    .gte("task_date", monthStart)
    .lte("task_date", monthEnd);

  if (error) {
    console.error("Calendar query error:", error);
  }

  const datesWithTasks = new Set((data || []).map((row) => row.task_date));

  // Build grid
  calendarGrid.innerHTML = "";

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  dayNames.forEach((name) => {
    const el = document.createElement("div");
    el.className = "cal-day-name";
    el.textContent = name;
    calendarGrid.appendChild(el);
  });

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    calendarGrid.appendChild(empty);
  }

  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month, day);
    const dateStr = dateObj.toISOString().slice(0, 10);
    const cell = document.createElement("div");
    cell.className = "cal-day";
    cell.textContent = day;
    cell.dataset.date = dateStr;

    if (datesWithTasks.has(dateStr)) {
      cell.classList.add("has-tasks");
    }
    if (taskDateInput.value === dateStr) {
      cell.classList.add("selected");
    }

    cell.addEventListener("click", () => {
      taskDateInput.value = dateStr;
      loadTasksForSelectedDate();
      document.querySelectorAll(".cal-day.selected").forEach((el) =>
        el.classList.remove("selected")
      );
      cell.classList.add("selected");
    });

    calendarGrid.appendChild(cell);
  }
}

// === LOAD TASKS FOR A DATE (uses sort_index for stable order) ===
async function loadTasksForSelectedDate() {
  tasksContainer.innerHTML = "";
  funFactContainer.textContent = "";

  const date = taskDateInput.value;
  if (!date || !currentUser) return;

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", currentUser.id)
    .eq("task_date", date)
    .order("sort_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  let tasks = data || [];

  if (sortMode && sortMode.value === "priority") {
    const order = { high: 0, medium: 1, low: 2 };
    tasks.sort(
      (a, b) => (order[a.priority] ?? 3) - (order[b.priority] ?? 3)
    );
  }
  // if sortMode is "created", we keep DB order (sort_index then created_at)

  tasks.forEach((task) => {
    renderTaskItem(task);
  });

  // Refresh calendar highlights for has-tasks / selected
  renderCalendar();
}

// === DRAG & DROP HELPERS ===
tasksContainer.addEventListener("dragover", (e) => {
  e.preventDefault();
  if (!draggedTaskElement) return;

  const afterElement = getDragAfterElement(tasksContainer, e.clientY);
  if (afterElement == null) {
    tasksContainer.appendChild(draggedTaskElement);
  } else {
    tasksContainer.insertBefore(draggedTaskElement, afterElement);
  }
});

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".task-item:not(.dragging)"),
  ];

  let closest = { offset: Number.NEGATIVE_INFINITY, element: null };

  draggableElements.forEach((child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      closest = { offset, element: child };
    }
  });

  return closest.element;
}

async function saveTaskOrderToDatabase() {
  const items = [...tasksContainer.querySelectorAll(".task-item")];
  const updates = items.map((item, index) => {
    const id = item.dataset.taskId;
    return supabase
      .from("tasks")
      .update({ sort_index: index })
      .eq("id", id);
  });
  try {
    await Promise.all(updates);
  } catch (e) {
    console.error("Error saving order:", e);
  }
}

// === RENDER TASK ITEM ===
function renderTaskItem(task) {
  const div = document.createElement("div");
  div.className = `task-item ${task.priority || "low"}`;
  div.dataset.taskId = task.id;

  // Make draggable
  div.draggable = true;
  div.addEventListener("dragstart", () => {
    draggedTaskElement = div;
    div.classList.add("dragging");
  });
  div.addEventListener("dragend", () => {
    draggedTaskElement = null;
    div.classList.remove("dragging");
    saveTaskOrderToDatabase();
  });

  const left = document.createElement("div");
  left.style.display = "flex";
  left.style.alignItems = "center";
  left.style.flex = "1";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = !!task.completed;
  checkbox.addEventListener("change", async () => {
    await supabase
      .from("tasks")
      .update({ completed: checkbox.checked })
      .eq("id", task.id);

    if (checkbox.checked) {
      const fact = getRandomFunFact();
      if (fact) {
        funFactContainer.textContent = `🎉 Fun fact: ${fact}`;
      }
    }
  });

  const label = document.createElement("label");
  label.textContent = task.task_text;
  label.style.marginLeft = "10px";
  label.style.flex = "1";

  left.appendChild(checkbox);
  left.appendChild(label);

  const controls = document.createElement("div");
  controls.className = "task-controls";

  // Priority select
  const prioritySelect = document.createElement("select");
  prioritySelect.className = "priority-select";
  ["high", "medium", "low"].forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p[0].toUpperCase() + p.slice(1);
    prioritySelect.appendChild(opt);
  });
  prioritySelect.value = task.priority || "low";
  prioritySelect.addEventListener("change", async () => {
    const newPriority = prioritySelect.value;
    await supabase
      .from("tasks")
      .update({ priority: newPriority })
      .eq("id", task.id);

    div.classList.remove("high", "medium", "low");
    div.classList.add(newPriority);

    // If sorting by priority, reload list from DB
    if (sortMode && sortMode.value === "priority") {
      loadTasksForSelectedDate();
    }
  });

  // Optional move buttons (keep as extra)
  const upBtn = document.createElement("button");
  upBtn.textContent = "↑";
  upBtn.title = "Move up";
  upBtn.className = "task-move";
  upBtn.addEventListener("click", () => {
    const prev = div.previousElementSibling;
    if (prev && prev.classList.contains("task-item")) {
      tasksContainer.insertBefore(div, prev);
      saveTaskOrderToDatabase();
    }
  });

  const downBtn = document.createElement("button");
  downBtn.textContent = "↓";
  downBtn.title = "Move down";
  downBtn.className = "task-move";
  downBtn.addEventListener("click", () => {
    const next = div.nextElementSibling;
    if (next && next.classList.contains("task-item")) {
      tasksContainer.insertBefore(next, div);
      saveTaskOrderToDatabase();
    }
  });

  // Delete
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "✕";
  deleteBtn.title = "Delete task";
  deleteBtn.className = "task-delete";
  deleteBtn.addEventListener("click", async () => {
    if (!confirm("Delete this task?")) return;
    await supabase.from("tasks").delete().eq("id", task.id);
    div.remove();
    saveTaskOrderToDatabase();
    renderCalendar();
  });

  controls.appendChild(prioritySelect);
  controls.appendChild(upBtn);
  controls.appendChild(downBtn);
  controls.appendChild(deleteBtn);

  div.appendChild(left);
  div.appendChild(controls);
  tasksContainer.appendChild(div);
}

// === MANUAL ADD TASK ===
async function addManualTask() {
  if (!currentUser) return alert("Please log in first.");
  const text = manualTaskInput.value.trim();
  if (!text) return;

  const date = taskDateInput.value;
  if (!date) return alert("Please choose a date.");

  const existingItems = [
    ...tasksContainer.querySelectorAll(".task-item")
  ];
  const baseIndex = existingItems.length;

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: currentUser.id,
      task_date: date,
      task_text: text,
      priority: "medium",
      completed: false,
      sort_index: baseIndex
    })
    .select()
    .single();

  if (error) {
    console.error("Manual add error:", error);
    alert("Could not add task.");
    return;
  }

  renderTaskItem(data);
  manualTaskInput.value = "";
  await saveTaskOrderToDatabase();
  await renderCalendar();
}

manualAddBtn.addEventListener("click", addManualTask);
manualTaskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addManualTask();
  }
});

// === ORGANIZE BUTTON (AI + SAVE, APPEND TASKS) ===
organizeBtn.addEventListener("click", async () => {
  if (!currentUser) return alert("Please log in first.");
  const dumpText = brainDump.value.trim();
  if (!dumpText) return alert("Please type something first.");

  const date = taskDateInput.value;
  if (!date) return alert("Please choose a date.");

  organizeBtn.disabled = true;
  organizeBtn.textContent = "Organizing…";
  funFactContainer.textContent = "";

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "tasks", text: dumpText }),
    });

    const data = await response.json();
    if (!data.ok) throw new Error(data.error || "Unknown error from worker.");

    const lines = data.tasksText
      .split("\n")
      .filter((line) => line.trim().startsWith("-"));

    // determine base index so AI tasks are appended in given order
    const existingItems = [
      ...tasksContainer.querySelectorAll(".task-item")
    ];
    let baseIndex = existingItems.length;

    for (const line of lines) {
      const trimmed = line.replace(/^-\s*/, "");
      const match = trimmed.match(/^\[(High|Medium|Low)\]\s*(.+)$/i);
      if (match) {
        const priority = match[1].toLowerCase();
        const text = match[2];

        const { data: inserted, error } = await supabase
          .from("tasks")
          .insert({
            user_id: currentUser.id,
            task_date: date,
            task_text: text,
            priority,
            completed: false,
            sort_index: baseIndex
          })
          .select()
          .single();

        if (!error && inserted) {
          renderTaskItem(inserted);
          baseIndex += 1;
        }
      }
    }

    await saveTaskOrderToDatabase();
    await renderCalendar();
  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
  } finally {
    organizeBtn.disabled = false;
    organizeBtn.textContent = "Organize My Mess";
    brainDump.value = "";
  }
});

// === INIT ===
checkSession();
