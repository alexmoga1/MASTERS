/* ── Picks submission page ───────────────────────────────────────────────────── */

let accessCode = '';
let tiers = null;
let buyInAmount = 7;

// April 9, 2026 8:00am ET = 12:00pm UTC
const SUBMISSION_DEADLINE = new Date('2026-04-09T12:00:00Z');

// ── Golfer hype bank ──────────────────────────────────────────────────────────

const GOLFER_HYPE = {
  // ── Tier 1 ──────────────────────────────────────────────────────────────────
  'Scottie Scheffler': [
    { icon: '🟢', title: 'Boring pick. GENIUS pick.', msg: 'World No. 1 said "lemme just win Augusta again" and honestly? he might just do it. locked tf in.' },
    { icon: '🏆', title: 'Safe but make it dominant', msg: 'Scheffler won this thing in 2022 AND 2024. bro is just built for Augusta no cap.' },
    { icon: '🫡', title: 'Respectful af pick', msg: 'You looked at the best golfer on the planet and said yes please. we respect that energy.' }
  ],
  'Jon Rahm': [
    { icon: '🔥', title: 'FIREEEE!! I love the Rahm pick.', msg: 'El Rahmbo plays Augusta like it owes him money. two-time major winner who is absolutely built for this moment.' },
    { icon: '😤', title: 'The Spaniard is cooked in 🔥', msg: 'Rahm shows up at majors and goes absolutely feral. this is not a pick, this is a STATEMENT.' },
    { icon: '💥', title: 'Bold? No. CORRECT.', msg: 'He won the Masters in 2023 and hasn\'t forgotten what it feels like. Rahm is going to cook this week.' }
  ],
  'Bryson DeChambeau': [
    { icon: '🧪', title: 'You picked the mad scientist and we\'re here for it', msg: 'Bryson pulled out a spreadsheet, did the math, and decided Augusta is solvable. he might actually be right.' },
    { icon: '💪', title: 'Big brain, bigger drives', msg: 'This man scientifically optimized his body and his golf swing. If that\'s not the energy you want in your pool, idk what to tell you.' },
    { icon: '🔬', title: 'Main character behavior fr', msg: 'Nobody plays golf like Bryson. Nobody. absolute freak of nature pick and we mean that as a compliment.' }
  ],
  'Rory McIlroy': [
    { icon: '🍀', title: 'FIREEEE!! I love the Rory pick.', msg: 'Career Grand Slam is RIGHT THERE. Rory wants this more than anyone alive and Augusta is finally going to give it to him. this is the year.' },
    { icon: '😭', title: 'He needs this SO bad and it\'s going to slap', msg: 'Rory has been chasing the green jacket his whole career. one of these years he gets it. could literally be this week. pick goes crazy.' },
    { icon: '🏆', title: 'THE. YEAR. OF. RORY.', msg: 'bro has been so close so many times. the universe owes him this one. great pick, great energy, great vibes only.' }
  ],
  'Ludvig Aberg': [
    { icon: '⚡', title: 'The Viking said "hold my meatballs"', msg: 'Finished runner-up at the Masters as a ROOKIE. He\'s only gotten better since. this pick is actually dangerous.' },
    { icon: '👀', title: 'Slept on pick of the pool fr', msg: 'Everyone\'s picking Scheffler and Rory. You picked the 6\'4" Swedish destroyer who almost won this as a first-timer. respect.' },
    { icon: '🇸🇪', title: 'ABERG IS BUILT DIFFERENT no cap', msg: 'Calm, powerful, insanely talented. Came out of nowhere and almost took the green jacket in his debut. he is NOT done.' }
  ],
  'Xander Schauffele': [
    { icon: '🏆', title: 'Reigning major champ said what\'s up', msg: 'Won the Open AND the PGA in back-to-back years. Xander doesn\'t do choking anymore — that era is OVER.' },
    { icon: '🧊', title: 'Cold-blooded pick, we love it', msg: 'Xander Schauffele in a major is a different animal. the man simply shows up when it matters. elite pick energy.' },
    { icon: '💅', title: 'Understated and absolutely correct', msg: 'He doesn\'t make noise, he just wins. Two majors, prime of his career, and Augusta suits his game perfectly. SLAY.' }
  ],

  // ── Tier 2 ──────────────────────────────────────────────────────────────────
  'Cam Young': [
    { icon: '🌟', title: 'CAM YOUNG IS ABOUT TO EAT 🍽️', msg: 'Sleeper pick energy but make it aggressive. Elite ball-striker flying under the radar. That\'s exactly when he\'s the most dangerous.' },
    { icon: '🚀', title: 'Young dawg going off this week', msg: 'Nobody\'s scared of Cam Young and that\'s his whole thing. he will absolutely sneak up on this field and cook them.' },
    { icon: '🔥', title: 'Sneaky fire pick fr fr', msg: 'Cam Young at Augusta with something to prove is genuinely terrifying for the competition. love this pick.' }
  ],
  'Tommy Fleetwood': [
    { icon: '💇', title: 'THE HAIR. THE IRONS. THE VIBES.', msg: 'Tommy Fleetwood is built for Augusta and you know it. beautiful ball-striking, incredible short game, elite main character energy.' },
    { icon: '🎯', title: 'Fleetwood is about to go absolutely nuclear', msg: 'He has never won a major but he SHOULD have by now. This might finally be the week. certified fire pick.' },
    { icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', title: 'The English assassin said hello', msg: 'Smooth as hell, dangerous as hell. Fleetwood plays Augusta like he was born on those fairways. great pick no cap.' }
  ],
  'Matt Fitzpatrick': [
    { icon: '🧠', title: 'Big brain pick activated', msg: 'US Open champion who out-thinks the entire field. Fitz doesn\'t overpower Augusta — he outwits it. that\'s the move.' },
    { icon: '🎯', title: 'Chess player in a field of checkers', msg: 'While everyone\'s bombing it 350, Fitz is plotting every shot from 100 yards out. certified strategic genius pick.' },
    { icon: '📐', title: 'Calculated as hell and we respect it', msg: 'Matt Fitzpatrick does not make mistakes. At Augusta, where mistakes get punished mercilessly, that is an INSANE advantage.' }
  ],
  'Hideki Matsuyama': [
    { icon: '🌸', title: 'Hideki has a bond with Augusta that goes beyond golf', msg: 'He won the Masters in 2021 and literally cried on the green. Augusta is his house and he KNOWS it. fire pick.' },
    { icon: '🎌', title: 'THE DEFENDING SPIRIT IS REAL', msg: 'Hideki walks around Augusta like he owns the place. because he kind of does? 2021 champion and he hasn\'t forgotten.' },
    { icon: '⛳', title: 'Respect the Masters champion', msg: 'Won here before, loves it here, plays beautifully here. Hideki at Augusta is just a different thing and you tapped in. love it.' }
  ],
  'Collin Morikawa': [
    { icon: '📐', title: 'The most precise man alive just entered the chat', msg: 'Morikawa hits fairways like it\'s a personal obsession. At Augusta, where accuracy wins, he is literally built for this.' },
    { icon: '🤖', title: 'Machine mode: ON', msg: 'Two major wins. No drama. Just pure, robotic ball-striking excellence. Morikawa doesn\'t get rattled — he just wins.' },
    { icon: '🔥', title: 'Clinical pick and we mean that as a compliment', msg: 'When Morikawa is clicking nobody can touch him. Like, genuinely nobody. elite pick fr.' }
  ],
  'Robert MacIntyre': [
    { icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', title: 'BRO PICKED A LEFTY SCOTSMAN AND WE ARE FULLY ROOTING FOR HIM', msg: 'Underdog arc incoming. Big heart, massive game, and absolutely nothing to lose. MacIntyre might be the story of the week.' },
    { icon: '🏹', title: 'The Scottish longbow has been loaded', msg: 'Left-hander with elite iron play and zero fear. He plays with a chip on his shoulder the size of a green jacket. fire pick.' },
    { icon: '⚡', title: 'Chaos pick? Inspired pick? Both.', msg: 'MacIntyre is trending in the right direction at exactly the right time. If he goes on a run this week, you\'re going to look like a genius.' }
  ],

  // ── Tier 3 ──────────────────────────────────────────────────────────────────
  'Min Woo Lee': [
    { icon: '🎪', title: 'MIN WOO LEE IS GOING TO DO SOMETHING INSANE THIS WEEK', msg: 'And you\'re going to be right there for it. He plays golf like he\'s performing for a crowd. absolute vibe pick, no notes.' },
    { icon: '🎨', title: 'Most entertaining pick in the entire pool', msg: 'Min Woo doesn\'t just make birdies, he makes MOMENTS. This week is going to be a movie and you picked the main character.' },
    { icon: '🔥', title: 'Fearless pick, fearless golfer', msg: 'He plays like he has nothing to lose, which is the most dangerous thing in golf. incredible pick fr fr.' }
  ],
  'Justin Rose': [
    { icon: '🌹', title: 'The Rose is blooming again', msg: 'Augusta veteran who knows every inch of that course. been sleeping on him? he\'s about to wake the entire field up.' },
    { icon: '🏆', title: 'Classic pick, classic player', msg: 'US Open champion. Augusta National legend. Justin Rose at the Masters is never not a threat and you know that.' },
    { icon: '😌', title: 'Quiet confidence pick', msg: 'Rose doesn\'t hype himself up. He just shows up and goes low. Underrated and dangerous — exactly the vibe.' }
  ],
  'Brooks Koepka': [
    { icon: '😤', title: 'KOEPKA IN A MAJOR IS LITERALLY CHEATING', msg: 'Five major titles. FIVE. The man shows up when the trophy is on the line every single time. you picked a serial winner.' },
    { icon: '🔪', title: 'Stone cold killer energy, we love to see it', msg: 'Brooks doesn\'t have a personality but he has 5 majors so who is actually laughing. goated pick no cap.' },
    { icon: '💀', title: 'Major mode activated, everybody run', msg: 'Something clicks in Brooks Koepka when a major starts. Scientists can\'t explain it. You don\'t need to. Just enjoy the wins.' }
  ],
  'Chris Gotterup': [
    { icon: '🎯', title: 'NICE, Gotterup is going to cook the shit out of everyone.', msg: 'Nobody\'s talking about him. That\'s exactly what he wants. Sleeper pick of the tournament and you found him first.' },
    { icon: '🚀', title: 'This pick is going to age like fine wine', msg: 'Gotterup is a big hitter with a big game and zero expectations. That is the perfect recipe for a Masters run.' },
    { icon: '👀', title: 'You saw something nobody else did', msg: 'Everyone\'s ignoring Gotterup. You aren\'t. When he goes deep this week you\'re going to look like an absolute prophet.' }
  ],
  'Jordan Spieth': [
    { icon: '💚', title: 'SPIETH AND AUGUSTA IS A LOVE STORY AND YOU\'RE PART OF IT NOW', msg: '2015 Masters champion who has never really left. He and Augusta have a thing that just doesn\'t quit. legendary pick.' },
    { icon: '🎩', title: 'Augusta\'s forever darling said I\'m back', msg: 'Spieth loves this place more than any golfer alive. When he\'s on at Augusta, it\'s genuinely special to watch.' },
    { icon: '🔥', title: 'Romantic pick and we mean that respectfully', msg: 'Picking Spieth at Augusta is picking a guy who would literally bleed for that green jacket. the passion is unmatched.' }
  ],
  'Patrick Reed': [
    { icon: '😈', title: 'Controversial pick but we RESPECT the chaos energy', msg: '2018 Masters champion. Polarizing? Sure. Dangerous at Augusta? Absolutely. Captain America shows up in majors.' },
    { icon: '🫡', title: 'Villain arc pick and we are HERE', msg: 'Patrick Reed does not care what you think about him. He just wins majors. Two of them. Including this one. bold pick.' },
    { icon: '🎭', title: 'This pick has main character energy for the wrong reasons but who cares', msg: 'Love him or hate him, Reed at Augusta is always a story. and your pick might just be the story of the week.' }
  ],

  // ── Tier 4 ──────────────────────────────────────────────────────────────────
  'Viktor Hovland': [
    { icon: '🇳🇴', title: 'HOVLAND IS BACK BABY', msg: 'Former world No. 1 playing with pure joy and freedom right now. When Hovland is cooking, he\'s a top-5 player on the planet. great pick.' },
    { icon: '⚡', title: 'Norwegian destroyer mode: ENGAGED', msg: 'He went through a rough patch and came out the other side swinging harder. Hovland with something to prove is absolutely lethal.' },
    { icon: '🔥', title: 'The comeback arc pick hits different', msg: 'Everyone doubted Hovland for a minute. You didn\'t. If he goes on a run this week that pick is going to feel incredible.' }
  ],
  'Russell Henley': [
    { icon: '🎯', title: 'The quiet assassin nobody talks about', msg: 'Henley quietly goes top-10 at Augusta every year and nobody mentions it. Until now. Certified sleeper pick and you found him.' },
    { icon: '📊', title: 'Actually insane value pick if you look at the data', msg: 'Consistent. Precise. Flies completely under the radar. Henley at Augusta is historically underrated and you just cashed in.' },
    { icon: '🕵️', title: 'You did your research and it shows', msg: 'Most people skip past Henley. You didn\'t. That\'s what separates the winners from the people who pick Scheffler and call it a day.' }
  ],
  'Si Woo Kim': [
    { icon: '✨', title: 'SI WOO KIM DOES NOT MISS IN A BIG MOMENT', msg: 'Won the Players Championship, has pulled off shots nobody else would attempt. Wild card energy but make it elite.' },
    { icon: '🎲', title: 'Chaotic good pick, we love the energy', msg: 'Si Woo plays with a freedom that is genuinely dangerous. Nobody knows what he\'s capable of — and that includes the field.' },
    { icon: '🎪', title: 'Unpredictable pick for an unpredictable player', msg: 'Si Woo Kim will do something this week that makes you scream at your phone. Whether that\'s good or bad is TBD but it will be a ride.' }
  ],
  'Justin Thomas': [
    { icon: '💥', title: 'JT IS COMING FOR BLOOD THIS WEEK', msg: 'Two major wins and a massive chip on his shoulder. He\'s been building and building and Augusta is where he finally explodes.' },
    { icon: '🔥', title: 'Motivated JT is a terrifying thing', msg: 'Justin Thomas with something to prove is one of the scariest golfers on tour. He\'s got that look in his eye this week.' },
    { icon: '😤', title: 'The comeback narrative pick is so good', msg: 'JT has been grinding to get back to his best. If it clicks at Augusta this week, you are going to be LOUD about this pick.' }
  ],
  'Akshay Bhatia': [
    { icon: '🌊', title: 'You picked the young dawg who gives zero f**ks and that\'s a strategy', msg: 'Fearless, talented, and trending upward at the exact right time. This might be the year Augusta introduces itself to Akshay Bhatia.' },
    { icon: '🆕', title: 'New wave energy pick hits different', msg: 'Bhatia plays with the confidence of someone who hasn\'t learned what\'s supposed to be hard yet. Dangerous as hell at a major.' },
    { icon: '🚀', title: 'The future is now pick', msg: 'Young, unafraid, and improving every week. If Bhatia has a breakout moment this year, it\'s going to be at Augusta. you called it.' }
  ],
  'Patrick Cantlay': [
    { icon: '🧊', title: 'THE ICEMAN. This is not a game.', msg: 'Patrick Cantlay putts like he\'s got liquid nitrogen in his veins. Sneaky elite pick that\'s going to pay off big.' },
    { icon: '😶', title: 'Zero emotion, all results pick', msg: 'Cantlay doesn\'t celebrate, doesn\'t react, just makes birdie after birdie after birdie. robotically excellent pick.' },
    { icon: '🎯', title: 'Under the radar and about to blow up the leaderboard', msg: 'Nobody\'s talking about Cantlay this week. He prefers it that way. Your pick is going to do the talking for you.' }
  ],

  // ── Tier 5 ──────────────────────────────────────────────────────────────────
  'Sam Burns': [
    { icon: '🔥', title: 'Dark horse pick fr fr', msg: 'Burns has the game for Augusta, just needs one week to go his way. This might genuinely be that week. fire pick.' },
    { icon: '🎯', title: 'Louisiana heat incoming', msg: 'Sam Burns hits it a mile, putts his ass off, and plays with quiet intensity. Tier 5 value pick of the century honestly.' },
    { icon: '👀', title: 'You saw the sleeper. Respect.', msg: 'Burns is the kind of player who could go quietly top-5 this week and nobody would see it coming. except you.' }
  ],
  'Maverick McNealy': [
    { icon: '🛩️', title: 'MAVERICK MCNEALY IS BUILT DIFFERENT', msg: 'Stanford grad, hits it a mile, plays with actual swag. Nobody at Tier 5 is improving faster. Underdog pick of the year easily.' },
    { icon: '📈', title: 'Most improved player you could have picked', msg: 'McNealy is on a trajectory that screams breakthrough moment incoming. You might be picking him at exactly the right time.' },
    { icon: '🚀', title: 'High-flying longshot with real upside', msg: 'Nobody expects Maverick McNealy to make a run this week. That\'s exactly why this pick slaps so hard.' }
  ],
  'Corey Conners': [
    { icon: '🍁', title: 'THE MOST ACCURATE DRIVER ON TOUR. AT AUGUSTA. HELLO??', msg: 'Where you get punished for missing fairways. And you picked the guy who never misses fairways. That\'s not a pick that\'s a SCHEME.' },
    { icon: '🎯', title: 'The Canadian cannonball is locked in', msg: 'Conners doesn\'t make mistakes. Augusta punishes mistakes mercilessly. Do the math. You did. Great pick.' },
    { icon: '🧠', title: 'Actually genius Tier 5 pick', msg: 'While others are picking vibes and feelings, you picked the most accurate ball-striker in the field. calculated as hell.' }
  ],
  'Tiger Woods': [
    { icon: '🐅', title: 'YOU PICKED TIGER WOODS AT AUGUSTA AND WE WILL NOT HEAR A SINGLE WORD AGAINST IT.', msg: 'Five green jackets. Fifteen majors. A comeback story that has no right to keep working and yet. You picked right. You always pick right.' },
    { icon: '👑', title: 'The GOAT pick. End of discussion.', msg: 'Tiger Woods at Augusta National is not a golf story, it\'s a mythology. And you just put yourself inside it. respect.' },
    { icon: '🏆', title: 'This pick is either delusional or prophetic and there is no in between', msg: 'Tiger. Augusta. Green jacket. If it happens you will never let anyone forget you picked him. NOR SHOULD YOU.' }
  ],
  'Daniel Berger': [
    { icon: '⚡', title: 'Berger said "everyone forgot about me" and is about to remind the field', msg: 'Villain arc behavior and we are fully rooting for it. Power game, great short game, massive motivation. dark horse pick.' },
    { icon: '😤', title: 'Comeback szn pick goes hard', msg: 'Berger is playing with a chip on his shoulder the size of Augusta National. That energy is going to translate into birdies.' },
    { icon: '🎯', title: 'The underdog with receipts', msg: 'People slept on Berger. You didn\'t. If he has a week, you\'re going to look like the smartest person in the pool. easily.' }
  ],
  'Nicolai Hojgaard': [
    { icon: '🇩🇰', title: 'THE DANE IS COMING AND NOBODY IS READY', msg: 'Nicolai Hojgaard is one of the most underrated players in the world and you just found him. This pick is going to age beautifully.' },
    { icon: '🔥', title: 'Hojgaard said "let me cook" and we believe him', msg: 'Big game, bigger potential, and zero pressure on him this week. That combination at Augusta is genuinely dangerous. great find.' },
    { icon: '🌊', title: 'Sleeper alert of the entire tournament', msg: 'Nobody outside of golf nerds knows who Hojgaard is. By Sunday they will. And you called it first. respect.' }
  ],
  'Shane Lowry': [
    { icon: '🍀', title: 'THE CLARET JUG WINNER HAS ENTERED THE CHAT', msg: 'Shane Lowry is a major champion who plays with absolute heart and zero fucks given. When he\'s on, he is must-watch television.' },
    { icon: '😤', title: 'Lowry is built for big moments and this is the biggest one', msg: 'He won the Open Championship in a storm and didn\'t blink. Augusta doesn\'t scare Shane Lowry. Nothing does. fire pick.' },
    { icon: '🎯', title: 'The Irishman has unfinished business at Augusta', msg: 'Consistent, clutch, and criminally underrated at the Masters. Lowry is going to make some noise this week and you\'re riding it.' }
  ],
  'Adam Scott': [
    { icon: '🟡', title: 'A FORMER MASTERS CHAMPION IS NEVER A BAD PICK. EVER.', msg: 'Adam Scott won the green jacket in 2013 and he has never stopped loving this place. The smoothest swing in golf is still dangerous.' },
    { icon: '🎩', title: 'The smoothest man in golf said he\'s still got it', msg: 'Adam Scott\'s ball-striking is genuinely beautiful and Augusta rewards beauty. Veteran pick with actual upside. we respect it.' },
    { icon: '⛳', title: 'Old school pick, timeless talent', msg: 'People keep writing Adam Scott off and he keeps showing up. This week might be the one that shuts everyone up for good. great pick.' }
  ],
  'JJ Spaun': [
    { icon: '🎲', title: 'BRO SAID "F*** IT, SPAUN" AND WE RESPECT THE CHAOS', msg: 'Absolute swing pick and if he goes low this week you are the most popular person in this entire pool. The audacity. The vision. The swag.' },
    { icon: '🤡', title: 'Certified degenerate gambler pick (affectionate)', msg: 'JJ Spaun at Augusta is a long shot. A very long shot. But long shots pay the most. You know what you\'re doing.' },
    { icon: '🔥', title: 'Most unhinged pick in the pool and we mean that as the highest compliment', msg: 'If Spaun goes crazy this week — and he\'s capable of it — you will be an ABSOLUTE legend. worth it.' }
  ]
};

// Fallback messages for any golfer not in the list (shouldn't happen but just in case)
const FALLBACK_HYPE = [
  { icon: '🔥', title: 'FIREEEE!! That pick goes crazy.', msg: 'Absolutely elite selection. The rest of the pool is shaking right now. genuinely.' },
  { icon: '👀', title: 'Bold pick. We see you.', msg: 'You didn\'t go safe and we respect it. That pick has the energy of someone who actually knows what they\'re doing.' },
  { icon: '💅', title: 'Slay pick no notes', msg: 'Could not have picked better ourselves. This is going to look very smart by Sunday.' },
  { icon: '🧠', title: 'Big brain move fr', msg: 'Everyone\'s going to be talking about that pick when the leaderboard updates. You saw something they didn\'t.' },
  { icon: '😤', title: 'This pick has main character energy', msg: 'You\'re not here to participate, you\'re here to WIN. That pick reflects that. respect the vision.' }
];

// ── Access code gate ──────────────────────────────────────────────────────────

function unlock() {
  const code = document.getElementById('codeInput').value.trim();
  if (!code) return;

  accessCode = code;

  Promise.all([
    fetch('/api/tiers').then(r => r.json()),
    fetch('/api/leaderboard').then(r => r.json())
  ]).then(([tiersData, lbData]) => {
    tiers = tiersData;
    buyInAmount = lbData.settings?.buyIn ?? 7;

    document.getElementById('codeGate').style.display = 'none';
    document.getElementById('picksPanel').style.display = 'block';
    document.getElementById('buyIn').textContent = buyInAmount;
    document.getElementById('buyInInstr').textContent = buyInAmount;

    if (lbData.settings?.locked || Date.now() >= SUBMISSION_DEADLINE) {
      document.getElementById('formSection').style.display = 'none';
      document.getElementById('howItWorks').style.display = 'none';
      document.getElementById('lockedMsg').style.display = 'block';
    } else {
      populateTiers();
    }
  }).catch(() => {
    document.getElementById('codeErr').textContent = 'Connection error. Please try again.';
  });
}

// ── Populate tier dropdowns ───────────────────────────────────────────────────

function populateTiers() {
  if (!tiers) return;

  for (let t = 1; t <= 4; t++) {
    const sel = document.getElementById(`pTier${t}`);
    sel.innerHTML = '<option value="">Select golfer…</option>';
    (tiers[`tier${t}`] || []).forEach(g => {
      const opt = document.createElement('option');
      opt.value = g.name;
      opt.textContent = `${g.name} (+${g.odds})`;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => maybeShowHype(sel.value));
  }

  const sel5 = document.getElementById('pTier5');
  sel5.innerHTML = '<option value="">No Tier 5 pick</option>';
  (tiers.tier5 || []).forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.name;
    opt.textContent = `${g.name} (+${g.odds})`;
    sel5.appendChild(opt);
  });
  sel5.addEventListener('change', () => maybeShowHype(sel5.value));
}

// ── Submit ────────────────────────────────────────────────────────────────────

async function submitPicks(e) {
  e.preventDefault();

  const name = document.getElementById('pName').value.trim();
  const picks = [];

  for (let t = 1; t <= 4; t++) {
    const val = document.getElementById(`pTier${t}`).value;
    if (!val) {
      document.getElementById('picksErr').textContent = `Please select a Tier ${t} pick.`;
      return;
    }
    picks.push(val);
  }

  const tier5 = document.getElementById('pTier5').value;
  if (tier5) picks.push(tier5);

  document.getElementById('picksErr').textContent = '';
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = 'Submitting…';

  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: accessCode, name, picks })
    });

    const result = await res.json();

    if (!res.ok) {
      document.getElementById('picksErr').textContent = result.error || 'Error submitting picks.';
      btn.disabled = false;
      btn.textContent = 'Submit My Picks';
      return;
    }

    showConfirmation(name, picks);
  } catch (err) {
    document.getElementById('picksErr').textContent = 'Network error. Please try again.';
    btn.disabled = false;
    btn.textContent = 'Submit My Picks';
  }
}

