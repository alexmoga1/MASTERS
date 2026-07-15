/* ── Picks submission page ───────────────────────────────────────────────────── */

let accessCode = '';
let tiers = null;
let buyInAmount = 10;

// The Open 2026 first tee — July 16, 2026 6:35am BST = 5:35am UTC
const SUBMISSION_DEADLINE = new Date('2026-07-16T05:35:00Z');

// ── Golfer hype bank ──────────────────────────────────────────────────────────
// Themed for The Open Championship at Royal Birkdale (Southport, England).
// Keys must match the tier names exactly (as sent by /api/tiers).

const GOLFER_HYPE = {
  // ── Tier 1 ──────────────────────────────────────────────────────────────────
  'Scottie Scheffler': [
    { icon: '🟢', title: 'Boring pick. GENIUS pick.', msg: 'World No. 1 at a links course is just unfair. Scottie doesn\'t care about wind, rain, or pot bunkers — he just posts numbers. locked tf in.' },
    { icon: '🏆', title: 'The safe pick that actually wins', msg: 'Everyone else is guessing. You picked the best golfer on the planet to lift the Claret Jug. that\'s not a gamble, that\'s a plan.' },
    { icon: '🫡', title: 'Respectful af pick', msg: 'You looked at the No. 1 player in the world and said yes please. Champion Golfer of the Year energy. we respect it.' }
  ],
  'Rory McIlroy': [
    { icon: '🍀', title: 'FIREEEE!! I love the Rory pick.', msg: 'He\'s already got a Claret Jug (2014) and Birkdale links golf is in his blood. When Rory gets it going in the wind it is genuinely must-watch. this is the year.' },
    { icon: '😤', title: 'Rory in the UK hits different', msg: 'Home soil, roaring crowds, links bounce. Rory feeds off this energy like nobody else. pick goes absolutely crazy.' },
    { icon: '🏆', title: 'THE. YEAR. OF. RORY.', msg: 'Elite ball-striker who can flight it low and dance with the wind. If the weather turns nasty, that\'s exactly when Rory becomes lethal.' }
  ],
  'Jon Rahm': [
    { icon: '🔥', title: 'FIREEEE!! I love the Rahm pick.', msg: 'El Rahmbo plays links golf like a modern-day Seve — creative, fiery, fearless. two-time major winner built for a windy week at Birkdale.' },
    { icon: '😤', title: 'The Spaniard is cooked in 🔥', msg: 'Rahm shows up at majors and goes feral. Give him gnarly weather and a hard links test and he gets even MORE dangerous. STATEMENT pick.' },
    { icon: '💥', title: 'Bold? No. CORRECT.', msg: 'Rahm has the short game and the grit to grind out a links championship. this pick is going to look very, very smart on Sunday.' }
  ],
  'Cameron Young': [
    { icon: '🌟', title: 'CAMERON YOUNG IS ABOUT TO EAT 🍽️', msg: 'Runner-up at the 2022 Open on debut — this man was BORN for links golf. Elite bomber who flies under the radar. terrifying pick.' },
    { icon: '🚀', title: 'Young dawg going off this week', msg: 'He nearly won the Claret Jug at St Andrews as a rookie. Cameron Young + a links course = a genuine sleeper to win the whole thing.' },
    { icon: '🔥', title: 'Sneaky fire pick fr fr', msg: 'Huge off the tee, hungry for a first big title, and proven on links. this is the kind of pick that wins pools.' }
  ],

  // ── Tier 2 ──────────────────────────────────────────────────────────────────
  'Xander Schauffele': [
    { icon: '🏆', title: 'The reigning Champion Golfer said what\'s up', msg: 'Won the Claret Jug at Royal Troon in 2024. He knows exactly how to win an Open now — and that experience is priceless. elite pick.' },
    { icon: '🧊', title: 'Cold-blooded pick, we love it', msg: 'Xander in a major is a different animal. Zero panic, all execution. the man simply shows up when it matters most.' },
    { icon: '💅', title: 'Understated and absolutely correct', msg: 'He doesn\'t make noise, he just wins majors. Defending Open pedigree and a game tailor-made for the wind. SLAY.' }
  ],
  'Bryson DeChambeau': [
    { icon: '🧪', title: 'You picked the mad scientist and we\'re here for it', msg: 'Bryson vs links wind is the physics experiment of the century. He\'ll pull out a spreadsheet and try to solve Royal Birkdale. he might do it.' },
    { icon: '💪', title: 'Big brain, bigger drives', msg: 'US Open champ with speed for days. If he figures out how to keep it under the wind, this Tier 2 pick becomes an absolute steal.' },
    { icon: '🔬', title: 'Main character behavior fr', msg: 'Nobody plays golf like Bryson. Nobody. The crowds in England are going to LOVE the chaos. freak-of-nature pick, meant as a compliment.' }
  ],
  'Ludvig Aberg': [
    { icon: '⚡', title: 'The Viking said "hold my meatballs"', msg: 'A Scandinavian who grew up in the wind and rain? Links golf is basically home. Aberg is a superstar in the making and this pick is dangerous.' },
    { icon: '👀', title: 'Slept-on pick of the pool fr', msg: 'Everyone\'s piling on Scheffler and Rory. You grabbed the 6\'4" Swedish destroyer with an all-world swing. respect the vision.' },
    { icon: '🇸🇪', title: 'ABERG IS BUILT DIFFERENT no cap', msg: 'Calm, powerful, ice in the veins. Exactly the temperament you need to survive a brutal links Sunday. he is NOT to be slept on.' }
  ],
  'Matt Fitzpatrick': [
    { icon: '🧠', title: 'Big brain pick activated', msg: 'A proud Yorkshireman on home soil. Fitz doesn\'t overpower links courses — he out-thinks them. plots his way around like a chess master.' },
    { icon: '🎯', title: 'Home hero energy', msg: 'US Open champion, English through and through, and the galleries will be roaring for him. Fitzpatrick at The Open is always a threat.' },
    { icon: '📐', title: 'Calculated as hell and we respect it', msg: 'Precision golfer who avoids the pot bunkers everyone else finds. On a demanding links, that discipline is a massive edge.' }
  ],
  'Tommy Fleetwood': [
    { icon: '🏠', title: 'SOUTHPORT\'S OWN. THIS IS HIS BACKYARD.', msg: 'Tommy Fleetwood is FROM Southport — Royal Birkdale is basically his home course. The crowd will be absolutely deafening for him. goosebumps pick.' },
    { icon: '💇', title: 'THE HAIR. THE IRONS. THE HOMETOWN.', msg: 'Beautiful ball-striker, elite links game, and 40,000 locals screaming his name. If Tommy wins the Claret Jug HERE the country loses its mind.' },
    { icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', title: 'Destiny pick, no notes', msg: 'The English fan-favorite who\'s been knocking on the door of a major forever. A home Open at Birkdale might just be the fairytale. UNREAL pick.' }
  ],

  // ── Tier 3 ──────────────────────────────────────────────────────────────────
  'Brooks Koepka': [
    { icon: '😤', title: 'KOEPKA IN A MAJOR IS LITERALLY CHEATING', msg: 'Five majors. FIVE. The man treats major weeks like his personal hunting ground. you picked a serial killer of golf tournaments.' },
    { icon: '🔪', title: 'Stone cold killer energy', msg: 'Brooks doesn\'t care about vibes, he cares about trophies. Big, strong, and mentally bulletproof — exactly what a links grind demands.' },
    { icon: '💀', title: 'Major mode activated, everybody run', msg: 'Something switches on in Koepka when a major starts. Scientists can\'t explain it. You don\'t need to. just enjoy it.' }
  ],
  'Collin Morikawa': [
    { icon: '🏆', title: 'CLARET JUG WINNER ON DEBUT, HELLO??', msg: 'Morikawa won The Open the very first time he played it (2021). The man just gets links golf immediately. ridiculous pick value here.' },
    { icon: '🤖', title: 'The most precise iron player alive', msg: 'Flag-hunting machine who controls his ball flight better than anyone. On a windy links, that control is worth its weight in gold.' },
    { icon: '🔥', title: 'Clinical pick and we mean that as a compliment', msg: 'Two majors, zero fear, and a proven Open champion. When Morikawa\'s irons are dialed, nobody in the field can hang.' }
  ],
  'Justin Rose': [
    { icon: '🌹', title: 'THE BIRKDALE LEGEND RETURNS', msg: 'Justin Rose announced himself to the world at Royal Birkdale in 1998 — holing out on 18 as a 17-year-old amateur to finish T4. This place is sacred to him. chills.' },
    { icon: '🏆', title: 'Full-circle story pick', msg: 'US Open champion, Olympic gold medalist, and a man with genuine history at this exact course. Rose at Birkdale is pure romance and real danger.' },
    { icon: '😌', title: 'Quiet confidence pick', msg: 'Ageless ball-striker who still shows up at majors. Coming back to where it all began? don\'t be shocked if he goes low.' }
  ],
  'Russell Henley': [
    { icon: '🎯', title: 'The quiet assassin nobody talks about', msg: 'Henley just keeps posting top finishes while everyone ignores him. Precise, patient, perfect temperament for a links slog. sleeper found.' },
    { icon: '📊', title: 'Insane value pick if you look at the data', msg: 'Consistent as they come and flies completely under the radar. That\'s exactly the type that hangs around a leaderboard all week.' },
    { icon: '🕵️', title: 'You did your research and it shows', msg: 'Most people skip right past Henley. You didn\'t. that\'s what separates pool winners from the Scheffler-and-done crowd.' }
  ],
  'Justin Thomas': [
    { icon: '💥', title: 'JT IS COMING FOR BLOOD THIS WEEK', msg: 'Two-time major champ with a chip on his shoulder. When Justin Thomas gets hot he is genuinely unstoppable. this pick has real upside.' },
    { icon: '🔥', title: 'Motivated JT is a terrifying thing', msg: 'He\'s been grinding his way back to the top and a Claret Jug would complete the picture. don\'t sleep on his links ceiling.' },
    { icon: '😤', title: 'The comeback narrative is so good', msg: 'If it clicks for JT at Birkdale, you\'re going to be LOUD about this pick. and rightfully so.' }
  ],
  'Patrick Cantlay': [
    { icon: '🧊', title: 'THE ICEMAN. This is not a game.', msg: 'Cantlay putts like he\'s got liquid nitrogen in his veins. The patience he brings is exactly what a links championship rewards.' },
    { icon: '😶', title: 'Zero emotion, all results', msg: 'Doesn\'t celebrate, doesn\'t flinch, just makes birdie after birdie. robotically excellent — perfect for a grind-it-out week.' },
    { icon: '🎯', title: 'Under the radar, about to blow up the board', msg: 'Nobody\'s talking about Cantlay this week. he prefers it that way. your pick does the talking for you.' }
  ],
  'Viktor Hovland': [
    { icon: '🇳🇴', title: 'HOVLAND IS BACK BABY', msg: 'A Norwegian who grew up hitting balls indoors through brutal winters — cold and wind don\'t scare this man one bit. great links pick.' },
    { icon: '⚡', title: 'Scandinavian destroyer mode: ENGAGED', msg: 'When Hovland\'s game is on, he\'s a top-5 player on the planet with the biggest smile in golf. dangerous and delightful.' },
    { icon: '🔥', title: 'The comeback arc hits different', msg: 'People doubted him during a rough patch. You didn\'t. if he catches fire at Birkdale that pick feels incredible.' }
  ],

  // ── Tier 4 ──────────────────────────────────────────────────────────────────
  'Si Woo Kim': [
    { icon: '✨', title: 'SI WOO DOES NOT MISS IN A BIG MOMENT', msg: 'Players Championship winner with the guts to pull off shots nobody else would try. wild-card energy but make it elite.' },
    { icon: '🎲', title: 'Chaotic good pick, we love it', msg: 'Si Woo plays with a freedom that\'s genuinely dangerous on a links, where creativity wins. nobody knows what he\'s capable of.' },
    { icon: '🎪', title: 'Unpredictable player, thrilling pick', msg: 'He\'ll do something this week that makes you scream at your phone. buckle up — it\'s going to be a ride.' }
  ],
  'Chris Gotterup': [
    { icon: '🎯', title: 'NICE — Gotterup is about to cook the whole field.', msg: 'This man just WINS on links-style setups when nobody\'s watching. Sleeper of the tournament and you found him first. genius.' },
    { icon: '🚀', title: 'This pick ages like fine wine', msg: 'Big hitter, red-hot form, zero expectations. that\'s the perfect recipe for a surprise Open run.' },
    { icon: '👀', title: 'You saw something nobody else did', msg: 'Everyone\'s ignoring Gotterup. When he goes deep this week you look like an absolute prophet.' }
  ],
  'Tyrrell Hatton': [
    { icon: '😡', title: 'THE ANGRIEST MAN IN GOLF (WE LOVE HIM)', msg: 'Englishman who plays links golf with pure fire — and might snap a club in half doing it. elite ball-striker, elite entertainment. great pick.' },
    { icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', title: 'Home crowd, home game', msg: 'Hatton grew up on courses just like this. Give him wind and firm turf and he thrives. the galleries will be right behind him.' },
    { icon: '🎯', title: 'Rage-fueled precision pick', msg: 'All the mutter and the muttering aside, Hatton is a seriously good major player. this pick has real bite.' }
  ],
  'Nicolai Hojgaard': [
    { icon: '🇩🇰', title: 'THE DANE IS COMING AND NOBODY IS READY', msg: 'A big-hitting Scandinavian raised in the wind. Højgaard is one of the most underrated players in the world and you just found him.' },
    { icon: '🔥', title: 'Højgaard said "let me cook"', msg: 'Huge game, huge upside, zero pressure this week. that combination at a links Open is genuinely dangerous. great find.' },
    { icon: '🌊', title: 'Sleeper alert of the tournament', msg: 'Outside the golf-nerd circle nobody knows him yet. By Sunday they might. and you called it first.' }
  ],
  'Min Woo Lee': [
    { icon: '🎪', title: 'MIN WOO IS ABOUT TO DO SOMETHING INSANE', msg: 'And you\'ll be right there for it. He plays golf like he\'s performing for a sold-out crowd. absolute vibe pick, no notes.' },
    { icon: '🎨', title: 'Most entertaining pick in the pool', msg: 'Min Woo doesn\'t just make birdies, he makes MOMENTS. This week is going to be a movie and you picked a lead role.' },
    { icon: '🔥', title: 'Fearless pick, fearless golfer', msg: 'He plays like he has nothing to lose — the most dangerous thing in golf. incredible pick fr fr.' }
  ],
  'Jordan Spieth': [
    { icon: '💚', title: 'THE 2017 BIRKDALE CHAMPION IS BACK AT BIRKDALE', msg: 'Spieth won The Open right here in 2017 — including THAT unreal bogey save off the driving range on 13. this course owes him nothing and he owes it everything. LEGENDARY pick.' },
    { icon: '🎩', title: 'History is repeating itself pick', msg: 'A former Champion Golfer returning to the exact links where he lifted the Jug. Spieth\'s short-game wizardry is tailor-made for Birkdale.' },
    { icon: '🔥', title: 'Romantic pick and we mean it respectfully', msg: 'When Spieth gets the magic going on a links, it\'s genuinely special TV. picking him here is picking pure history.' }
  ],
  'Robert MacIntyre': [
    { icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', title: 'A LEFTY SCOTSMAN ON LINKS?? SAY LESS.', msg: 'MacIntyre was raised on Scottish links in the wind and rain. This is his natural habitat. huge heart, huge game, home-nation roars. we\'re rooting hard.' },
    { icon: '🏹', title: 'The Scottish longbow is loaded', msg: 'Left-hander with elite creativity and zero fear of bad weather. Bob MacIntyre in the UK is a genuine dark horse to win it all.' },
    { icon: '⚡', title: 'Inspired pick, trending at the right time', msg: 'He\'s been climbing fast and links golf suits him perfectly. if he catches a run this week you look like a genius.' }
  ],

  // ── Tier 5 ──────────────────────────────────────────────────────────────────
  'Shane Lowry': [
    { icon: '🏆', title: 'THE CLARET JUG WINNER HAS ENTERED THE CHAT', msg: 'Lowry won The Open at Portrush in 2019 in an absolute STORM and didn\'t blink. Bad weather at Birkdale? he\'ll be licking his lips. Tier 5 STEAL.' },
    { icon: '☘️', title: 'Big-moment, big-heart pick', msg: 'The Irishman plays links golf with pure soul and thrives when it\'s ugly out there. this is elite value for a Tier 5.' },
    { icon: '🎯', title: 'Champion Golfer pedigree at Tier 5 price', msg: 'A proven Open winner sitting in the longshot tier? that\'s just good business. love this pick.' }
  ],
  'Cameron Smith': [
    { icon: '🏆', title: 'ST ANDREWS CHAMPION, LINKS WIZARD', msg: 'Cam Smith won The Open in 2022 with the best short game on the planet. Links golf is his art form. absurd value at Tier 5.' },
    { icon: '🎨', title: 'The mullet said "I do this"', msg: 'Nobody gets up-and-down like Smith and nobody reads links greens better. a former Champion Golfer at longshot odds is a gift.' },
    { icon: '🔥', title: 'Sneaky-elite Tier 5 pick', msg: 'Whatever the doubts, when Cam Smith is dialed on a links he can win any week. huge upside here.' }
  ],
  'J.J. Spaun': [
    { icon: '🏆', title: 'THE REIGNING US OPEN CHAMP AT TIER 5??', msg: 'Spaun won the 2025 US Open at brutal Oakmont in the rain — this man can grind through anything. absurd value down here. bold and brilliant.' },
    { icon: '💧', title: 'Bad-weather warrior pick', msg: 'He proved at Oakmont he can win a major in miserable conditions. a windy Birkdale won\'t faze him one bit.' },
    { icon: '🎲', title: 'Best longshot in the pool, arguably', msg: 'A current major champion sitting in Tier 5 is a genuine cheat code. you found it.' }
  ],
  'Adam Scott': [
    { icon: '🟡', title: 'A FORMER MAJOR CHAMP IS NEVER A BAD PICK', msg: 'The smoothest swing in golf, and a man who came agonizingly close at Lytham in 2012. Adam Scott has unfinished links business. veteran value.' },
    { icon: '🎩', title: 'The most elegant pick in the pool', msg: 'Scott\'s ball-striking is still genuinely beautiful and links golf rewards beauty. don\'t write off the classics.' },
    { icon: '⛳', title: 'Timeless talent, timeless pick', msg: 'People keep counting him out and he keeps showing up at majors. this could be the week that quiets everyone.' }
  ],
  'Hideki Matsuyama': [
    { icon: '🌸', title: 'A MAJOR CHAMPION WITH ICE IN HIS VEINS', msg: 'Masters winner with an all-world iron game and zero panic. Hideki grinding out a links Open is completely on the table. fire Tier 5 pick.' },
    { icon: '🎌', title: 'Quiet killer energy', msg: 'Matsuyama says nothing and just stripes it. On a demanding links, that steadiness is worth everything.' },
    { icon: '⛳', title: 'Elite ball-striker at longshot value', msg: 'A proven major winner this far down the board is a genuine bargain. respect the pick.' }
  ],
  'Wyndham Clark': [
    { icon: '💥', title: 'US OPEN CHAMP IN TIER 5, LET\'S GO', msg: 'Clark won the 2023 US Open and bombs it a mile. If he keeps it in play at Birkdale, this longshot has serious teeth.' },
    { icon: '🚀', title: 'Big game, big value', msg: 'A major already on the résumé and the power to overwhelm a course. that\'s a scary Tier 5 pick.' }
  ],
  'Dustin Johnson': [
    { icon: '🏌️', title: 'DJ AT TIER 5 IS ROBBERY', msg: 'Former World No. 1, major champion, and a man who\'s contended at Opens for years. the talent never really leaves. sneaky pick.' },
    { icon: '😎', title: 'Unbothered legend energy', msg: 'Nothing rattles DJ. Wind, rain, pressure — he shrugs it all off. that temperament is perfect for a links Sunday.' }
  ],
  'Gary Woodland': [
    { icon: '🧠', title: 'THE COMEBACK STORY YOU WANT TO ROOT FOR', msg: 'A US Open champion who fought back from brain surgery to compete again. Woodland\'s got perspective and power. inspired pick.' },
    { icon: '💪', title: 'Resilience personified', msg: 'If anyone can grind through a brutal links test, it\'s a man who\'s already beaten far bigger battles. love this one.' }
  ],
  'Keegan Bradley': [
    { icon: '🇺🇸', title: 'THE PLAYING CAPTAIN ENERGY IS UNMATCHED', msg: 'Major champion, Ryder Cup captain, and playing some of the best golf of his life. Bradley\'s intensity travels well to a links. great value.' },
    { icon: '🔥', title: 'Motivated Keegan is dangerous', msg: 'He\'s got a point to prove every time he tees it up. that fire is exactly what you want in a longshot.' }
  ],
  'Jason Day': [
    { icon: '🌊', title: 'FORMER WORLD NO. 1 AT TIER 5', msg: 'Major champion with a gorgeous, controlled ball flight that suits the wind. When Day\'s healthy and hot he can win anywhere. terrific value.' },
    { icon: '🎯', title: 'Veteran class, longshot price', msg: 'Jason Day knows how to manage a hard golf course. don\'t be surprised if he lingers on the leaderboard all week.' }
  ],
  'Rickie Fowler': [
    { icon: '🧡', title: 'RICKIE LOVES A LINKS AND WE LOVE RICKIE', msg: 'Multiple Open top-5s — Fowler has always shown up at this championship. the fan-favorite with real links pedigree. great vibes pick.' },
    { icon: '🎯', title: 'The people\'s champ pick', msg: 'Crowds adore him and he plays his best when he\'s enjoying it. a hot Rickie week at Birkdale would be a blast.' }
  ],
  'Joaquin Niemann': [
    { icon: '🇨🇱', title: 'THE CHILEAN FIREWORK', msg: 'One of the most explosive talents in the game. If Niemann finally cracks the major code, this Tier 5 pick pays off enormously.' },
    { icon: '🚀', title: 'Ceiling-for-days pick', msg: 'Niemann can go supernova on any given week. betting on that upside in the longshot tier is smart pool strategy.' }
  ],
  'Sungjae Im': [
    { icon: '🎯', title: 'THE IRON MAN OF GOLF', msg: 'Sungjae plays more golf than anyone and grinds like nobody else. that stamina and consistency is perfect for a four-day links war.' },
    { icon: '📊', title: 'Consistency at longshot value', msg: 'He\'s always around the top of leaderboards. Tier 5 for a player this steady is genuinely good business.' }
  ],
  'Corey Conners': [
    { icon: '🍁', title: 'THE MOST ACCURATE MAN IN THE FIELD. ON A LINKS. HELLO??', msg: 'Where missing fairways gets you buried in pot bunkers, you picked the guy who never misses fairways. that\'s not a pick, that\'s a SCHEME.' },
    { icon: '🎯', title: 'The Canadian metronome is locked in', msg: 'Conners doesn\'t beat himself. On a course that punishes mistakes mercilessly, that discipline is a massive edge. great pick.' }
  ],
  'Ryan Fox': [
    { icon: '🇳🇿', title: 'THE KIWI KNOWS WIND', msg: 'Ryan Fox grew up battling gusts and plays links golf with total comfort. a genuinely dangerous longshot when the weather turns. love it.' },
    { icon: '💪', title: 'Big-hitting, big-hearted pick', msg: 'Fox has been winning around the world and thrives on tough setups. sneaky-good Tier 5 value.' }
  ],
  'Sam Burns': [
    { icon: '🔥', title: 'Dark horse pick fr fr', msg: 'Burns has the firepower and the putter to catch fire for a week. this might genuinely be that week. fire pick.' },
    { icon: '🎯', title: 'Louisiana heat meets links chill', msg: 'Bombs it, makes everything on the greens. if the putter\'s hot at Birkdale, watch out. great value pick.' }
  ],
  'Maverick McNealy': [
    { icon: '📈', title: 'MOST IMPROVED MAN YOU COULD PICK', msg: 'McNealy\'s trajectory screams breakthrough. Smart, athletic, trending up — you might be picking him at exactly the right time.' },
    { icon: '🚀', title: 'High-flying longshot with real upside', msg: 'Nobody expects a Maverick McNealy run this week. that\'s exactly why this pick slaps so hard.' }
  ],
  'Haotong Li': [
    { icon: '🐉', title: 'BIRKDALE HAS BEEN GOOD TO HIM', msg: 'Haotong Li finished 3rd at Royal Birkdale in the 2017 Open — this man has genuine history at this exact course. massive sleeper pick.' },
    { icon: '🔥', title: 'The links dark horse', msg: 'He\'s produced his best golf at The Open before. betting on that pedigree in Tier 5 is genuinely shrewd. respect.' }
  ],
  'Patrick Reed': [
    { icon: '😈', title: 'Villain arc pick and we are HERE', msg: 'Captain America thrives when the whole crowd is against him — and a UK gallery will let him hear it. major champ with real grit. bold pick.' },
    { icon: '🎭', title: 'Chaos energy, championship pedigree', msg: 'Love him or hate him, Reed knows how to win majors and grind out hard rounds. your pick might just be the story of the week.' }
  ],
  'Aldrich Potgieter': [
    { icon: '💥', title: 'THE YOUNG SOUTH AFRICAN BOMBER', msg: 'One of the longest hitters on tour and utterly fearless. Potgieter is a wild-card longshot with a genuinely huge ceiling. love the swing.' },
    { icon: '🚀', title: 'Boom-or-bust, and we\'re here for it', msg: 'If the driver behaves, this kid can overpower a golf course. maximum-upside Tier 5 pick.' }
  ],
  'Alex Fitzpatrick': [
    { icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', title: 'THE OTHER FITZPATRICK CAN PLAY TOO', msg: 'Matt\'s little brother is a proper talent in his own right, and he\'ll have the home crowd behind him. sneaky English longshot.' },
    { icon: '👀', title: 'Home-soil sleeper', msg: 'Alex has links golf in his blood just like his brother. don\'t be shocked if he hangs around this week.' }
  ]
};

// Fallback messages for any golfer not in the list — Open-themed
const FALLBACK_HYPE = [
  { icon: '🏆', title: 'FIREEEE!! That pick goes crazy.', msg: 'Links golf turns longshots into legends. The rest of the pool is going to be checking who you picked. elite energy.' },
  { icon: '🌬️', title: 'Bold pick. We see you.', msg: 'A grinder who thrives when the wind howls and the course bites back. you didn\'t play it safe and we respect it.' },
  { icon: '💅', title: 'Slay pick, no notes', msg: 'The kind of dark horse that lifts the Claret Jug out of nowhere. going to look very smart by Sunday.' },
  { icon: '🧠', title: 'Big brain move fr', msg: 'Everyone else chased the favorites. You found value in the field. that\'s how pools get won.' },
  { icon: '😤', title: 'This pick has main character energy', msg: 'You\'re not here to participate, you\'re here to WIN. one hot week on this links and you\'re a genius. respect the vision.' }
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
      opt.textContent = g.odds != null ? `${g.name} (+${g.odds})` : g.name;
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