// ── Confirmation ──────────────────────────────────────────────────────────────

function showConfirmation(name, picks) {
  document.getElementById('picksPanel').style.display = 'none';
  document.getElementById('confirmPanel').style.display = 'block';
  document.getElementById('confirmName').textContent = name;
  document.getElementById('confirmBuyIn').textContent = buyInAmount;

  const tierLabels = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5'];
  const container = document.getElementById('confirmPicks');
  container.innerHTML = picks.map((pick, i) => `
    <div class="golfer-card">
      <div style="font-size:0.7rem;color:var(--green);font-weight:700;letter-spacing:0.5px;margin-bottom:4px;text-transform:uppercase">${tierLabels[i]}</div>
      <div class="golfer-name">${pick}</div>
    </div>
  `).join('');
}

// ── Hype toast ────────────────────────────────────────────────────────────────

let hypeTimer = null;

function maybeShowHype(golferName) {
  if (!golferName) return;

  const bank = GOLFER_HYPE[golferName] || FALLBACK_HYPE;
  const hype = bank[Math.floor(Math.random() * bank.length)];

  document.getElementById('hypeIcon').textContent = hype.icon;
  document.getElementById('hypeTitle').textContent = hype.title;
  document.getElementById('hypeMsg').textContent = hype.msg;

  const toast = document.getElementById('hypeToast');
  const bar = document.getElementById('hypeBar');

  // Reset and show
  clearTimeout(hypeTimer);
  bar.style.transition = 'none';
  bar.style.width = '100%';
  toast.classList.remove('hype-toast-out');
  toast.style.display = 'block';

  // Animate the progress bar draining over 4s
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      bar.style.transition = 'width 8s linear';
      bar.style.width = '0%';
    });
  });

  hypeTimer = setTimeout(dismissHype, 8000);
}

function dismissHype() {
  clearTimeout(hypeTimer);
  const toast = document.getElementById('hypeToast');
  toast.classList.add('hype-toast-out');
  setTimeout(() => {
    toast.style.display = 'none';
    toast.classList.remove('hype-toast-out');
  }, 300);
}
