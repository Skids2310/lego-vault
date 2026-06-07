import { useState, useEffect } from "react";

const SUPABASE_URL = "https://xxphodciijtmxldnqazz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4cGhvZGNpaWp0bXhsZG5xYXp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjQzNTcsImV4cCI6MjA5NjQwMDM1N30.Y0J_9RFfULkr_tYZMPbb4XF9Dcg5yJmJNa1_so972OY";
const RECORD_ID = 1; // single row stores all sets as JSON
const ADMIN_PASSWORD = "legovault2024"; // change this to whatever you like

async function dbLoad() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/sets?id=eq.${RECORD_ID}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  const rows = await res.json();
  return rows?.[0]?.data ? JSON.parse(rows[0].data) : null;
}

async function dbSave(data) {
  const body = JSON.stringify({ id: RECORD_ID, data: JSON.stringify(data) });
  // Upsert: insert or update in one call
  await fetch(`${SUPABASE_URL}/rest/v1/sets`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal"
    },
    body
  });
}

const THEMES = ["Architecture","Botanicals","City","Classic","Creator","Creator Expert","Harry Potter","Icons","Ideas","Ikea","Marvel","Monkie Kid","Other","Seasonal","Speed Champions","Sports","Star Wars","Technic","The Lego Movie 2","Xtra"];
const STATUS_OPTIONS = ["Sealed","Built","Displayed","Stored","Incomplete","Wanted"];
const STATUS_COLORS = { Sealed:"#22c55e", Built:"#3b82f6", Displayed:"#a855f7", Stored:"#f59e0b", Incomplete:"#ef4444", Wanted:"#ec4899" };
const EMPTY_FORM = { name:"", setNumber:"", theme:"City", year:"", pieces:"", status:"Built", notes:"", rating:0, imageUrl:"", folder:"", purchasePrice:"", currentValue:"" };
const TABS = ["Collection","Wishlist","Minifigures","Hogwarts"];

const THEME_COLORS = {
  "Harry Potter": "#7b2d8b",
  "City": "#0d6efd",
  "Creator Expert": "#c1121f",
  "Icons": "#c1121f",
  "Creator": "#fd7e14",
  "Classic": "#ffc107",
  "Botanicals": "#2d8b4e",
  "Architecture": "#6c757d",
  "Ideas": "#20c997",
  "Technic": "#e63946",
  "Star Wars": "#212529",
  "Marvel": "#e63946",
  "Speed Champions": "#fd7e14",
  "Seasonal": "#20c997",
  "Sports": "#0d6efd",
  "Other": "#6c757d",
  "Ikea": "#0057a8",
  "Monkie Kid": "#e63946",
  "The Lego Movie 2": "#ffc107",
  "Xtra": "#6c757d",
};

// Hogwarts locations and which sets cover them
const HOGWARTS_LOCATIONS = [
  { name:"Great Hall", sets:["75954","76435"], icon:"🍽️" },
  { name:"Astronomy Tower", sets:["75969"], icon:"🔭" },
  { name:"Clock Tower", sets:["75948"], icon:"🕰️" },
  { name:"Chamber of Secrets", sets:["76389"], icon:"🐍" },
  { name:"Room of Requirement", sets:["75966","76413","40770"], icon:"🚪" },
  { name:"Hospital Wing", sets:["76398","76463"], icon:"🏥" },
  { name:"Dumbledore's Office", sets:["76402","30724"], icon:"🦅" },
  { name:"Potions Class", sets:["76383","76431","76464"], icon:"⚗️" },
  { name:"Herbology Class", sets:["76384","76445"], icon:"🌿" },
  { name:"Charms Class", sets:["76385","76442"], icon:"✨" },
  { name:"Transfiguration Class", sets:["76382"], icon:"🦁" },
  { name:"Defence Class", sets:["76397"], icon:"🛡️" },
  { name:"Divination Class", sets:["76396"], icon:"🔮" },
  { name:"Flying Lessons", sets:["76395","76447"], icon:"🧹" },
  { name:"Whomping Willow", sets:["75953","76407"], icon:"🌳" },
  { name:"Gryffindor Common Room", sets:["40452"], icon:"🦁" },
  { name:"Boathouse", sets:["76426"], icon:"⛵" },
  { name:"Owlery", sets:["76430"], icon:"🦉" },
  { name:"Grand Staircase", sets:["40577"], icon:"🪜" },
  { name:"Courtyard", sets:["76401"], icon:"🏰" },
  { name:"Hogwarts Castle (full)", sets:["4757","71043","76419","76454"], icon:"🏰" },
  { name:"Hogwarts Grounds", sets:["76419"], icon:"🌲" },
];

const LEGO_BRICK_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='50' viewBox='0 0 60 50'>
  <rect x='2' y='14' width='56' height='34' rx='3' fill='none' stroke='%23ffffff' stroke-width='1.5' opacity='0.15'/>
  <rect x='8' y='8' width='14' height='10' rx='3' fill='none' stroke='%23ffffff' stroke-width='1.5' opacity='0.15'/>
  <rect x='24' y='8' width='14' height='10' rx='3' fill='none' stroke='%23ffffff' stroke-width='1.5' opacity='0.15'/>
  <rect x='40' y='8' width='14' height='10' rx='3' fill='none' stroke='%23ffffff' stroke-width='1.5' opacity='0.15'/>
</svg>`;
const BRICK_BG = `url("data:image/svg+xml,${LEGO_BRICK_SVG}")`;

function legoUrl(setNumber, name) {
  if (!setNumber) return null;
  const num = setNumber.includes("-") ? setNumber.split("-")[0] : setNumber;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `https://www.lego.com/en-au/product/${slug}-${num}`;
}

function getImageUrls(setNumber) {
  if (!setNumber) return [];
  const n = setNumber.trim();
  const withSuffix = n.includes("-") ? n : n + "-1";
  return [
    `https://images.brickset.com/sets/images/${withSuffix}.jpg`,
    `https://images.brickset.com/sets/small/${withSuffix}.jpg`,
    `https://cdn.rebrickable.com/media/sets/${withSuffix}.jpg`,
  ];
}

function SetImage({ setNumber, imageUrl, size = "card" }) {
  const [srcIndex, setSrcIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const urls = imageUrl ? [imageUrl] : getImageUrls(setNumber);
  const h = size === "card" ? "160px" : "120px";
  useEffect(() => { setSrcIndex(0); setFailed(false); }, [setNumber, imageUrl]);
  function onError() {
    if (srcIndex + 1 < urls.length) setSrcIndex(i => i + 1);
    else setFailed(true);
  }
  if (!urls.length || failed) return (
    <div style={{ height:h, background:"#0a0a14", borderRadius:size==="card"?"8px 8px 0 0":"8px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontSize:"1.5rem" }}>🧱</div>
    </div>
  );
  return (
    <div style={{ height:h, overflow:"hidden", borderRadius:size==="card"?"8px 8px 0 0":"8px", background:"#fff" }}>
      <img src={urls[srcIndex]} alt="" onError={onError} style={{ width:"100%", height:"100%", objectFit:"contain", display:"block" }} />
    </div>
  );
}

const SEED_DATA = [{"id":"1700000000000","name":"Microscale Ginderbread House","setNumber":"40337","theme":"Creator","year":"2019","pieces":"499","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"0","addedAt":1700000000000},{"id":"1700000001000","name":"Drag Racer","setNumber":"40408","theme":"Creator","year":"2020","pieces":"134","status":"Built","notes":"Minifigs: Drag Racer Driver","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"1","addedAt":1700000001000},{"id":"1700000002000","name":"Creative Fun 12-in-1","setNumber":"40411","theme":"Creator","year":"2020","pieces":"240","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"0","addedAt":1700000002000},{"id":"1700000003000","name":"Yellow Taxi","setNumber":"40468","theme":"Creator","year":"2021","pieces":"124","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"0","addedAt":1700000003000},{"id":"1700000004000","name":"Swing Ship Ride","setNumber":"6373620","theme":"Creator","year":"2021","pieces":"152","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"0","addedAt":1700000004000},{"id":"1700000005000","name":"Winter Holiday Train","setNumber":"30584","theme":"Creator","year":"2022","pieces":"73","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"0","addedAt":1700000005000},{"id":"1700000006000","name":"Magical Unicorn","setNumber":"31140","theme":"Creator","year":"2023","pieces":"145","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"0","addedAt":1700000006000},{"id":"1700000007000","name":"Red Dragon","setNumber":"31145","theme":"Creator","year":"2024","pieces":"149","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"0","addedAt":1700000007000},{"id":"1700000008000","name":"Winter Holiday Train","setNumber":"40700","theme":"Creator","year":"2024","pieces":"294","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"0","addedAt":1700000008000},{"id":"1700000009000","name":"Wild Animals: Surprising Spdier","setNumber":"31159","theme":"Creator","year":"2025","pieces":"153","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"0","addedAt":1700000009000},{"id":"1700000010000","name":"Celebration: Ferris Wheel with Fireworks","setNumber":"40558","theme":"Creator","year":"2025","pieces":"230","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"0","addedAt":1700000010000},{"id":"1700000011000","name":"Vintage Taxi","setNumber":"40532","theme":"Icons","year":"2022","pieces":"163","status":"Built","notes":"Minifigs: Taxi Driver","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"1","addedAt":1700000011000},{"id":"1700000012000","name":"Moving Truck","setNumber":"40586","theme":"Icons","year":"2023","pieces":"301","status":"Built","notes":"Minifigs: Male Mover, Female Mover","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"2","addedAt":1700000012000},{"id":"1700000013000","name":"Retro Food Truck","setNumber":"40681","theme":"Icons","year":"2024","pieces":"310","status":"Built","notes":"Minifigs: Food Truck Vendor","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"1","addedAt":1700000013000},{"id":"1700000014000","name":"Up-Scaled Baby Astronaut","setNumber":"40767","theme":"Icons","year":"2025","pieces":"250","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"0","addedAt":1700000014000},{"id":"1700000015000","name":"Space Rocket Ride","setNumber":"40335","theme":"Ideas","year":"2019","pieces":"154","status":"Built","notes":"Minifigs: Male child figure","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"1","addedAt":1700000015000},{"id":"1700000016000","name":"Friendly Snails","setNumber":"40788","theme":"Ideas","year":"2025","pieces":"264","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"0","addedAt":1700000016000},{"id":"1700000017000","name":"Ikea BYGGLEK","setNumber":"40357","theme":"Ikea","year":"2020","pieces":"201","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"0","addedAt":1700000017000},{"id":"1700000018000","name":"Monkie Kid's Delivery Bike","setNumber":"30341","theme":"Monkie Kid","year":"2020","pieces":"22","status":"Built","notes":"Minifigs: Monkie Kid","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"1","addedAt":1700000018000},{"id":"1700000019000","name":"Wedding Favor Set","setNumber":"40197","theme":"Other","year":"2018","pieces":"132","status":"Built","notes":"Minifigs: Bride, Groom","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"2","addedAt":1700000019000},{"id":"1700000020000","name":"Children's Amusement Park","setNumber":"40529","theme":"Other","year":"2022","pieces":"170","status":"Built","notes":"Minifigs: Boy with red cap, Girl with pigtails","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"2","addedAt":1700000020000},{"id":"1700000021000","name":"Jane Goodall Tribute","setNumber":"40530","theme":"Other","year":"2022","pieces":"276","status":"Built","notes":"Minifigs: Jane Goodall","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"1","addedAt":1700000021000},{"id":"1700000022000","name":"Santa's Workshop","setNumber":"40565","theme":"Other","year":"2022","pieces":"329","status":"Built","notes":"Minifigs: Santa Claus, Elf","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"2","addedAt":1700000022000},{"id":"1700000023000","name":"Ray the Castaway","setNumber":"40566","theme":"Other","year":"2022","pieces":"239","status":"Built","notes":"Minifigs: Castaway","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"1","addedAt":1700000023000},{"id":"1700000024000","name":"Blacktron Crusier","setNumber":"40580","theme":"Other","year":"2023","pieces":"356","status":"Built","notes":"Minifigs: Blacktron Space Pilot","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"1","addedAt":1700000024000},{"id":"1700000025000","name":"Fun Creativity 12-in-1","setNumber":"40593","theme":"Other","year":"2023","pieces":"279","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"0","addedAt":1700000025000},{"id":"1700000026000","name":"Retro Record Player","setNumber":"40699","theme":"Other","year":"2024","pieces":"310","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"0","addedAt":1700000026000},{"id":"1700000027000","name":"Ballerina & Nutcracker Scene","setNumber":"40701","theme":"Other","year":"2024","pieces":"244","status":"Built","notes":"Minifigs: Ballerina","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"1","addedAt":1700000027000},{"id":"1700000028000","name":"Easter Egg","setNumber":"40371","theme":"Seasonal","year":"2020","pieces":"239","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"0","addedAt":1700000028000},{"id":"1700000029000","name":"Lunar New Year VIP Add-On Pack","setNumber":"40605","theme":"Seasonal","year":"2023","pieces":"124","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"0","addedAt":1700000029000},{"id":"1700000030000","name":"Jack-O'-Lantern Pickup Truck","setNumber":"40822","theme":"Seasonal","year":"2025","pieces":"177","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"0","addedAt":1700000030000},{"id":"1700000031000","name":"1974 Porsche 911 Turbo 3.0","setNumber":"75895","theme":"Speed Champions","year":"2019","pieces":"197","status":"Built","notes":"Minifigs: Porsche Driver","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"1","addedAt":1700000031000},{"id":"1700000032000","name":"First Order Stormtrooper","setNumber":"75114","theme":"Star Wars","year":"2016","pieces":"81","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"0","addedAt":1700000032000},{"id":"1700000033000","name":"RC Tracked Racer","setNumber":"42065","theme":"Technic","year":"2017","pieces":"370","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"0","addedAt":1700000033000},{"id":"1700000034000","name":"Volvo Wheel Loader","setNumber":"30433","theme":"Technic","year":"2022","pieces":"69","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"0","addedAt":1700000034000},{"id":"1700000035000","name":"Emmet's Builder Box!","setNumber":"70832","theme":"The Lego Movie 2","year":"2018","pieces":"125","status":"Built","notes":"Minifigs: Emmet","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"1","addedAt":1700000035000},{"id":"1700000036000","name":"Traffic Lights","setNumber":"40311","theme":"Xtra","year":"2018","pieces":"46","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"0","addedAt":1700000036000},{"id":"1700000037000","name":"Streetlamps","setNumber":"40312","theme":"Xtra","year":"2018","pieces":"34","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"0","addedAt":1700000037000},{"id":"1700000038000","name":"Natural History Museum","setNumber":"10326","theme":"Icons","year":"2024","pieces":"4014","status":"Built","notes":"Minifigs: Museum curator, Scientist, Security guard, 4 visitors","rating":0,"imageUrl":"","folder":"Black","minifigs":"7","addedAt":1700000038000},{"id":"1700000039000","name":"Parisian Restaurant","setNumber":"10243","theme":"Creator Expert","year":"2014","pieces":"2469","status":"Built","notes":"Minifigs: Chef, Waiter, Female guest, Male guest, Artist with paintbrush","rating":0,"imageUrl":"","folder":"Green","minifigs":"5","addedAt":1700000039000},{"id":"1700000040000","name":"Assembly Square","setNumber":"10255","theme":"Creator Expert","year":"2017","pieces":"4002","status":"Built","notes":"Minifigs: Baker, Florist, Caf\u00e9 waiter, Musician, Photographer, Dentist, Ballet dancer, Baby","rating":0,"imageUrl":"","folder":"Green","minifigs":"8","addedAt":1700000040000},{"id":"1700000041000","name":"Downtown Diner","setNumber":"10260","theme":"Creator Expert","year":"2018","pieces":"2480","status":"Built","notes":"Minifigs: Chef, Waitress on roller skates, Rockabilly singer/boxer","rating":0,"imageUrl":"","folder":"Green","minifigs":"3","addedAt":1700000041000},{"id":"1700000042000","name":"Corner Garage","setNumber":"10264","theme":"Creator Expert","year":"2019","pieces":"2569","status":"Built","notes":"Minifigs: Gas station owner/mechanic, Vet, Woman in blue jacket, Man with scooter helmet, Tow truck driver, Girl with dog","rating":0,"imageUrl":"","folder":"Green","minifigs":"6","addedAt":1700000042000},{"id":"1700000043000","name":"Bookshop (Birch Books)","setNumber":"10270","theme":"Creator Expert","year":"2020","pieces":"2504","status":"Built","notes":"Minifigs: Man in green sweater, Woman in dark red coat, Young boy, Young girl, Older man in brown vest","rating":0,"imageUrl":"","folder":"Green","minifigs":"5","addedAt":1700000043000},{"id":"1700000044000","name":"Police Station","setNumber":"10278","theme":"Icons","year":"2021","pieces":"2923","status":"Built","notes":"Minifigs: Police chief, 2 officers, Reporter, Donut thief","rating":0,"imageUrl":"","folder":"Green","minifigs":"5","addedAt":1700000044000},{"id":"1700000045000","name":"Boutique Hotel","setNumber":"10297","theme":"Icons","year":"2022","pieces":"3066","status":"Built","notes":"Minifigs: Hotel manager, Receptionist, Bellboy, Bartender, Tourist, Artist, Hotel guest","rating":0,"imageUrl":"","folder":"Green","minifigs":"7","addedAt":1700000045000},{"id":"1700000046000","name":"Jazz Club","setNumber":"10312","theme":"Icons","year":"2023","pieces":"2899","status":"Built","notes":"Minifigs: Jazz singer, Bassist, Drummer, Magician, Pizza chef, Waitress, Club owner, Customer","rating":0,"imageUrl":"","folder":"Green","minifigs":"8","addedAt":1700000046000},{"id":"1700000047000","name":"Taj Mahal","setNumber":"21056","theme":"Architecture","year":"2021","pieces":"2022","status":"Built","notes":"Minifigs: None (Architecture set)","rating":0,"imageUrl":"","folder":"Blue","minifigs":"0","addedAt":1700000047000},{"id":"1700000048000","name":"Roses","setNumber":"40460","theme":"Botanicals","year":"2021","pieces":"120","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Blue","minifigs":"0","addedAt":1700000048000},{"id":"1700000049000","name":"Wildflower Bouquet","setNumber":"10313","theme":"Botanicals","year":"2023","pieces":"939","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Blue","minifigs":"0","addedAt":1700000049000},{"id":"1700000050000","name":"Bouquet of Roses","setNumber":"10328","theme":"Botanicals","year":"2024","pieces":"822","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Blue","minifigs":"0","addedAt":1700000050000},{"id":"1700000051000","name":"Pretty Pink Flower Bouquet","setNumber":"10342","theme":"Botanicals","year":"2025","pieces":"749","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Blue","minifigs":"0","addedAt":1700000051000},{"id":"1700000052000","name":"Petite Sunny Bouquet","setNumber":"10347","theme":"Botanicals","year":"2025","pieces":"373","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Blue","minifigs":"0","addedAt":1700000052000},{"id":"1700000053000","name":"Happy Plants","setNumber":"10349","theme":"Botanicals","year":"2025","pieces":"217","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Blue","minifigs":"0","addedAt":1700000053000},{"id":"1700000054000","name":"The Botanical Garden","setNumber":"21353","theme":"Ideas","year":"2024","pieces":"3076","status":"Built","notes":"Minifigs: Gardener, Visitor with camera, Visitor with book","rating":0,"imageUrl":"","folder":"Blue","minifigs":"3","addedAt":1700000054000},{"id":"1700000055000","name":"Iron Man Helmet","setNumber":"76165","theme":"Marvel","year":"2020","pieces":"480","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Blue","minifigs":"0","addedAt":1700000055000},{"id":"1700000056000","name":"Creative Bricks","setNumber":"10692","theme":"Classic","year":"2015","pieces":"221","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Red","minifigs":"0","addedAt":1700000056000},{"id":"1700000057000","name":"Caf\u00e9 Corner","setNumber":"10182","theme":"Creator Expert","year":"2007","pieces":"2056","status":"Wanted","notes":"Minifigs: Hotel worker, 2 guests","rating":0,"imageUrl":"","folder":"","minifigs":"3","addedAt":1700000057000},{"id":"1700000058000","name":"Market Street","setNumber":"10190","theme":"Creator Expert","year":"2007","pieces":"1248","status":"Wanted","notes":"Minifigs: Shopkeeper, 2 residents","rating":0,"imageUrl":"","folder":"","minifigs":"3","addedAt":1700000058000},{"id":"1700000059000","name":"Green Grocer","setNumber":"10185","theme":"Creator Expert","year":"2008","pieces":"2352","status":"Wanted","notes":"Minifigs: Shopkeeper, 3 residents","rating":0,"imageUrl":"","folder":"","minifigs":"4","addedAt":1700000059000},{"id":"1700000060000","name":"Fire Brigade","setNumber":"10197","theme":"Creator Expert","year":"2009","pieces":"2231","status":"Wanted","notes":"Minifigs: 2 firefighters, Woman, Dog","rating":0,"imageUrl":"","folder":"","minifigs":"4","addedAt":1700000060000},{"id":"1700000061000","name":"Grand Emporium","setNumber":"10211","theme":"Creator Expert","year":"2010","pieces":"2182","status":"Wanted","notes":"Minifigs: Window washer, Store worker, Shop assistant, 4 shoppers","rating":0,"imageUrl":"","folder":"","minifigs":"7","addedAt":1700000061000},{"id":"1700000062000","name":"Pet Shop","setNumber":"10218","theme":"Creator Expert","year":"2011","pieces":"2032","status":"Wanted","notes":"Minifigs: Pet shop owner, Woman, 2 residents","rating":0,"imageUrl":"","folder":"","minifigs":"4","addedAt":1700000062000},{"id":"1700000063000","name":"Town Hall","setNumber":"10224","theme":"Creator Expert","year":"2012","pieces":"2766","status":"Wanted","notes":"Minifigs: Mayor, Secretary, Janitor, Bride, Groom, 3 residents","rating":0,"imageUrl":"","folder":"","minifigs":"8","addedAt":1700000063000},{"id":"1700000064000","name":"Palace Cinema","setNumber":"10232","theme":"Creator Expert","year":"2013","pieces":"2194","status":"Wanted","notes":"Minifigs: Child starlet, Chauffeur, Cinema worker, Camera operator, Female guest in red, Male guest in tuxedo","rating":0,"imageUrl":"","folder":"","minifigs":"6","addedAt":1700000064000},{"id":"1700000065000","name":"Creative Supplement Bright","setNumber":"10694","theme":"Classic","year":"2015","pieces":"303","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Red","minifigs":"0","addedAt":1700000065000},{"id":"1700000066000","name":"Detective's Office","setNumber":"10246","theme":"Creator Expert","year":"2015","pieces":"2262","status":"Wanted","notes":"Minifigs: Detective Ace Brickman, Reporter, Police officer, Barber, Woman in red dress, Pool player","rating":0,"imageUrl":"","folder":"","minifigs":"6","addedAt":1700000066000},{"id":"1700000067000","name":"Brick Bank","setNumber":"10251","theme":"Creator Expert","year":"2016","pieces":"2380","status":"Wanted","notes":"Minifigs: Bank manager, Secretary, Bank teller, Laundromat worker, Police officer","rating":0,"imageUrl":"","folder":"","minifigs":"5","addedAt":1700000067000},{"id":"1700000068000","name":"Medium Creative Brick Box","setNumber":"10696","theme":"Classic","year":"2015","pieces":"484","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Red","minifigs":"0","addedAt":1700000068000},{"id":"1700000069000","name":"Large Creative Brick Box","setNumber":"10698","theme":"Classic","year":"2015","pieces":"790","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Red","minifigs":"0","addedAt":1700000069000},{"id":"1700000070000","name":"Bricks and Gears","setNumber":"10712","theme":"Classic","year":"2018","pieces":"244","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Red","minifigs":"0","addedAt":1700000070000},{"id":"1700000071000","name":"Creative Suitcase","setNumber":"10713","theme":"Classic","year":"2018","pieces":"213","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Red","minifigs":"0","addedAt":1700000071000},{"id":"1700000072000","name":"Bricks on a Roll","setNumber":"10715","theme":"Classic","year":"2018","pieces":"442","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Red","minifigs":"0","addedAt":1700000072000},{"id":"1700000073000","name":"Bricks Bricks Bricks","setNumber":"10717","theme":"Classic","year":"2019","pieces":"1504","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Red","minifigs":"0","addedAt":1700000073000},{"id":"1700000074000","name":"Bricks and Ideas","setNumber":"11001","theme":"Classic","year":"2019","pieces":"123","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Red","minifigs":"0","addedAt":1700000074000},{"id":"1700000075000","name":"Basic Brick Set","setNumber":"11002","theme":"Classic","year":"2019","pieces":"300","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Red","minifigs":"0","addedAt":1700000075000},{"id":"1700000076000","name":"Creative Fun","setNumber":"11003","theme":"Classic","year":"2019","pieces":"500","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Red","minifigs":"0","addedAt":1700000076000},{"id":"1700000077000","name":"Windows of Creativity","setNumber":"11004","theme":"Classic","year":"2019","pieces":"450","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Red","minifigs":"0","addedAt":1700000077000},{"id":"1700000078000","name":"Creative Blue Bricks","setNumber":"11006","theme":"Classic","year":"2020","pieces":"52","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Red","minifigs":"0","addedAt":1700000078000},{"id":"1700000079000","name":"Tudor Corner","setNumber":"10350","theme":"Icons","year":"2025","pieces":"3266","status":"Wanted","notes":"Minifigs: Chef, Chimney Sweep, Clockmaker, Haberdashery Mannequin, Haberdashery Store Owner, Inn Owner, Patron/Food Critic, Resident","rating":0,"imageUrl":"","folder":"","minifigs":"8","addedAt":1700000079000},{"id":"1700000080000","name":"Creative Green Bricks","setNumber":"11007","theme":"Classic","year":"2020","pieces":"60","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Red","minifigs":"0","addedAt":1700000080000},{"id":"1700000081000","name":"Creative White Bricks","setNumber":"11012","theme":"Classic","year":"2021","pieces":"60","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Red","minifigs":"0","addedAt":1700000081000},{"id":"1700000082000","name":"Creative Transparent Bricks","setNumber":"11013","theme":"Classic","year":"2021","pieces":"500","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Red","minifigs":"0","addedAt":1700000082000},{"id":"1700000083000","name":"Creative Monsters","setNumber":"11017","theme":"Classic","year":"2022","pieces":"140","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Red","minifigs":"0","addedAt":1700000083000},{"id":"1700000084000","name":"90 Years of Cars","setNumber":"30510","theme":"Classic","year":"2022","pieces":"71","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Red","minifigs":"0","addedAt":1700000084000},{"id":"1700000085000","name":"Creative Monkey Fun","setNumber":"11031","theme":"Classic","year":"2023","pieces":"135","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Red","minifigs":"0","addedAt":1700000085000},{"id":"1700000086000","name":"Creative Food Friends","setNumber":"11039","theme":"Classic","year":"2025","pieces":"150","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Red","minifigs":"0","addedAt":1700000086000},{"id":"1700000087000","name":"Magical Transparent Box","setNumber":"11040","theme":"Classic","year":"2025","pieces":"340","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Red","minifigs":"0","addedAt":1700000087000},{"id":"1700000088000","name":"Creative Dinosaurs","setNumber":"11041","theme":"Classic","year":"2025","pieces":"450","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Red","minifigs":"0","addedAt":1700000088000},{"id":"1700000089000","name":"Creative Happy Box","setNumber":"11042","theme":"Classic","year":"2025","pieces":"680","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Red","minifigs":"0","addedAt":1700000089000},{"id":"1700000090000","name":"Cool Creative Box","setNumber":"11043","theme":"Classic","year":"2025","pieces":"510","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Red","minifigs":"0","addedAt":1700000090000},{"id":"1700000091000","name":"Ice-Cream Truck","setNumber":"60253","theme":"City","year":"2020","pieces":"200","status":"Built","notes":"Minifigs: Ice-Cream Lady, Customer (skater boy)","rating":0,"imageUrl":"","folder":"Yellow","minifigs":"2","addedAt":1700000091000},{"id":"1700000092000","name":"Fire Helicopter","setNumber":"30566","theme":"City","year":"2021","pieces":"40","status":"Built","notes":"Minifigs: Firefighter","rating":0,"imageUrl":"","folder":"Yellow","minifigs":"1","addedAt":1700000092000},{"id":"1700000093000","name":"Holiday Camper Van","setNumber":"60283","theme":"City","year":"2021","pieces":"190","status":"Built","notes":"Minifigs: Mother, Father, Baby","rating":0,"imageUrl":"","folder":"Yellow","minifigs":"3","addedAt":1700000093000},{"id":"1700000094000","name":"Skate Park","setNumber":"60290","theme":"City","year":"2021","pieces":"195","status":"Built","notes":"Minifigs: Wheelchair Skater, BMX Rider, Street Skater, Female Skater","rating":0,"imageUrl":"","folder":"Yellow","minifigs":"4","addedAt":1700000094000},{"id":"1700000095000","name":"Road Plates","setNumber":"60304","theme":"City","year":"2021","pieces":"112","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Yellow","minifigs":"0","addedAt":1700000095000},{"id":"1700000096000","name":"Go-Kart Racer","setNumber":"30589","theme":"City","year":"2022","pieces":"39","status":"Built","notes":"Minifigs: Racer","rating":0,"imageUrl":"","folder":"Yellow","minifigs":"1","addedAt":1700000096000},{"id":"1700000097000","name":"Cement Mixer Truck","setNumber":"60325","theme":"City","year":"2022","pieces":"85","status":"Built","notes":"Minifigs: 2 Construction Workers","rating":0,"imageUrl":"","folder":"Yellow","minifigs":"2","addedAt":1700000097000},{"id":"1700000098000","name":"Recycling Truck","setNumber":"60386","theme":"City","year":"2023","pieces":"261","status":"Built","notes":"Minifigs: Male Recycling Worker, Female Recycling Worker, Female civilian","rating":0,"imageUrl":"","folder":"Yellow","minifigs":"3","addedAt":1700000098000},{"id":"1700000099000","name":"Construction Steamroller","setNumber":"60401","theme":"City","year":"2024","pieces":"78","status":"Built","notes":"Minifigs: Construction Worker","rating":0,"imageUrl":"","folder":"Yellow","minifigs":"1","addedAt":1700000099000},{"id":"1700000100000","name":"Burger Truck","setNumber":"60404","theme":"City","year":"2024","pieces":"194","status":"Built","notes":"Minifigs: Burger Vendor, Customer","rating":0,"imageUrl":"","folder":"Yellow","minifigs":"2","addedAt":1700000100000},{"id":"1700000101000","name":"Red Double-Decker Sightseeing Bus","setNumber":"60407","theme":"City","year":"2024","pieces":"384","status":"Built","notes":"Minifigs: Bus Driver, 4 Passengers","rating":0,"imageUrl":"","folder":"Yellow","minifigs":"5","addedAt":1700000101000},{"id":"1700000102000","name":"F1 Pit Stop & Pit Crew with Ferrari Car","setNumber":"60443","theme":"City","year":"2025","pieces":"322","status":"Built","notes":"Minifigs: Ferrari Driver, Pit Crew Member (Fuel Technician), Pit Crew Member (Wheel Gun Operator), Pit Crew Chief","rating":0,"imageUrl":"","folder":"Yellow","minifigs":"4","addedAt":1700000102000},{"id":"1700000103000","name":"Donut Truck","setNumber":"60452","theme":"City","year":"2025","pieces":"196","status":"Built","notes":"Minifigs: Vendor, Customer","rating":0,"imageUrl":"","folder":"Yellow","minifigs":"2","addedAt":1700000103000},{"id":"1700000104000","name":"Holiday Adventure Camper Van","setNumber":"60454","theme":"City","year":"2025","pieces":"385","status":"Built","notes":"Minifigs: Father, Mother, Child","rating":0,"imageUrl":"","folder":"Yellow","minifigs":"3","addedAt":1700000104000},{"id":"1700000105000","name":"Creative Neon Fun","setNumber":"11027","theme":"Classic","year":"2023","pieces":"333","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Red","minifigs":"0","addedAt":1700000105000},{"id":"1700000106000","name":"Championship Challenge II","setNumber":"3420","theme":"Sports","year":"2002","pieces":"376","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"In Box","minifigs":"","addedAt":1700000106000},{"id":"1700000107000","name":"NBA Challenge","setNumber":"3432","theme":"Sports","year":"2003","pieces":"441","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"In Box","minifigs":"","addedAt":1700000107000},{"id":"1700000108000","name":"Target Practice","setNumber":"3424","theme":"Sports","year":"2002","pieces":"36","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"In Box","minifigs":"","addedAt":1700000108000},{"id":"1700000109000","name":"Shoot 'n' Save","setNumber":"3422","theme":"Sports","year":"2002","pieces":"107","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"In Box","minifigs":"","addedAt":1700000109000},{"id":"1700000110000","name":"Freekick Frenzy","setNumber":"3423","theme":"Sports","year":"2002","pieces":"51","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"In Box","minifigs":"","addedAt":1700000110000},{"id":"1700000111000","name":"F1 Driver with McLaren Race Car","setNumber":"60442","theme":"City","year":"2025","pieces":"86","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"","minifigs":"1","addedAt":1700000111000},{"id":"1700000112000","name":"Sky Police Jet Patrol","setNumber":"60206","theme":"City","year":"2018","pieces":"54","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"","minifigs":"2","addedAt":1700000112000},{"id":"1700000113000","name":"Tow Truck Trouble","setNumber":"60137","theme":"City","year":"2016","pieces":"144","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"","minifigs":"3","addedAt":1700000113000},{"id":"1700000114000","name":"Restaurants of the World: Japan","setNumber":"40906","theme":"Other","year":"2026","pieces":"289","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"","minifigs":"1","addedAt":1700000114000},{"id":"1700000115000","name":"Pink Brick Box","setNumber":"4625","theme":"Classic","year":"2012","pieces":"224","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"","minifigs":"1","addedAt":1700000115000},{"id":"1700000116000","name":"Green Creativity Box","setNumber":"10708","theme":"Classic","year":"2017","pieces":"66","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"","minifigs":"0","addedAt":1700000116000},{"id":"1700000117000","name":"Red Creativity Box","setNumber":"10707","theme":"Classic","year":"2017","pieces":"55","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"","minifigs":"0","addedAt":1700000117000},{"id":"1700000118000","name":"Blue Creativity Box","setNumber":"10706","theme":"Classic","year":"2017","pieces":"78","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"","minifigs":"0","addedAt":1700000118000},{"id":"1700000119000","name":"Christmas Chimney Fun with Santa","setNumber":"30692","theme":"Classic","year":"2025","pieces":"61","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"","minifigs":"0","addedAt":1700000119000},{"id":"1700000120000","name":"Gingerbread Train Ornament","setNumber":"40777","theme":"Seasonal","year":"2025","pieces":"190","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"","minifigs":"0","addedAt":1700000120000},{"id":"1700000121000","name":"Minifigure Vending Machine","setNumber":"21358","theme":"Ideas","year":"2025","pieces":"1343","status":"Built","notes":"Minifigs: LEGO Ideas Designer, Fan Designer, Classic Space Astronaut (Gold), Classic Space Astronaut (Teal), Castle Griffin Knight (Male), Castle Griffin Knight (Female), Kraken Warrior (Male), Kraken Warrior (Female), Paradisa Beach Bro, Paradisa Beach Bae, Bo'sun Will, Camilla, Bernard Bear Costume, Elton Elephant Costume, Coffee Barista, Mechanic","rating":0,"imageUrl":"","folder":"","minifigs":"16","addedAt":1700000121000},{"id":"1700000122000","name":"Winter Gazebo","setNumber":"40778","theme":"Other","year":"2025","pieces":"245","status":"Built","notes":"Minifigs: Man with Scarf, Woman with Hot Drink, Child","rating":0,"imageUrl":"","folder":"","minifigs":"3","addedAt":1700000122000},{"id":"1700000123000","name":"Creative Vehicles","setNumber":"11036","theme":"Classic","year":"2024","pieces":"900","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"","minifigs":"0","addedAt":1700000123000},{"id":"1700000124000","name":"Bouquet of Pink Roses","setNumber":"10374","theme":"Botanicals","year":"2025","pieces":"789","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"","minifigs":"0","addedAt":1700000124000},{"id":"1700000125000","name":"Wild Animals: Tropical Toucan","setNumber":"31173","theme":"Creator","year":"2025","pieces":"225","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"","minifigs":"0","addedAt":1700000125000},{"id":"1700000126000","name":"The Lego Van","setNumber":"60500","theme":"City","year":"2026","pieces":"276","status":"Built","notes":"Minifigs: Delivery Van Driver, Warehouse Worker","rating":0,"imageUrl":"","folder":"","minifigs":"2","addedAt":1700000126000},{"id":"1700000127000","name":"Year of the Horse","setNumber":"40779","theme":"Other","year":"2026","pieces":"132","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"","minifigs":"0","addedAt":1700000127000},{"id":"1700000128000","name":"Turtle with a Water Lily Flower","setNumber":"31377","theme":"Creator","year":"2026","pieces":"124","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"","minifigs":"0","addedAt":1700000128000},{"id":"1700000129000","name":"Cute Hamster with a Flower","setNumber":"31376","theme":"Creator","year":"2026","pieces":"166","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"","minifigs":"0","addedAt":1700000129000},{"id":"1700000130000","name":"Duck Family","setNumber":"40885","theme":"Other","year":"2026","pieces":"262","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"","minifigs":"0","addedAt":1700000130000},{"id":"1700000131000","name":"Harry Potter Hogwarts","setNumber":"3862","theme":"Harry Potter","year":"2010","pieces":"332","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"In Box","minifigs":"","addedAt":1700000131000},{"id":"1700000132000","name":"The Sorting Hat","setNumber":"4701","theme":"Harry Potter","year":"2001","pieces":"48","status":"Built","notes":"Minifigs: Harry Potter","rating":0,"imageUrl":"","folder":"Blue","minifigs":"1","addedAt":1700000132000},{"id":"1700000133000","name":"Knockturn Alley","setNumber":"4720","theme":"Harry Potter","year":"2003","pieces":"209","status":"Built","notes":"Minifigs: Harry Potter, Lucius Malfoy","rating":0,"imageUrl":"","folder":"Blue","minifigs":"2","addedAt":1700000133000},{"id":"1700000134000","name":"Free Dobby","setNumber":"4736","theme":"Harry Potter","year":"2010","pieces":"73","status":"Built","notes":"Minifigs: Harry Potter, Dobby, Lucius Malfoy","rating":0,"imageUrl":"","folder":"Blue","minifigs":"3","addedAt":1700000134000},{"id":"1700000135000","name":"Draco's Encounter With Buckbeak","setNumber":"4750","theme":"Harry Potter","year":"2004","pieces":"36","status":"Built","notes":"Minifigs: Draco Malfoy","rating":0,"imageUrl":"","folder":"Blue","minifigs":"1","addedAt":1700000135000},{"id":"1700000136000","name":"Shrieking Shack","setNumber":"4756","theme":"Harry Potter","year":"2004","pieces":"445","status":"Built","notes":"Minifigs: Harry Potter, Ron Weasley, Professor Lupin, Sirius Black","rating":0,"imageUrl":"","folder":"Blue","minifigs":"4","addedAt":1700000136000},{"id":"1700000137000","name":"Hogwarts Castle","setNumber":"4757","theme":"Harry Potter","year":"2004","pieces":"928","status":"Built","notes":"Minifigs: Harry Potter, Hermione Granger, Ron Weasley, Dumbledore, McGonagall, Snape, Nearly Headless Nick, Filch, Dementor","rating":0,"imageUrl":"","folder":"Blue","minifigs":"9","addedAt":1700000137000},{"id":"1700000138000","name":"Hogwarts Express","setNumber":"4841","theme":"Harry Potter","year":"2010","pieces":"646","status":"Built","notes":"Minifigs: Harry Potter, Ron Weasley, Hermione Granger, Luna Lovegood, Draco Malfoy","rating":0,"imageUrl":"","folder":"Blue","minifigs":"5","addedAt":1700000138000},{"id":"1700000139000","name":"The Forbidden Forest","setNumber":"4865","theme":"Harry Potter","year":"2011","pieces":"64","status":"Built","notes":"Minifigs: Harry Potter, Hagrid, Lord Voldemort, Narcissa Malfoy","rating":0,"imageUrl":"","folder":"Blue","minifigs":"4","addedAt":1700000139000},{"id":"1700000140000","name":"Hogwarts","setNumber":"4867","theme":"Harry Potter","year":"2011","pieces":"466","status":"Built","notes":"Minifigs: Harry Potter, Hermione Granger, Ron Weasley, Professor Snape, Professor McGonagall, Argus Filch, Lord Voldemort","rating":0,"imageUrl":"","folder":"Blue","minifigs":"7","addedAt":1700000140000},{"id":"1700000141000","name":"Harry's Journey to Hogwarts","setNumber":"30407","theme":"Harry Potter","year":"2018","pieces":"40","status":"Built","notes":"Minifigs: Harry Potter","rating":0,"imageUrl":"","folder":"Blue","minifigs":"1","addedAt":1700000141000},{"id":"1700000142000","name":"Build Your Own Hogwarts Castle","setNumber":"30435","theme":"Harry Potter","year":"2022","pieces":"67","status":"Built","notes":"Minifigs: Albus Dumbledore","rating":0,"imageUrl":"","folder":"White","minifigs":"1","addedAt":1700000142000},{"id":"1700000143000","name":"The Monster Book of Monsters","setNumber":"30628","theme":"Harry Potter","year":"2020","pieces":"320","status":"Built","notes":"Minifigs: Draco Malfoy","rating":0,"imageUrl":"","folder":"Purple","minifigs":"1","addedAt":1700000143000},{"id":"1700000144000","name":"Quidditch Practice","setNumber":"30651","theme":"Harry Potter","year":"2023","pieces":"55","status":"Built","notes":"Minifigs: Harry Potter","rating":0,"imageUrl":"","folder":"Orange","minifigs":"1","addedAt":1700000144000},{"id":"1700000145000","name":"Draco in the Forbidden Forest","setNumber":"30677","theme":"Harry Potter","year":"2024","pieces":"33","status":"Built","notes":"Minifigs: Draco Malfoy","rating":0,"imageUrl":"","folder":"Green","minifigs":"1","addedAt":1700000145000},{"id":"1700000146000","name":"Quidditch Lesson","setNumber":"30706","theme":"Harry Potter","year":"2025","pieces":"55","status":"Built","notes":"Minifigs: Harry Potter","rating":0,"imageUrl":"","folder":"Purple 1","minifigs":"1","addedAt":1700000146000},{"id":"1700000147000","name":"Harry Potter Hogwarts Crests","setNumber":"31201","theme":"Harry Potter","year":"2021","pieces":"4249","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Grey","minifigs":"0","addedAt":1700000147000},{"id":"1700000148000","name":"Diagon Alley","setNumber":"40289","theme":"Harry Potter","year":"2018","pieces":"374","status":"Built","notes":"Minifigs: Garrick Ollivander","rating":0,"imageUrl":"","folder":"Blue","minifigs":"1","addedAt":1700000148000},{"id":"1700000149000","name":"Hogwarts Students Acc. Set","setNumber":"40419","theme":"Harry Potter","year":"2020","pieces":"53","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"In Box","minifigs":"4","addedAt":1700000149000},{"id":"1700000150000","name":"Hogwarts Gryffindor Dorms","setNumber":"40452","theme":"Harry Potter","year":"2021","pieces":"148","status":"Built","notes":"Minifigs: Harry Potter, Ron Weasley","rating":0,"imageUrl":"","folder":"Grey","minifigs":"2","addedAt":1700000150000},{"id":"1700000151000","name":"Harry, Hermione, Ron & Hagrid","setNumber":"40495","theme":"Harry Potter","year":"2021","pieces":"466","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Grey","minifigs":"0","addedAt":1700000151000},{"id":"1700000152000","name":"Voldemort, Nagini & Bellatrix","setNumber":"40496","theme":"Harry Potter","year":"2021","pieces":"344","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Grey","minifigs":"0","addedAt":1700000152000},{"id":"1700000153000","name":"Wizarding World Minifigure Accessory Set","setNumber":"40500","theme":"Harry Potter","year":"2021","pieces":"33","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"In Box","minifigs":"4","addedAt":1700000153000},{"id":"1700000154000","name":"Professors of Hogwarts","setNumber":"40560","theme":"Harry Potter","year":"2022","pieces":"601","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"White","minifigs":"0","addedAt":1700000154000},{"id":"1700000155000","name":"Hogwarts: Grand Staircase","setNumber":"40577","theme":"Harry Potter","year":"2022","pieces":"224","status":"Built","notes":"Minifigs: Hermione Granger","rating":0,"imageUrl":"","folder":"White","minifigs":"1","addedAt":1700000155000},{"id":"1700000156000","name":"Gringotts Vault","setNumber":"40598","theme":"Harry Potter","year":"2023","pieces":"212","status":"Built","notes":"Minifigs: Goblin","rating":0,"imageUrl":"","folder":"Orange","minifigs":"1","addedAt":1700000156000},{"id":"1700000157000","name":"Harry Potter & Cho Chang","setNumber":"40616","theme":"Harry Potter","year":"2023","pieces":"267","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Orange","minifigs":"0","addedAt":1700000157000},{"id":"1700000158000","name":"Draco Malfoy & Cedric Diggory","setNumber":"40617","theme":"Harry Potter","year":"2023","pieces":"262","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Orange","minifigs":"0","addedAt":1700000158000},{"id":"1700000159000","name":"Kingsley Shacklebolt & Nymphadora Tonks","setNumber":"40618","theme":"Harry Potter","year":"2023","pieces":"250","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Orange","minifigs":"0","addedAt":1700000159000},{"id":"1700000160000","name":"Prisoner of Azkaban Figures","setNumber":"40677","theme":"Harry Potter","year":"2024","pieces":"697","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Green","minifigs":"0","addedAt":1700000160000},{"id":"1700000161000","name":"Borgin and Burkes: Floo Network","setNumber":"40695","theme":"Harry Potter","year":"2024","pieces":"190","status":"Built","notes":"Minifigs: Lucius Malfoy","rating":0,"imageUrl":"","folder":"Green","minifigs":"1","addedAt":1700000161000},{"id":"1700000162000","name":"Hogwarts Castle: Room of Requirement","setNumber":"40770","theme":"Harry Potter","year":"2025","pieces":"202","status":"Built","notes":"Minifigs: Neville Longbottom","rating":0,"imageUrl":"","folder":"Purple 1","minifigs":"1","addedAt":1700000162000},{"id":"1700000163000","name":"The Goblet of Fire Figures","setNumber":"40791","theme":"Harry Potter","year":"2025","pieces":"671","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"","minifigs":"0","addedAt":1700000163000},{"id":"1700000164000","name":"Luna Lovegood & Thestral Figures","setNumber":"40802","theme":"Harry Potter","year":"2025","pieces":"292","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"","minifigs":"0","addedAt":1700000164000},{"id":"1700000165000","name":"Harry Potter and Fantastic Beasts","setNumber":"71022","theme":"Harry Potter","year":"2018","pieces":"176","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Blue","minifigs":"22","addedAt":1700000165000},{"id":"1700000166000","name":"Harry Potter Series 2","setNumber":"71028","theme":"Harry Potter","year":"2020","pieces":"128","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Purple","minifigs":"16","addedAt":1700000166000},{"id":"1700000167000","name":"Hogwarts Castle","setNumber":"71043","theme":"Harry Potter","year":"2018","pieces":"6020","status":"Built","notes":"Minifigs: Godric Gryffindor, Helga Hufflepuff, Salazar Slytherin, Rowena Ravenclaw","rating":0,"imageUrl":"","folder":"Blue","minifigs":"4","addedAt":1700000167000},{"id":"1700000168000","name":"Expecto Patronum","setNumber":"75945","theme":"Harry Potter","year":"2019","pieces":"121","status":"Built","notes":"Minifigs: Harry Potter, Sirius Black, Dementor (2)","rating":0,"imageUrl":"","folder":"Purple","minifigs":"4","addedAt":1700000168000},{"id":"1700000169000","name":"Hungarian Horntail Triwizard Challenge","setNumber":"75946","theme":"Harry Potter","year":"2019","pieces":"265","status":"Built","notes":"Minifigs: Harry Potter, Cedric Diggory, Viktor Krum, Fleur Delacour","rating":0,"imageUrl":"","folder":"Purple","minifigs":"4","addedAt":1700000169000},{"id":"1700000170000","name":"Hagrid's Hut: Buckbeak's Rescue","setNumber":"75947","theme":"Harry Potter","year":"2019","pieces":"496","status":"Built","notes":"Minifigs: Hagrid, Harry Potter, Ron Weasley, Hermione Granger, Executioner, Cornelius Fudge","rating":0,"imageUrl":"","folder":"Purple","minifigs":"6","addedAt":1700000170000},{"id":"1700000171000","name":"Hogwarts Clock Tower","setNumber":"75948","theme":"Harry Potter","year":"2019","pieces":"922","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Purple","minifigs":"8","addedAt":1700000171000},{"id":"1700000172000","name":"Aragog's Lair","setNumber":"75950","theme":"Harry Potter","year":"2018","pieces":"157","status":"Built","notes":"Minifigs: Harry Potter, Ron Weasley","rating":0,"imageUrl":"","folder":"Blue","minifigs":"2","addedAt":1700000172000},{"id":"1700000173000","name":"Grindelwald's Escape","setNumber":"75951","theme":"Harry Potter","year":"2018","pieces":"132","status":"Built","notes":"Minifigs: Gellert Grindelwald, Seraphina Picquery","rating":0,"imageUrl":"","folder":"Blue","minifigs":"2","addedAt":1700000173000},{"id":"1700000174000","name":"Newt's Case of Magical Creatures","setNumber":"75952","theme":"Harry Potter","year":"2018","pieces":"694","status":"Built","notes":"Minifigs: Newt Scamander, Tina Goldstein, Queenie Goldstein, Jacob Kowalski","rating":0,"imageUrl":"","folder":"Blue","minifigs":"4","addedAt":1700000174000},{"id":"1700000175000","name":"Hogwarts Whomping Willow","setNumber":"75953","theme":"Harry Potter","year":"2018","pieces":"753","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Blue","minifigs":"6","addedAt":1700000175000},{"id":"1700000176000","name":"Hogwarts Great Hall","setNumber":"75954","theme":"Harry Potter","year":"2018","pieces":"878","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Purple","minifigs":"10","addedAt":1700000176000},{"id":"1700000177000","name":"Hogwarts Express","setNumber":"75955","theme":"Harry Potter","year":"2018","pieces":"801","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Purple","minifigs":"6","addedAt":1700000177000},{"id":"1700000178000","name":"Quidditch Match","setNumber":"75956","theme":"Harry Potter","year":"2018","pieces":"500","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Purple","minifigs":"6","addedAt":1700000178000},{"id":"1700000179000","name":"The Knight Bus","setNumber":"75957","theme":"Harry Potter","year":"2019","pieces":"403","status":"Built","notes":"Minifigs: Harry Potter, Stan Shunpike, Ernie Prang","rating":0,"imageUrl":"","folder":"Purple","minifigs":"3","addedAt":1700000179000},{"id":"1700000180000","name":"Beauxbaton's Carriage","setNumber":"75958","theme":"Harry Potter","year":"2019","pieces":"430","status":"Built","notes":"Minifigs: Fleur Delacour, Gabrielle Delacour, Hagrid, Madame Maxime","rating":0,"imageUrl":"","folder":"Purple","minifigs":"4","addedAt":1700000180000},{"id":"1700000181000","name":"Harry Potter Advent Calendar 2019","setNumber":"75964","theme":"Harry Potter","year":"2019","pieces":"305","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"In Box","minifigs":"6","addedAt":1700000181000},{"id":"1700000182000","name":"The Rise of Voldemort","setNumber":"75965","theme":"Harry Potter","year":"2019","pieces":"184","status":"Built","notes":"Minifigs: Lord Voldemort, Peter Pettigrew, Harry Potter, Death Eater","rating":0,"imageUrl":"","folder":"Purple","minifigs":"4","addedAt":1700000182000},{"id":"1700000183000","name":"Hogwarts Room of Requirement","setNumber":"75966","theme":"Harry Potter","year":"2020","pieces":"193","status":"Built","notes":"Minifigs: Harry Potter, Hermione Granger, Luna Lovegood","rating":0,"imageUrl":"","folder":"Purple","minifigs":"3","addedAt":1700000183000},{"id":"1700000184000","name":"Forbidden Forest: Umbridge's Encounter","setNumber":"75967","theme":"Harry Potter","year":"2020","pieces":"253","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Purple","minifigs":"5","addedAt":1700000184000},{"id":"1700000185000","name":"4 Privet Drive","setNumber":"75968","theme":"Harry Potter","year":"2020","pieces":"797","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Purple","minifigs":"6","addedAt":1700000185000},{"id":"1700000186000","name":"Hogwarts Astronomy Tower","setNumber":"75969","theme":"Harry Potter","year":"2020","pieces":"971","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Purple","minifigs":"8","addedAt":1700000186000},{"id":"1700000187000","name":"Diagon Alley","setNumber":"75978","theme":"Harry Potter","year":"2020","pieces":"5544","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Grey","minifigs":"14","addedAt":1700000187000},{"id":"1700000188000","name":"Hedwig","setNumber":"75979","theme":"Harry Potter","year":"2020","pieces":"630","status":"Built","notes":"Minifigs: Harry Potter","rating":0,"imageUrl":"","folder":"Grey","minifigs":"1","addedAt":1700000188000},{"id":"1700000189000","name":"Attack on the Burrow","setNumber":"75980","theme":"Harry Potter","year":"2020","pieces":"1047","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Grey","minifigs":"8","addedAt":1700000189000},{"id":"1700000190000","name":"Harry Potter Advent Calendar 2020","setNumber":"75981","theme":"Harry Potter","year":"2020","pieces":"335","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"In Box","minifigs":"6","addedAt":1700000190000},{"id":"1700000191000","name":"Hogwarts Moment: Transfiguration Class","setNumber":"76382","theme":"Harry Potter","year":"2021","pieces":"241","status":"Built","notes":"Minifigs: Professor McGonagall, Ron Weasley, Hermione Granger","rating":0,"imageUrl":"","folder":"Grey","minifigs":"3","addedAt":1700000191000},{"id":"1700000192000","name":"Hogwarts Moment: Potions Class","setNumber":"76383","theme":"Harry Potter","year":"2021","pieces":"271","status":"Built","notes":"Minifigs: Professor Snape, Draco Malfoy, Seamus Finnigan","rating":0,"imageUrl":"","folder":"Grey","minifigs":"3","addedAt":1700000192000},{"id":"1700000193000","name":"Hogwarts Moment: Herbology Class","setNumber":"76384","theme":"Harry Potter","year":"2021","pieces":"233","status":"Built","notes":"Minifigs: Professor Sprout, Cedric Diggory, Neville Longbottom","rating":0,"imageUrl":"","folder":"Grey","minifigs":"3","addedAt":1700000193000},{"id":"1700000194000","name":"Hogwarts Moment: Charms Class","setNumber":"76385","theme":"Harry Potter","year":"2021","pieces":"256","status":"Built","notes":"Minifigs: Professor Flitwick, Harry Potter, Cho Chang","rating":0,"imageUrl":"","folder":"Grey","minifigs":"3","addedAt":1700000194000},{"id":"1700000195000","name":"Hogwarts: Polyjuice Potion Mistake","setNumber":"76386","theme":"Harry Potter","year":"2021","pieces":"217","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Grey","minifigs":"4","addedAt":1700000195000},{"id":"1700000196000","name":"Hogwarts: Fluffy Encounter","setNumber":"76387","theme":"Harry Potter","year":"2021","pieces":"397","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Grey","minifigs":"4","addedAt":1700000196000},{"id":"1700000197000","name":"Hogsmeade Village Visit","setNumber":"76388","theme":"Harry Potter","year":"2021","pieces":"851","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"White","minifigs":"7","addedAt":1700000197000},{"id":"1700000198000","name":"Hogwarts Chamber of Secrets","setNumber":"76389","theme":"Harry Potter","year":"2021","pieces":"1176","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"White","minifigs":"11","addedAt":1700000198000},{"id":"1700000199000","name":"Harry Potter Advent Calendar 2021","setNumber":"76390","theme":"Harry Potter","year":"2021","pieces":"274","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"In Box","minifigs":"6","addedAt":1700000199000},{"id":"1700000200000","name":"Hogwarts Icons - Collectors Edition","setNumber":"76391","theme":"Harry Potter","year":"2021","pieces":"3010","status":"Built","notes":"Minifigs: Professor Dumbledore, Golden Harry Potter, Golden Hermione Granger","rating":0,"imageUrl":"","folder":"White","minifigs":"3","addedAt":1700000200000},{"id":"1700000201000","name":"Hogwarts Wizard Chess","setNumber":"76392","theme":"Harry Potter","year":"2021","pieces":"876","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"White","minifigs":"4","addedAt":1700000201000},{"id":"1700000202000","name":"Harry Potter & Hermione Granger","setNumber":"76393","theme":"Harry Potter","year":"2021","pieces":"1673","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"White","minifigs":"0","addedAt":1700000202000},{"id":"1700000203000","name":"Fawkes, Dumbledore's Phoenix","setNumber":"76394","theme":"Harry Potter","year":"2021","pieces":"597","status":"Built","notes":"Minifigs: Albus Dumbledore","rating":0,"imageUrl":"","folder":"White","minifigs":"1","addedAt":1700000203000},{"id":"1700000204000","name":"Hogwarts: First Flying Lesson","setNumber":"76395","theme":"Harry Potter","year":"2021","pieces":"264","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"White","minifigs":"4","addedAt":1700000204000},{"id":"1700000205000","name":"Hogwarts Moment: Divination Class","setNumber":"76396","theme":"Harry Potter","year":"2022","pieces":"297","status":"Built","notes":"Minifigs: Professor Trelawney, Harry Potter, Parvati Patil","rating":0,"imageUrl":"","folder":"White","minifigs":"3","addedAt":1700000205000},{"id":"1700000206000","name":"Hogwarts Moment: Defence Class","setNumber":"76397","theme":"Harry Potter","year":"2022","pieces":"257","status":"Built","notes":"Minifigs: Professor Moody, Hermione Granger, Neville Longbottom","rating":0,"imageUrl":"","folder":"White","minifigs":"3","addedAt":1700000206000},{"id":"1700000207000","name":"Hogwarts Hospital Wing","setNumber":"76398","theme":"Harry Potter","year":"2022","pieces":"510","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"White","minifigs":"4","addedAt":1700000207000},{"id":"1700000208000","name":"Hogwarts Magical Trunk","setNumber":"76399","theme":"Harry Potter","year":"2022","pieces":"603","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"White","minifigs":"8","addedAt":1700000208000},{"id":"1700000209000","name":"Hogwarts Courtyard: Sirius's Rescue","setNumber":"76401","theme":"Harry Potter","year":"2022","pieces":"345","status":"Built","notes":"Minifigs: Harry Potter, Hermione Granger, Sirius Black","rating":0,"imageUrl":"","folder":"Orange","minifigs":"3","addedAt":1700000209000},{"id":"1700000210000","name":"Hogwarts: Dumbledore's Office","setNumber":"76402","theme":"Harry Potter","year":"2022","pieces":"654","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Orange","minifigs":"6","addedAt":1700000210000},{"id":"1700000211000","name":"The Ministry of Magic","setNumber":"76403","theme":"Harry Potter","year":"2022","pieces":"990","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Orange","minifigs":"9","addedAt":1700000211000},{"id":"1700000212000","name":"Harry Potter Advent Calendar 2022","setNumber":"76404","theme":"Harry Potter","year":"2022","pieces":"334","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"In Box","minifigs":"7","addedAt":1700000212000},{"id":"1700000213000","name":"Hogwarts Express - Collectors Edition","setNumber":"76405","theme":"Harry Potter","year":"2022","pieces":"5129","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Orange","minifigs":"20","addedAt":1700000213000},{"id":"1700000214000","name":"Hungarian Horntail Dragon","setNumber":"76406","theme":"Harry Potter","year":"2022","pieces":"671","status":"Built","notes":"Minifigs: Harry Potter","rating":0,"imageUrl":"","folder":"Orange","minifigs":"1","addedAt":1700000214000},{"id":"1700000215000","name":"The Shrieking Shack & Whomping Willow","setNumber":"76407","theme":"Harry Potter","year":"2022","pieces":"777","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Orange","minifigs":"6","addedAt":1700000215000},{"id":"1700000216000","name":"12 Grimmauld Place","setNumber":"76408","theme":"Harry Potter","year":"2022","pieces":"1083","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Orange","minifigs":"9","addedAt":1700000216000},{"id":"1700000217000","name":"Gryffindor House Banner","setNumber":"76409","theme":"Harry Potter","year":"2023","pieces":"285","status":"Built","notes":"Minifigs: Harry Potter, Neville Longbottom, Angelina Johnson","rating":0,"imageUrl":"","folder":"Red","minifigs":"3","addedAt":1700000217000},{"id":"1700000218000","name":"Slytherin House Banner","setNumber":"76410","theme":"Harry Potter","year":"2023","pieces":"349","status":"Built","notes":"Minifigs: Draco Malfoy, Blaise Zabini, Pansy Parkinson","rating":0,"imageUrl":"","folder":"Red","minifigs":"3","addedAt":1700000218000},{"id":"1700000219000","name":"Ravenclaw House Banner","setNumber":"76411","theme":"Harry Potter","year":"2023","pieces":"305","status":"Built","notes":"Minifigs: Luna Lovegood, Cho Chang, Michael Corner","rating":0,"imageUrl":"","folder":"Red","minifigs":"3","addedAt":1700000219000},{"id":"1700000220000","name":"Hufflepuff House Banner","setNumber":"76412","theme":"Harry Potter","year":"2023","pieces":"313","status":"Built","notes":"Minifigs: Cedric Diggory, Susan Bones, Hannah Abbott","rating":0,"imageUrl":"","folder":"Red","minifigs":"3","addedAt":1700000220000},{"id":"1700000221000","name":"Hogwarts: Room of Requirement","setNumber":"76413","theme":"Harry Potter","year":"2023","pieces":"587","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Red","minifigs":"5","addedAt":1700000221000},{"id":"1700000222000","name":"Expecto Patronum","setNumber":"76414","theme":"Harry Potter","year":"2023","pieces":"754","status":"Built","notes":"Minifigs: Harry Potter, Remus Lupin","rating":0,"imageUrl":"","folder":"Red","minifigs":"2","addedAt":1700000222000},{"id":"1700000223000","name":"The Battle of Hogwarts","setNumber":"76415","theme":"Harry Potter","year":"2023","pieces":"730","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Red","minifigs":"6","addedAt":1700000223000},{"id":"1700000224000","name":"Quidditch Trunk","setNumber":"76416","theme":"Harry Potter","year":"2023","pieces":"599","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Red","minifigs":"4","addedAt":1700000224000},{"id":"1700000225000","name":"Gringotts Wizarding Bank - Collectors Edition","setNumber":"76417","theme":"Harry Potter","year":"2023","pieces":"4801","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Red","minifigs":"13","addedAt":1700000225000},{"id":"1700000226000","name":"Harry Potter Advent Calendar 2023","setNumber":"76418","theme":"Harry Potter","year":"2023","pieces":"227","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"In Box","minifigs":"6","addedAt":1700000226000},{"id":"1700000227000","name":"Hogwarts Castle and Grounds","setNumber":"76419","theme":"Harry Potter","year":"2023","pieces":"2660","status":"Built","notes":"Minifigs: Architect of Hogwarts","rating":0,"imageUrl":"","folder":"Green","minifigs":"1","addedAt":1700000227000},{"id":"1700000228000","name":"Triwizard Tournament: The Black Lake","setNumber":"76420","theme":"Harry Potter","year":"2023","pieces":"349","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Green","minifigs":"5","addedAt":1700000228000},{"id":"1700000229000","name":"Dobby the House-Elf","setNumber":"76421","theme":"Harry Potter","year":"2024","pieces":"403","status":"Built","notes":"Minifigs: Dobby","rating":0,"imageUrl":"","folder":"Green","minifigs":"1","addedAt":1700000229000},{"id":"1700000230000","name":"Diagon Alley: Weasleys Wizard Wheezes","setNumber":"76422","theme":"Harry Potter","year":"2023","pieces":"834","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Green","minifigs":"7","addedAt":1700000230000},{"id":"1700000231000","name":"Hogwarts Express & Hogsmeade Station","setNumber":"76423","theme":"Harry Potter","year":"2023","pieces":"1074","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Green","minifigs":"8","addedAt":1700000231000},{"id":"1700000232000","name":"Flying Ford Anglia","setNumber":"76424","theme":"Harry Potter","year":"2024","pieces":"165","status":"Built","notes":"Minifigs: Harry Potter, Ron Weasley","rating":0,"imageUrl":"","folder":"Green","minifigs":"2","addedAt":1700000232000},{"id":"1700000233000","name":"Hedwig at 4 Privet Drive","setNumber":"76425","theme":"Harry Potter","year":"2024","pieces":"337","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Green","minifigs":"3","addedAt":1700000233000},{"id":"1700000234000","name":"Hogwarts Castle Boathouse","setNumber":"76426","theme":"Harry Potter","year":"2024","pieces":"350","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Green","minifigs":"5","addedAt":1700000234000},{"id":"1700000235000","name":"Buckbeak","setNumber":"76427","theme":"Harry Potter","year":"2024","pieces":"723","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Green","minifigs":"0","addedAt":1700000235000},{"id":"1700000236000","name":"Hagrid's Hut: An Unexpected Visit","setNumber":"76428","theme":"Harry Potter","year":"2024","pieces":"896","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Green","minifigs":"5","addedAt":1700000236000},{"id":"1700000237000","name":"Talking Sorting Hat","setNumber":"76429","theme":"Harry Potter","year":"2024","pieces":"561","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Green","minifigs":"0","addedAt":1700000237000},{"id":"1700000238000","name":"Hogwarts Castle Owlery","setNumber":"76430","theme":"Harry Potter","year":"2024","pieces":"364","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"3","addedAt":1700000238000},{"id":"1700000239000","name":"Hogwarts Castle: Potions Class","setNumber":"76431","theme":"Harry Potter","year":"2024","pieces":"397","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"4","addedAt":1700000239000},{"id":"1700000240000","name":"Forbidden Forest: Magical Creatures","setNumber":"76432","theme":"Harry Potter","year":"2024","pieces":"172","status":"Built","notes":"Minifigs: Ron Weasley, Hermione Granger","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"2","addedAt":1700000240000},{"id":"1700000241000","name":"Mandrake","setNumber":"76433","theme":"Harry Potter","year":"2024","pieces":"579","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"0","addedAt":1700000241000},{"id":"1700000242000","name":"Aragog in the Forbidden Forest","setNumber":"76434","theme":"Harry Potter","year":"2024","pieces":"195","status":"Built","notes":"Minifigs: Harry Potter, Ron Weasley","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"2","addedAt":1700000242000},{"id":"1700000243000","name":"Hogwarts Castle: The Great Hall","setNumber":"76435","theme":"Harry Potter","year":"2024","pieces":"1732","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"11","addedAt":1700000243000},{"id":"1700000244000","name":"The Burrow - Collectors Edition","setNumber":"76437","theme":"Harry Potter","year":"2024","pieces":"2405","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"10","addedAt":1700000244000},{"id":"1700000245000","name":"Harry Potter Advent Calendar 2024","setNumber":"76438","theme":"Harry Potter","year":"2024","pieces":"301","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"In Box","minifigs":"7","addedAt":1700000245000},{"id":"1700000246000","name":"Ollivanders & Madam Malkins Robes","setNumber":"76439","theme":"Harry Potter","year":"2024","pieces":"744","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"6","addedAt":1700000246000},{"id":"1700000247000","name":"Triwizard Tournament: The Arrival","setNumber":"76440","theme":"Harry Potter","year":"2024","pieces":"1229","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Aqua","minifigs":"5","addedAt":1700000247000},{"id":"1700000248000","name":"Hogwarts Castle: Dueling Club","setNumber":"76441","theme":"Harry Potter","year":"2025","pieces":"158","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Purple 1","minifigs":"4","addedAt":1700000248000},{"id":"1700000249000","name":"Hogwarts Castle: Charms Class","setNumber":"76442","theme":"Harry Potter","year":"2025","pieces":"204","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Purple 1","minifigs":"3","addedAt":1700000249000},{"id":"1700000250000","name":"Hagrid & Harry's Motorcycle Ride","setNumber":"76443","theme":"Harry Potter","year":"2025","pieces":"617","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Purple 1","minifigs":"0","addedAt":1700000250000},{"id":"1700000251000","name":"Diagon Alley Wizarding Shops","setNumber":"76444","theme":"Harry Potter","year":"2025","pieces":"2750","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Purple 1","minifigs":"12","addedAt":1700000251000},{"id":"1700000252000","name":"Hogwarts Castle: Herbology Class","setNumber":"76445","theme":"Harry Potter","year":"2025","pieces":"390","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Purple 1","minifigs":"3","addedAt":1700000252000},{"id":"1700000253000","name":"Knight Bus Adventure","setNumber":"76446","theme":"Harry Potter","year":"2025","pieces":"499","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Purple 1","minifigs":"5","addedAt":1700000253000},{"id":"1700000254000","name":"Hogwarts Castle: Flying Lessons","setNumber":"76447","theme":"Harry Potter","year":"2025","pieces":"651","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Purple 1","minifigs":"6","addedAt":1700000254000},{"id":"1700000255000","name":"Fawkes: Dumbledore's Phoenix","setNumber":"76448","theme":"Harry Potter","year":"2025","pieces":"299","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"Purple 1","minifigs":"0","addedAt":1700000255000},{"id":"1700000256000","name":"Chomping Monster Book of Monsters","setNumber":"76449","theme":"Harry Potter","year":"2025","pieces":"518","status":"Built","notes":"Minifigs: Neville Longbottom","rating":0,"imageUrl":"","folder":"Purple 1","minifigs":"1","addedAt":1700000256000},{"id":"1700000257000","name":"Book Nook: Hogwarts Express","setNumber":"76450","theme":"Harry Potter","year":"2025","pieces":"832","status":"Built","notes":"Minifigs: Harry Potter, Ron Weasley","rating":0,"imageUrl":"","folder":"Orange 1","minifigs":"2","addedAt":1700000257000},{"id":"1700000258000","name":"Privet Drive: Aunt Marge's Visit","setNumber":"76451","theme":"Harry Potter","year":"2025","pieces":"639","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Orange 1","minifigs":"5","addedAt":1700000258000},{"id":"1700000259000","name":"Quality Quidditch Supplies & Ice Cream Parlour","setNumber":"76452","theme":"Harry Potter","year":"2025","pieces":"795","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"","minifigs":"6","addedAt":1700000259000},{"id":"1700000260000","name":"Malfoy Manor","setNumber":"76453","theme":"Harry Potter","year":"2025","pieces":"1601","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Orange 1","minifigs":"9","addedAt":1700000260000},{"id":"1700000261000","name":"Hogwarts Castle: The Main Tower","setNumber":"76454","theme":"Harry Potter","year":"2025","pieces":"2135","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"Orange 1","minifigs":"12","addedAt":1700000261000},{"id":"1700000262000","name":"Harry Potter Advent Calendar 2025","setNumber":"76456","theme":"Harry Potter","year":"2025","pieces":"278","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"In Box","minifigs":"8","addedAt":1700000262000},{"id":"1700000263000","name":"Hogsmeade Village - Collectors Edition","setNumber":"76457","theme":"Harry Potter","year":"2025","pieces":"3228","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"","minifigs":"12","addedAt":1700000263000},{"id":"1700000264000","name":"Thestral Family","setNumber":"76458","theme":"Harry Potter","year":"2025","pieces":"548","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"","minifigs":"0","addedAt":1700000264000},{"id":"1700000265000","name":"Hagrid and Harry's Privet Drive Escape","setNumber":"76459","theme":"Harry Potter","year":"2026","pieces":"124","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"","minifigs":"4","addedAt":1700000265000},{"id":"1700000266000","name":"Hogwarts Castle: Sorting Hat Ceremony","setNumber":"76460","theme":"Harry Potter","year":"2026","pieces":"124","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"","minifigs":"4","addedAt":1700000266000},{"id":"1700000267000","name":"Cornish Pixie","setNumber":"76461","theme":"Harry Potter","year":"2026","pieces":"320","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"","minifigs":"0","addedAt":1700000267000},{"id":"1700000268000","name":"Hogwarts Castle: Hospital Wing","setNumber":"76463","theme":"Harry Potter","year":"2026","pieces":"907","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"","minifigs":"7","addedAt":1700000268000},{"id":"1700000269000","name":"Cauldron: Secret Potions Classroom","setNumber":"76464","theme":"Harry Potter","year":"2026","pieces":"652","status":"Built","notes":"Minifigs: Professor Snape, Hermione Granger","rating":0,"imageUrl":"","folder":"","minifigs":"2","addedAt":1700000269000},{"id":"1700000270000","name":"Sorcerer's Stone - Collectors Edition","setNumber":"76466","theme":"Harry Potter","year":"2026","pieces":"1571","status":"Built","notes":"Minifigs: Harry Potter, Ron Weasley, Hermione Granger","rating":0,"imageUrl":"","folder":"","minifigs":"3","addedAt":1700000270000},{"id":"1700000271000","name":"Luna Lovegood's House","setNumber":"76467","theme":"Harry Potter","year":"2026","pieces":"764","status":"Built","notes":"Minifigs: Various","rating":0,"imageUrl":"","folder":"","minifigs":"5","addedAt":1700000271000},{"id":"1700000272000","name":"Enchanted Flying Ford Anglia","setNumber":"76470","theme":"Harry Potter","year":"2026","pieces":"868","status":"Built","notes":"","rating":0,"imageUrl":"","folder":"","minifigs":"0","addedAt":1700000272000}];


function exportCSV(data, filename="lego-collection") {
  const headers = ["Name","Set Number","Theme","Year","Pieces","Minifigs","Status","Folder","Purchase Price","Current Value","Gain/Loss","Rating","Notes"];
  const rows = data.map(s => {
    const paid = parseFloat(s.purchasePrice)||0;
    const val = parseFloat(s.currentValue)||0;
    const gain = paid > 0 || val > 0 ? (val - paid).toFixed(2) : "";
    return [
      s.name, s.setNumber||"", s.theme||"", s.year||"", s.pieces||"",
      s.minifigs||"", s.status||"", s.folder||"",
      paid > 0 ? paid.toFixed(2) : "",
      val > 0 ? val.toFixed(2) : "",
      gain,
      s.rating||"",
      (s.notes||"").replace(/,/g," "),
    ].map(v => `"${String(v).replace(/"/g,'""')}"`);
  });
  const csv = [headers.join(","), ...rows.map(r=>r.join(","))].join("\n");
  const blob = new Blob([csv], { type:"text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${filename}-${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

export default function LegoDatabase() {
  const [sets, setSets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterTheme, setFilterTheme] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterFolder, setFilterFolder] = useState("All");
  const [sortBy, setSortBy] = useState("added");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [expandedSet, setExpandedSet] = useState(null);
  const [activeTab, setActiveTab] = useState("Collection");
  const [minifigSearch, setMinifigSearch] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem("lego-admin") === ADMIN_PASSWORD);
  const [selectedSet, setSelectedSet] = useState(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => { loadSets(); }, []);

  async function loadSets() {
    try {
      const remote = await dbLoad();
      if (remote) {
        setSets(remote);
        localStorage.setItem("lego-sets-v2", JSON.stringify(remote));
      } else {
        // First time: seed the database with existing collection
        const local = localStorage.getItem("lego-sets-v2");
        const data = local ? JSON.parse(local) : SEED_DATA;
        setSets(data);
        await dbSave(data);
      }
    } catch(e) {
      // Offline fallback - use localStorage
      const local = localStorage.getItem("lego-sets-v2");
      setSets(local ? JSON.parse(local) : SEED_DATA);
    }
    setLoading(false);
  }

  async function saveSets(u) {
    try {
      localStorage.setItem("lego-sets-v2", JSON.stringify(u));
      await dbSave(u);
    } catch(e) { showToast("Couldn't save — check connection", "error"); }
  }

  function showToast(msg, type="success") { setToast({msg,type}); setTimeout(()=>setToast(null),3000); }

  function handleSubmit() {
    if (!form.name.trim()) return showToast("Set name is required","error");
    const entry = { ...form, id: editId||Date.now().toString(), addedAt: editId ? sets.find(s=>s.id===editId)?.addedAt : Date.now() };
    const u = editId ? sets.map(s=>s.id===editId?entry:s) : [entry,...sets];
    setSets(u); saveSets(u); setForm(EMPTY_FORM); setShowForm(false); setEditId(null);
    showToast(editId?"Updated!":"Added!");
  }

  function handleEdit(set) { setForm({...set}); setEditId(set.id); setShowForm(true); setExpandedSet(null); window.scrollTo({top:0,behavior:"smooth"}); }
  function handleDelete(id) { const u=sets.filter(s=>s.id!==id); setSets(u); saveSets(u); setConfirmDelete(null); setExpandedSet(null); showToast("Removed"); }
  function markOwned(id) {
    const u = sets.map(s => s.id===id ? {...s, status:"Built"} : s);
    setSets(u); saveSets(u); showToast("🧱 Marked as owned!");
  }

  function attemptLogin() {
    if (passwordInput === ADMIN_PASSWORD) {
      localStorage.setItem("lego-admin", ADMIN_PASSWORD);
      setIsAdmin(true);
      setShowPasswordPrompt(false);
      setPasswordInput("");
      setPasswordError(false);
      showToast("🔓 Admin mode unlocked!");
    } else {
      setPasswordError(true);
      setPasswordInput("");
    }
  }

  function logout() {
    localStorage.removeItem("lego-admin");
    setIsAdmin(false);
    showToast("🔒 Logged out");
  }

  async function importFromUrl(status="Wanted") {
    if (!urlInput.trim()) return;
    // Extract set number and name slug from LEGO.com URL
    const match = urlInput.match(/-(\d{4,6})\/?$/);
    if (!match) return showToast("Couldn't find a set number in that URL — try a lego.com/product/... link", "error");
    const setNumber = match[1];
    const pathSlug = urlInput.replace(/\/$/, "").split("/").pop();
    const nameSlug = pathSlug.replace(/-\d+$/, "");
    const guessedName = nameSlug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

    setUrlLoading(true);
    showToast("🔍 Looking up set details...");

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 400,
          messages: [{
            role: "user",
            content: `Look up LEGO set number ${setNumber} (${guessedName}). Reply with ONLY a JSON object, no markdown, no explanation:
{"name":"full set name","setNumber":"${setNumber}","theme":"theme name","year":"release year as 4 digits","pieces":"piece count as number","minifigs":"minifig count as number","minifigNames":"comma separated minifig names or empty string"}`
          }]
        })
      });
      const data = await response.json();
      const text = data.content?.[0]?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const info = JSON.parse(clean);
      const notes = info.minifigNames ? `Minifigs: ${info.minifigNames}` : "";
      const newSet = {
        ...EMPTY_FORM,
        id: Date.now().toString(),
        addedAt: Date.now(),
        status,
        name: info.name || guessedName,
        setNumber: info.setNumber || setNumber,
        theme: info.theme || "Other",
        year: info.year || "",
        pieces: info.pieces || "",
        minifigs: info.minifigs || "",
        notes,
      };
      const u = [newSet, ...sets];
      setSets(u); saveSets(u);
      setUrlInput("");
      showToast(`${status==="Wanted"?"⭐":"🧱"} Added "${newSet.name}"${status==="Wanted"?" to wishlist":""} !`);
    } catch(e) {
      // Fallback: add with just what we parsed from URL
      const newSet = { ...EMPTY_FORM, id: Date.now().toString(), addedAt: Date.now(), status, name: guessedName, setNumber };
      const u = [newSet, ...sets];
      setSets(u); saveSets(u);
      setUrlInput("");
      showToast(`${status==="Wanted"?"⭐":"🧱"} Added "${guessedName}" — edit to add more details`);
    }
    setUrlLoading(false);
  }

  const allFolders = [...new Set(sets.map(s=>s.folder||"").filter(Boolean))].sort();
  const owned = sets.filter(s=>s.status!=="Wanted");
  const wishlist = sets.filter(s=>s.status==="Wanted");

  // Value stats
  const totalPaid = owned.reduce((s,x)=>s+(parseFloat(x.purchasePrice)||0),0);
  const totalValue = owned.reduce((s,x)=>s+(parseFloat(x.currentValue)||0),0);
  const gain = totalValue - totalPaid;

  // Minifigure list — parse notes field for "Minifigs: ..." entries
  const allMinifigs = [];
  sets.forEach(set => {
    if (set.notes && set.notes.startsWith("Minifigs: ")) {
      const names = set.notes.replace("Minifigs: ","").split(",").map(n=>n.trim()).filter(Boolean);
      names.forEach(name => {
        if (name && name !== "Various" && name !== "0") {
          allMinifigs.push({ name, setName: set.name, setNumber: set.setNumber, theme: set.theme, imageUrl: set.imageUrl });
        }
      });
    }
  });
  const filteredMinifigs = minifigSearch
    ? allMinifigs.filter(m => m.name.toLowerCase().includes(minifigSearch.toLowerCase()) || m.setName.toLowerCase().includes(minifigSearch.toLowerCase()))
    : allMinifigs;
  // Count unique minifig names
  const minifigCounts = {};
  allMinifigs.forEach(m => { minifigCounts[m.name] = (minifigCounts[m.name]||0)+1; });

  const filtered = owned
    .filter(s => {
      const q = search.toLowerCase();
      return (!q || s.name.toLowerCase().includes(q) || s.setNumber?.toLowerCase().includes(q))
        && (filterTheme==="All" || s.theme===filterTheme)
        && (filterStatus==="All" || s.status===filterStatus)
        && (filterFolder==="All" || (filterFolder==="(none)" ? !s.folder : s.folder===filterFolder));
    })
    .sort((a,b) => {
      if (sortBy==="name") return a.name.localeCompare(b.name);
      if (sortBy==="year") return (b.year||0)-(a.year||0);
      if (sortBy==="pieces") return (parseInt(b.pieces)||0)-(parseInt(a.pieces)||0);
      if (sortBy==="value") return (parseFloat(b.currentValue)||0)-(parseFloat(a.currentValue)||0);
      return b.addedAt - a.addedAt;
    });

  const totalPieces = owned.reduce((s,x)=>s+(parseInt(x.pieces)||0),0);

  return (
    <div style={{ fontFamily:"'Georgia',serif", minHeight:"100vh", color:"#fffffe", background:"#0f0e17", backgroundImage:BRICK_BG, backgroundSize:"70px 58px" }}>
      <div style={{ position:"fixed", inset:0, background:"rgba(15,14,23,0.82)", pointerEvents:"none", zIndex:0 }}/>
      <div style={{ position:"relative", zIndex:1 }}>

        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,#e63946 0%,#c1121f 50%,#780000 100%)", padding:"2rem", textAlign:"center", borderBottom:"4px solid #ffd60a", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, backgroundImage:BRICK_BG, backgroundSize:"70px 58px", opacity:0.2 }}/>
          <div style={{ position:"relative" }}>
            <div style={{ fontSize:"3.5rem", fontWeight:"900", fontFamily:"'Impact',sans-serif", letterSpacing:"-1px" }}>🧱 LEGO VAULT</div>
            <div style={{ fontSize:"0.85rem", letterSpacing:"0.3em", color:"#ffd60a", marginTop:"0.2rem", textTransform:"uppercase" }}>Personal Collection Database</div>
            <div style={{ marginTop:"0.5rem" }}>
              {isAdmin
                ? <button onClick={logout} style={{ background:"transparent",color:"#ffffff88",border:"1px solid #ffffff33",padding:"0.25rem 0.75rem",borderRadius:"100px",fontSize:"0.7rem",cursor:"pointer",fontFamily:"sans-serif" }}>🔓 Admin · Lock</button>
                : <button onClick={()=>setShowPasswordPrompt(true)} style={{ background:"transparent",color:"#ffffff44",border:"1px solid #ffffff22",padding:"0.25rem 0.75rem",borderRadius:"100px",fontSize:"0.7rem",cursor:"pointer",fontFamily:"sans-serif" }}>🔒 Admin Login</button>
              }
            </div>
            <div style={{ display:"flex", gap:"1.5rem", justifyContent:"center", marginTop:"1.2rem", flexWrap:"wrap" }}>
              {[
                ["Sets Owned", owned.length],
                ["Total Pieces", totalPieces.toLocaleString()],
                ["Wishlist", wishlist.length],
                ["Minifigs", allMinifigs.length],
                ...(totalPaid > 0 ? [["Paid", "$"+totalPaid.toFixed(0)], ["Value", "$"+totalValue.toFixed(0)], [gain>=0?"Gain":"Loss", (gain>=0?"+$":"-$")+Math.abs(gain).toFixed(0)]] : [])
              ].map(([l,v])=>(
                <div key={l} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:"1.6rem", fontWeight:"900", fontFamily:"'Impact',sans-serif", color: l==="Gain"?"#22c55e": l==="Loss"?"#ef4444":"#ffd60a" }}>{v}</div>
                  <div style={{ fontSize:"0.65rem", letterSpacing:"0.2em", opacity:0.8, textTransform:"uppercase" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:"0", borderBottom:"2px solid #2a2a4a", background:"rgba(15,14,23,0.9)" }}>
          {TABS.map(tab => (
            <button key={tab} onClick={()=>{ setActiveTab(tab); setShowForm(false); }}
              style={{ flex:1, padding:"0.85rem", background:"none", border:"none", borderBottom: activeTab===tab?"3px solid #ffd60a":"3px solid transparent", color: activeTab===tab?"#ffd60a":"#666", fontFamily:"'Impact',sans-serif", letterSpacing:"0.1em", fontSize:"0.95rem", cursor:"pointer", transition:"color 0.15s" }}>
              {tab === "Collection" ? `📦 ${tab}` : tab === "Wishlist" ? `⭐ ${tab} (${wishlist.length})` : tab === "Hogwarts" ? `🏰 ${tab}` : `🧑 ${tab}`}
            </button>
          ))}
        </div>

        <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"1.5rem 1rem" }}>
          {toast && <div style={{ position:"fixed",top:"1rem",right:"1rem",zIndex:999,background:toast.type==="error"?"#ef4444":"#22c55e",color:"#fff",padding:"0.75rem 1.25rem",borderRadius:"8px",fontFamily:"sans-serif",fontSize:"0.9rem",fontWeight:"600",boxShadow:"0 4px 20px rgba(0,0,0,0.4)" }}>{toast.msg}</div>}

          {/* ── COLLECTION TAB ── */}
          {activeTab === "Collection" && (
            <>
              {!showForm && isAdmin && <button onClick={()=>{setShowForm(true);setEditId(null);setForm(EMPTY_FORM);}} style={{ background:"#ffd60a",color:"#0f0e17",border:"none",padding:"0.75rem 2rem",borderRadius:"8px",fontWeight:"900",fontSize:"1rem",cursor:"pointer",marginBottom:"1.5rem",fontFamily:"'Impact',sans-serif",letterSpacing:"0.05em",boxShadow:"0 4px 15px rgba(255,214,10,0.3)" }}>+ ADD MANUALLY</button>}

              {/* URL import box for collection */}
              {!showForm && isAdmin && (
                <div style={{ background:"rgba(26,26,46,0.92)",border:"1px solid #e6394633",borderRadius:"12px",padding:"1.25rem",marginBottom:"1.5rem",backdropFilter:"blur(4px)" }}>
                  <div style={{ fontSize:"0.8rem",color:"#e63946",fontFamily:"sans-serif",fontWeight:"700",marginBottom:"0.6rem",letterSpacing:"0.05em",textTransform:"uppercase" }}>
                    ⚡ Quick Add from LEGO.com URL
                  </div>
                  <div style={{ fontSize:"0.72rem",color:"#666",fontFamily:"sans-serif",marginBottom:"0.75rem" }}>
                    Paste any lego.com product URL and we'll look up all the details automatically
                  </div>
                  <div style={{ display:"flex",gap:"0.5rem" }}>
                    <input
                      value={urlInput}
                      onChange={e=>setUrlInput(e.target.value)}
                      onKeyDown={e=>e.key==="Enter" && importFromUrl("Built")}
                      placeholder="https://www.lego.com/en-au/product/..."
                      style={{...IS, flex:1, background:"rgba(15,14,23,0.8)"}}
                    />
                    <button onClick={()=>importFromUrl("Built")} disabled={urlLoading}
                      style={{ background:urlLoading?"#333":"#e63946",color:"#fff",border:"none",padding:"0.55rem 1.25rem",borderRadius:"6px",fontWeight:"900",cursor:urlLoading?"not-allowed":"pointer",fontFamily:"'Impact',sans-serif",fontSize:"0.9rem",whiteSpace:"nowrap" }}>
                      {urlLoading ? "..." : "ADD 🧱"}
                    </button>
                  </div>
                </div>
              )}

              {showForm && (
                <div style={{ background:"rgba(26,26,46,0.95)",border:"2px solid #e63946",borderRadius:"12px",padding:"1.5rem",marginBottom:"2rem",backdropFilter:"blur(4px)" }}>
                  <h2 style={{ margin:"0 0 1.25rem",fontFamily:"'Impact',sans-serif",letterSpacing:"0.05em",color:"#ffd60a",fontSize:"1.4rem" }}>{editId?"✏️ EDIT SET":"🧱 ADD NEW SET"}</h2>
                  {(form.setNumber||form.imageUrl) && (
                    <div style={{ marginBottom:"1.25rem",maxWidth:"260px" }}>
                      <SetImage setNumber={form.setNumber} imageUrl={form.imageUrl} size="card"/>
                    </div>
                  )}
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:"1rem" }}>
                    {[["Set Name *","name","text","e.g. Eiffel Tower"],["Set Number","setNumber","text","e.g. 10307"],["Year","year","number","e.g. 2023"],["Piece Count","pieces","number","e.g. 10001"],["Purchase Price ($)","purchasePrice","number","e.g. 49.99"],["Current Value ($)","currentValue","number","e.g. 89.99"]].map(([label,field,type,ph])=>(
                      <label key={field} style={LS}>{label}<input type={type} placeholder={ph} value={form[field]||""} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))} style={IS}/></label>
                    ))}
                    <label style={LS}>Theme<select value={form.theme} onChange={e=>setForm(f=>({...f,theme:e.target.value}))} style={IS}>{THEMES.map(t=><option key={t}>{t}</option>)}</select></label>
                    <label style={LS}>Status<select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} style={IS}>{STATUS_OPTIONS.map(s=><option key={s}>{s}</option>)}</select></label>
                    <label style={LS}>Folder / Colour<input type="text" placeholder="e.g. Aqua, Red" value={form.folder||""} onChange={e=>setForm(f=>({...f,folder:e.target.value}))} style={IS}/></label>
                    <label style={{...LS,gridColumn:"1 / -1"}}>Custom Image URL<input type="text" placeholder="https://..." value={form.imageUrl||""} onChange={e=>setForm(f=>({...f,imageUrl:e.target.value}))} style={IS}/></label>
                    <label style={{...LS,gridColumn:"1 / -1"}}>Notes / Minifigs<textarea value={form.notes||""} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={2} style={{...IS,resize:"vertical"}} placeholder="e.g. Minifigs: Harry Potter, Ron Weasley"/></label>
                  </div>
                  <div style={{ marginTop:"1rem" }}>
                    <div style={{ fontSize:"0.78rem",color:"#aaa",letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:"0.4rem" }}>Rating</div>
                    <div style={{ display:"flex",gap:"0.4rem" }}>{[1,2,3,4,5].map(n=><span key={n} onClick={()=>setForm(f=>({...f,rating:n}))} style={{ fontSize:"1.5rem",cursor:"pointer",opacity:(form.rating||0)>=n?1:0.3 }}>⭐</span>)}</div>
                  </div>
                  <div style={{ display:"flex",gap:"0.75rem",marginTop:"1.25rem" }}>
                    <button onClick={handleSubmit} style={{ background:"#e63946",color:"#fff",border:"none",padding:"0.65rem 1.5rem",borderRadius:"8px",fontWeight:"900",cursor:"pointer",fontFamily:"'Impact',sans-serif",fontSize:"0.95rem" }}>{editId?"SAVE CHANGES":"ADD TO VAULT"}</button>
                    <button onClick={()=>{setShowForm(false);setEditId(null);setForm(EMPTY_FORM);}} style={{ background:"transparent",color:"#aaa",border:"1px solid #444",padding:"0.65rem 1.25rem",borderRadius:"8px",cursor:"pointer",fontSize:"0.9rem" }}>Cancel</button>
                  </div>
                </div>
              )}

              <div style={{ display:"flex",gap:"0.75rem",flexWrap:"wrap",marginBottom:"1rem",alignItems:"center" }}>
                <input placeholder="🔍 Search name or set #..." value={search} onChange={e=>setSearch(e.target.value)} style={{...IS,flex:"1",minWidth:"160px",background:"rgba(26,26,46,0.9)"}}/>
                <select value={filterTheme} onChange={e=>setFilterTheme(e.target.value)} style={{...IS,background:"rgba(26,26,46,0.9)"}}>
                  {["All",...THEMES].map(t=><option key={t}>{t==="All"?"All Themes":t}</option>)}
                </select>
                <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{...IS,background:"rgba(26,26,46,0.9)"}}>
                  {["All",...STATUS_OPTIONS].map(s=><option key={s}>{s==="All"?"All Statuses":s}</option>)}
                </select>
                <select value={filterFolder} onChange={e=>setFilterFolder(e.target.value)} style={{...IS,background:"rgba(26,26,46,0.9)"}}>
                  <option value="All">All Folders</option>
                  {allFolders.map(f=><option key={f}>{f}</option>)}
                  <option value="(none)">No Folder</option>
                </select>
                <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{...IS,background:"rgba(26,26,46,0.9)"}}>
                  <option value="added">Recently Added</option>
                  <option value="name">Name A–Z</option>
                  <option value="year">Year (Newest)</option>
                  <option value="pieces">Most Pieces</option>
                  <option value="value">Highest Value</option>
                </select>
              </div>

              <div style={{ fontSize:"0.72rem",color:"#555",fontFamily:"sans-serif",marginBottom:"0.75rem" }}>Showing {filtered.length} of {owned.length} sets</div>

              {loading ? (
                <div style={{ textAlign:"center",color:"#aaa",padding:"3rem",fontFamily:"sans-serif" }}>Loading vault...</div>
              ) : (
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:"1rem" }}>
                  {filtered.map(set=>(
                    <div key={set.id} onClick={()=>setExpandedSet(expandedSet===set.id?null:set.id)}
                      style={{ background:"rgba(26,26,46,0.92)",border:`1px solid ${expandedSet===set.id ? (THEME_COLORS[set.theme]||"#e63946") : "#2a2a4a"}`,borderRadius:"12px",overflow:"hidden",cursor:"pointer",transition:"border-color 0.15s,transform 0.1s",transform:expandedSet===set.id?"scale(1.01)":"scale(1)",backdropFilter:"blur(4px)" }}>
                      <SetImage setNumber={set.setNumber} imageUrl={set.imageUrl} size="card"/>
                      <div style={{ padding:"0.85rem",display:"flex",flexDirection:"column",gap:"0.4rem" }}>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"0.5rem" }}>
                          <div style={{ fontSize:"0.9rem",fontWeight:"700",color:"#fffffe",lineHeight:1.3,flex:1 }}>{set.name}</div>
                          <span style={{ background:STATUS_COLORS[set.status]+"22",color:STATUS_COLORS[set.status],border:`1px solid ${STATUS_COLORS[set.status]}55`,fontSize:"0.58rem",fontFamily:"sans-serif",fontWeight:"700",padding:"0.12rem 0.4rem",borderRadius:"100px",whiteSpace:"nowrap",letterSpacing:"0.04em",textTransform:"uppercase",flexShrink:0 }}>{set.status}</span>
                        </div>
                        {set.setNumber && <div style={{ fontSize:"0.7rem",color:"#ffd60a",fontFamily:"monospace" }}>#{set.setNumber}</div>}
                        <div style={{ display:"flex",gap:"0.4rem",flexWrap:"wrap" }}>
                          <Chip icon="🏷️" val={set.theme}/>
                          {set.year && <Chip icon="📅" val={set.year}/>}
                          {set.pieces && <Chip icon="🔢" val={Number(set.pieces).toLocaleString()+" pcs"}/>}
                          {set.folder && <Chip icon="📁" val={set.folder}/>}
                          {set.minifigs && set.minifigs!=="0" && set.minifigs!=="" && <Chip icon="🧑" val={set.minifigs+" fig"+(set.minifigs==="1"?"":"s")}/>}
                        </div>
                        {/* Value row */}
                        {(set.purchasePrice || set.currentValue) && (
                          <div style={{ display:"flex",gap:"0.75rem",fontFamily:"sans-serif",fontSize:"0.75rem",marginTop:"0.1rem" }}>
                            {set.purchasePrice && <span style={{ color:"#888" }}>Paid: <span style={{ color:"#fffffe" }}>${parseFloat(set.purchasePrice).toFixed(2)}</span></span>}
                            {set.currentValue && <span style={{ color:"#888" }}>Value: <span style={{ color: parseFloat(set.currentValue)>parseFloat(set.purchasePrice||0)?"#22c55e":"#ef4444" }}>${parseFloat(set.currentValue).toFixed(2)}</span></span>}
                            {set.purchasePrice && set.currentValue && (() => {
                              const g = parseFloat(set.currentValue)-parseFloat(set.purchasePrice);
                              return <span style={{ color: g>=0?"#22c55e":"#ef4444" }}>{g>=0?"+":""}{g.toFixed(2)}</span>;
                            })()}
                          </div>
                        )}
                        {set.rating>0 && <div style={{ fontSize:"0.75rem" }}>{"⭐".repeat(set.rating)}{"☆".repeat(5-set.rating)}</div>}
                        {expandedSet===set.id && (
                          <div style={{ marginTop:"0.4rem",paddingTop:"0.75rem",borderTop:"1px solid #2a2a4a" }}>
                            {set.notes && <div style={{ fontSize:"0.75rem",color:"#888",fontFamily:"sans-serif",fontStyle:"italic",lineHeight:1.5,marginBottom:"0.75rem" }}>{set.notes}</div>}
                            <div style={{ display:"flex",gap:"0.5rem",flexWrap:"wrap" }} onClick={e=>e.stopPropagation()}>
                              <button onClick={e=>{e.stopPropagation();setSelectedSet(set);}} style={{ flex:1,background:"transparent",color:"#a78bfa",border:"1px solid #7c3aed44",padding:"0.4rem",borderRadius:"6px",cursor:"pointer",fontSize:"0.75rem",fontFamily:"sans-serif" }}>Details</button>
                              {isAdmin && <button onClick={()=>handleEdit(set)} style={{ flex:1,background:"transparent",color:"#60a5fa",border:"1px solid #2563eb44",padding:"0.4rem",borderRadius:"6px",cursor:"pointer",fontSize:"0.75rem",fontFamily:"sans-serif" }}>Edit</button>}
                              {isAdmin && <button onClick={()=>setConfirmDelete(set.id)} style={{ flex:1,background:"transparent",color:"#f87171",border:"1px solid #ef444444",padding:"0.4rem",borderRadius:"6px",cursor:"pointer",fontSize:"0.75rem",fontFamily:"sans-serif" }}>Delete</button>}
                              {set.setNumber && (
                                <a href={legoUrl(set.setNumber, set.name)} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
                                  style={{ flex:1,background:"#ffd60a22",color:"#ffd60a",border:"1px solid #ffd60a44",padding:"0.4rem",borderRadius:"6px",cursor:"pointer",fontSize:"0.75rem",fontFamily:"sans-serif",textDecoration:"none",textAlign:"center",display:"block" }}>
                                  🛒 LEGO.com
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── WISHLIST TAB ── */}
          {activeTab === "Wishlist" && (
            <>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem",flexWrap:"wrap",gap:"0.75rem" }}>
                <h2 style={{ margin:0,fontFamily:"'Impact',sans-serif",color:"#ffd60a",letterSpacing:"0.05em" }}>⭐ WISHLIST — {wishlist.length} SETS</h2>
{isAdmin && <button onClick={()=>{setShowForm(true);setEditId(null);setForm({...EMPTY_FORM,status:"Wanted"});setActiveTab("Collection");}} style={{ background:"#ffd60a",color:"#0f0e17",border:"none",padding:"0.6rem 1.25rem",borderRadius:"8px",fontWeight:"900",fontSize:"0.9rem",cursor:"pointer",fontFamily:"'Impact',sans-serif" }}>+ ADD MANUALLY</button>}
              </div>

              {/* URL import box */}
              {isAdmin && <div style={{ background:"rgba(26,26,46,0.92)",border:"1px solid #ffd60a33",borderRadius:"12px",padding:"1.25rem",marginBottom:"1.5rem",backdropFilter:"blur(4px)" }}>
                <div style={{ fontSize:"0.8rem",color:"#ffd60a",fontFamily:"sans-serif",fontWeight:"700",marginBottom:"0.6rem",letterSpacing:"0.05em",textTransform:"uppercase" }}>
                  ⚡ Quick Add from LEGO.com URL
                </div>
                <div style={{ fontSize:"0.72rem",color:"#666",fontFamily:"sans-serif",marginBottom:"0.75rem" }}>
                  Paste any lego.com product URL and we'll look up all the details automatically
                </div>
                <div style={{ display:"flex",gap:"0.5rem" }}>
                  <input
                    value={urlInput}
                    onChange={e=>setUrlInput(e.target.value)}
                    onKeyDown={e=>e.key==="Enter" && importFromUrl("Wanted")}
                    placeholder="https://www.lego.com/en-au/product/..."
                    style={{...IS, flex:1, background:"rgba(15,14,23,0.8)"}}
                  />
                  <button onClick={()=>importFromUrl("Wanted")} disabled={urlLoading}
                    style={{ background:urlLoading?"#333":"#e63946",color:"#fff",border:"none",padding:"0.55rem 1.25rem",borderRadius:"6px",fontWeight:"900",cursor:urlLoading?"not-allowed":"pointer",fontFamily:"'Impact',sans-serif",fontSize:"0.9rem",whiteSpace:"nowrap" }}>
                    {urlLoading ? "..." : "ADD ⭐"}
                  </button>
                </div>
              </div>}
              {wishlist.length === 0 ? (
                <div style={{ textAlign:"center",color:"#555",padding:"4rem",fontFamily:"sans-serif" }}>
                  <div style={{ fontSize:"3rem" }}>⭐</div>
                  <div style={{ marginTop:"0.5rem" }}>No sets on your wishlist yet</div>
                </div>
              ) : (
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:"1rem" }}>
                  {wishlist.map(set=>(
                    <div key={set.id} style={{ background:"rgba(26,26,46,0.92)",border:"1px solid #ec489944",borderRadius:"12px",overflow:"hidden",backdropFilter:"blur(4px)" }}>
                      <SetImage setNumber={set.setNumber} imageUrl={set.imageUrl} size="card"/>
                      <div style={{ padding:"0.85rem",display:"flex",flexDirection:"column",gap:"0.5rem" }}>
                        <div style={{ fontSize:"0.9rem",fontWeight:"700",color:"#fffffe",lineHeight:1.3 }}>{set.name}</div>
                        {set.setNumber && <div style={{ fontSize:"0.7rem",color:"#ffd60a",fontFamily:"monospace" }}>#{set.setNumber}</div>}
                        <div style={{ display:"flex",gap:"0.4rem",flexWrap:"wrap" }}>
                          <Chip icon="🏷️" val={set.theme}/>
                          {set.year && <Chip icon="📅" val={set.year}/>}
                          {set.pieces && <Chip icon="🔢" val={Number(set.pieces).toLocaleString()+" pcs"}/>}
                        </div>
                        {set.currentValue && <div style={{ fontSize:"0.75rem",color:"#888",fontFamily:"sans-serif" }}>RRP: <span style={{ color:"#fffffe" }}>${parseFloat(set.currentValue).toFixed(2)}</span></div>}
                        {set.notes && <div style={{ fontSize:"0.72rem",color:"#666",fontFamily:"sans-serif",fontStyle:"italic" }}>{set.notes}</div>}
                        {isAdmin && <div style={{ display:"flex",gap:"0.5rem",marginTop:"0.25rem" }}>
                          <button onClick={()=>markOwned(set.id)} style={{ flex:2,background:"#22c55e22",color:"#22c55e",border:"1px solid #22c55e44",padding:"0.45rem",borderRadius:"6px",cursor:"pointer",fontSize:"0.75rem",fontFamily:"sans-serif",fontWeight:"700" }}>✓ Mark Owned</button>
                          <button onClick={()=>handleEdit(set)} style={{ flex:1,background:"transparent",color:"#60a5fa",border:"1px solid #2563eb44",padding:"0.45rem",borderRadius:"6px",cursor:"pointer",fontSize:"0.75rem",fontFamily:"sans-serif" }}>Edit</button>
                          <button onClick={()=>setConfirmDelete(set.id)} style={{ flex:1,background:"transparent",color:"#f87171",border:"1px solid #ef444444",padding:"0.45rem",borderRadius:"6px",cursor:"pointer",fontSize:"0.75rem",fontFamily:"sans-serif" }}>✕</button>
                        </div>}
                        {set.setNumber && (
                          <a href={legoUrl(set.setNumber, set.name)} target="_blank" rel="noreferrer"
                            style={{ background:"#ffd60a22",color:"#ffd60a",border:"1px solid #ffd60a44",padding:"0.4rem",borderRadius:"6px",fontSize:"0.75rem",fontFamily:"sans-serif",textDecoration:"none",textAlign:"center",display:"block" }}>
                            🛒 View on LEGO.com
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── MINIFIGURES TAB ── */}
          {activeTab === "Minifigures" && (
            <>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem",flexWrap:"wrap",gap:"0.75rem" }}>
                <h2 style={{ margin:0,fontFamily:"'Impact',sans-serif",color:"#ffd60a",letterSpacing:"0.05em" }}>🧑 MINIFIGURES — {allMinifigs.length} TOTAL</h2>
                <input placeholder="🔍 Search minifigs or sets..." value={minifigSearch} onChange={e=>setMinifigSearch(e.target.value)}
                  style={{...IS,width:"260px",background:"rgba(26,26,46,0.9)"}}/>
              </div>
              {filteredMinifigs.length === 0 ? (
                <div style={{ textAlign:"center",color:"#555",padding:"4rem",fontFamily:"sans-serif" }}>
                  <div style={{ fontSize:"3rem" }}>🧑</div>
                  <div style={{ marginTop:"0.5rem" }}>No minifigures found</div>
                </div>
              ) : (
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"0.75rem" }}>
                  {filteredMinifigs.map((m,i)=>(
                    <div key={i} style={{ background:"rgba(26,26,46,0.92)",border:"1px solid #2a2a4a",borderRadius:"10px",padding:"0.75rem",display:"flex",flexDirection:"column",gap:"0.35rem",backdropFilter:"blur(4px)" }}>
                      <div style={{ fontSize:"0.85rem",fontWeight:"700",color:"#fffffe",lineHeight:1.3 }}>{m.name}</div>
                      <div style={{ fontSize:"0.7rem",color:"#888",fontFamily:"sans-serif" }}>from</div>
                      <div style={{ fontSize:"0.75rem",color:"#ffd60a",fontFamily:"sans-serif",lineHeight:1.3 }}>{m.setName}</div>
                      <div style={{ display:"flex",gap:"0.4rem",flexWrap:"wrap",marginTop:"0.1rem" }}>
                        <Chip icon="🏷️" val={m.theme}/>
                        {m.setNumber && <Chip icon="#" val={m.setNumber}/>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}


          {/* ── HOGWARTS TRACKER TAB ── */}
          {activeTab === "Hogwarts" && (
            <>
              <h2 style={{ margin:"0 0 0.5rem",fontFamily:"'Impact',sans-serif",color:"#ffd60a",letterSpacing:"0.05em" }}>🏰 HOGWARTS COMPLETION TRACKER</h2>
              <p style={{ color:"#666",fontFamily:"sans-serif",fontSize:"0.8rem",marginBottom:"1.5rem" }}>
                Track which Hogwarts locations you have covered across your Harry Potter collection.
              </p>
              {(() => {
                const ownedNums = new Set(sets.filter(s=>s.status!=="Wanted").map(s=>s.setNumber));
                const completed = HOGWARTS_LOCATIONS.filter(loc => loc.sets.some(n => ownedNums.has(n)));
                const pct = Math.round((completed.length / HOGWARTS_LOCATIONS.length) * 100);
                return (
                  <>
                    {/* Progress bar */}
                    <div style={{ background:"rgba(26,26,46,0.9)",borderRadius:"12px",padding:"1.25rem",marginBottom:"1.5rem",border:"1px solid #7b2d8b44" }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.6rem" }}>
                        <span style={{ fontFamily:"'Impact',sans-serif",color:"#ffd60a",letterSpacing:"0.05em" }}>OVERALL COMPLETION</span>
                        <span style={{ fontFamily:"'Impact',sans-serif",color:"#ffd60a",fontSize:"1.5rem" }}>{pct}%</span>
                      </div>
                      <div style={{ background:"#1a1a2e",borderRadius:"100px",height:"12px",overflow:"hidden" }}>
                        <div style={{ width:`${pct}%`,height:"100%",background:"linear-gradient(90deg,#7b2d8b,#a855f7)",borderRadius:"100px",transition:"width 0.5s" }}/>
                      </div>
                      <div style={{ fontSize:"0.75rem",color:"#666",fontFamily:"sans-serif",marginTop:"0.5rem" }}>{completed.length} of {HOGWARTS_LOCATIONS.length} locations covered</div>
                    </div>
                    {/* Location grid */}
                    <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"0.75rem" }}>
                      {HOGWARTS_LOCATIONS.map(loc => {
                        const have = loc.sets.filter(n => ownedNums.has(n));
                        const done = have.length > 0;
                        const coveredSets = sets.filter(s => loc.sets.includes(s.setNumber));
                        return (
                          <div key={loc.name} style={{ background:"rgba(26,26,46,0.92)",border:`1px solid ${done?"#7b2d8b":"#2a2a4a"}`,borderRadius:"10px",padding:"0.9rem",backdropFilter:"blur(4px)" }}>
                            <div style={{ display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.4rem" }}>
                              <span style={{ fontSize:"1.2rem" }}>{loc.icon}</span>
                              <span style={{ fontWeight:"700",color: done?"#fffffe":"#555",fontSize:"0.85rem",fontFamily:"sans-serif" }}>{loc.name}</span>
                              {done && <span style={{ marginLeft:"auto",color:"#a855f7",fontSize:"0.8rem" }}>✓</span>}
                            </div>
                            {coveredSets.length > 0 ? (
                              <div style={{ display:"flex",flexDirection:"column",gap:"0.2rem" }}>
                                {coveredSets.map(s=>(
                                  <div key={s.id} onClick={()=>setSelectedSet(s)} style={{ fontSize:"0.7rem",color:"#888",fontFamily:"sans-serif",cursor:"pointer",textDecoration:"underline dotted" }}>
                                    #{s.setNumber} {s.name}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{ fontSize:"0.7rem",color:"#444",fontFamily:"sans-serif",fontStyle:"italic" }}>Not in collection</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </>
          )}

          {/* ── SET DETAIL MODAL ── */}
          {selectedSet && (
            <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:"1rem" }}
              onClick={()=>setSelectedSet(null)}>
              <div onClick={e=>e.stopPropagation()} style={{ background:"#1a1a2e",border:`2px solid ${THEME_COLORS[selectedSet.theme]||"#e63946"}`,borderRadius:"16px",maxWidth:"480px",width:"100%",maxHeight:"90vh",overflow:"auto" }}>
                {/* Set image */}
                <div style={{ height:"240px",background:"#fff",borderRadius:"14px 14px 0 0",overflow:"hidden" }}>
                  {(() => {
                    const urls = selectedSet.imageUrl ? [selectedSet.imageUrl] : getImageUrls(selectedSet.setNumber);
                    return urls.length ? <img src={urls[0]} alt="" style={{ width:"100%",height:"100%",objectFit:"contain" }} onError={e=>e.target.style.display="none"}/> : <div style={{ height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"3rem" }}>🧱</div>;
                  })()}
                </div>
                <div style={{ padding:"1.5rem" }}>
                  {/* Theme badge */}
                  <div style={{ display:"inline-flex",alignItems:"center",gap:"0.4rem",background:(THEME_COLORS[selectedSet.theme]||"#666")+"22",color:THEME_COLORS[selectedSet.theme]||"#666",border:`1px solid ${THEME_COLORS[selectedSet.theme]||"#666"}44`,borderRadius:"100px",padding:"0.2rem 0.75rem",fontSize:"0.72rem",fontFamily:"sans-serif",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"0.75rem" }}>
                    <span style={{ width:"6px",height:"6px",borderRadius:"50%",background:THEME_COLORS[selectedSet.theme]||"#666" }}/>
                    {selectedSet.theme}
                  </div>
                  <h2 style={{ margin:"0 0 0.25rem",color:"#fffffe",fontFamily:"'Impact',sans-serif",letterSpacing:"0.03em",fontSize:"1.5rem" }}>{selectedSet.name}</h2>
                  {selectedSet.setNumber && <div style={{ color:"#ffd60a",fontFamily:"monospace",fontSize:"0.85rem",marginBottom:"1rem" }}>#{selectedSet.setNumber}</div>}
                  {/* Stats grid */}
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.6rem",marginBottom:"1rem" }}>
                    {[
                      ["📅 Year", selectedSet.year],
                      ["🔢 Pieces", selectedSet.pieces ? Number(selectedSet.pieces).toLocaleString() : null],
                      ["🧑 Minifigs", selectedSet.minifigs && selectedSet.minifigs!=="0" ? selectedSet.minifigs : null],
                      ["📁 Folder", selectedSet.folder],
                      ["💰 Paid", selectedSet.purchasePrice ? "$"+parseFloat(selectedSet.purchasePrice).toFixed(2) : null],
                      ["📈 Value", selectedSet.currentValue ? "$"+parseFloat(selectedSet.currentValue).toFixed(2) : null],
                    ].filter(([,v])=>v).map(([label,val])=>(
                      <div key={label} style={{ background:"rgba(255,255,255,0.04)",borderRadius:"8px",padding:"0.6rem 0.75rem" }}>
                        <div style={{ fontSize:"0.65rem",color:"#666",fontFamily:"sans-serif",textTransform:"uppercase",letterSpacing:"0.05em" }}>{label}</div>
                        <div style={{ fontSize:"0.9rem",color:"#fffffe",fontFamily:"sans-serif",fontWeight:"700",marginTop:"0.1rem" }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  {/* Status */}
                  <div style={{ display:"flex",gap:"0.5rem",alignItems:"center",marginBottom:"1rem" }}>
                    <span style={{ background:(STATUS_COLORS[selectedSet.status]||"#666")+"22",color:STATUS_COLORS[selectedSet.status]||"#666",border:`1px solid ${STATUS_COLORS[selectedSet.status]||"#666"}55`,fontSize:"0.72rem",fontFamily:"sans-serif",fontWeight:"700",padding:"0.2rem 0.6rem",borderRadius:"100px",textTransform:"uppercase",letterSpacing:"0.04em" }}>{selectedSet.status}</span>
                    {selectedSet.rating>0 && <span style={{ fontSize:"0.9rem" }}>{"⭐".repeat(selectedSet.rating)}{"☆".repeat(5-selectedSet.rating)}</span>}
                  </div>
                  {/* Notes / minifig names */}
                  {selectedSet.notes && (
                    <div style={{ background:"rgba(255,255,255,0.03)",borderRadius:"8px",padding:"0.75rem",marginBottom:"1rem",fontSize:"0.78rem",color:"#888",fontFamily:"sans-serif",lineHeight:1.6 }}>
                      {selectedSet.notes}
                    </div>
                  )}
                  {/* Gain/loss */}
                  {selectedSet.purchasePrice && selectedSet.currentValue && (() => {
                    const g = parseFloat(selectedSet.currentValue)-parseFloat(selectedSet.purchasePrice);
                    return <div style={{ fontSize:"0.85rem",color:g>=0?"#22c55e":"#ef4444",fontFamily:"sans-serif",fontWeight:"700",marginBottom:"1rem" }}>{g>=0?"▲ Up":"▼ Down"} ${Math.abs(g).toFixed(2)} since purchase</div>;
                  })()}
                  {/* Action buttons */}
                  <div style={{ display:"flex",gap:"0.5rem",flexWrap:"wrap" }}>
                    {selectedSet.setNumber && (
                      <a href={legoUrl(selectedSet.setNumber, selectedSet.name)} target="_blank" rel="noreferrer"
                        style={{ flex:1,background:"#ffd60a22",color:"#ffd60a",border:"1px solid #ffd60a44",padding:"0.55rem",borderRadius:"8px",textDecoration:"none",textAlign:"center",fontSize:"0.8rem",fontFamily:"sans-serif",fontWeight:"700" }}>
                        🛒 LEGO.com
                      </a>
                    )}
                    {isAdmin && <button onClick={()=>{handleEdit(selectedSet);setSelectedSet(null);}} style={{ flex:1,background:"transparent",color:"#60a5fa",border:"1px solid #2563eb44",padding:"0.55rem",borderRadius:"8px",cursor:"pointer",fontSize:"0.8rem",fontFamily:"sans-serif" }}>✏️ Edit</button>}
                    <button onClick={()=>setSelectedSet(null)} style={{ flex:1,background:"transparent",color:"#aaa",border:"1px solid #444",padding:"0.55rem",borderRadius:"8px",cursor:"pointer",fontSize:"0.8rem",fontFamily:"sans-serif" }}>Close</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Password prompt modal */}
          {showPasswordPrompt && (
            <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100 }}>
              <div style={{ background:"#1a1a2e",border:"2px solid #ffd60a",borderRadius:"12px",padding:"2rem",maxWidth:"320px",width:"90%",fontFamily:"sans-serif" }}>
                <div style={{ fontSize:"1.5rem",marginBottom:"0.5rem",textAlign:"center" }}>🔒</div>
                <div style={{ fontWeight:"700",marginBottom:"0.25rem",textAlign:"center",fontFamily:"'Impact',sans-serif",letterSpacing:"0.05em",color:"#ffd60a",fontSize:"1.1rem" }}>ADMIN LOGIN</div>
                <div style={{ color:"#666",fontSize:"0.8rem",marginBottom:"1.25rem",textAlign:"center" }}>Enter password to unlock editing</div>
                <input
                  type="password"
                  placeholder="Password"
                  value={passwordInput}
                  onChange={e=>{ setPasswordInput(e.target.value); setPasswordError(false); }}
                  onKeyDown={e=>e.key==="Enter" && attemptLogin()}
                  autoFocus
                  style={{ ...IS, marginBottom:"0.5rem", background:"#0f0e17" }}
                />
                {passwordError && <div style={{ color:"#ef4444",fontSize:"0.78rem",marginBottom:"0.75rem" }}>Incorrect password</div>}
                <div style={{ display:"flex",gap:"0.75rem",marginTop:"0.75rem" }}>
                  <button onClick={attemptLogin} style={{ flex:1,background:"#ffd60a",color:"#0f0e17",border:"none",padding:"0.6rem",borderRadius:"8px",cursor:"pointer",fontWeight:"900",fontFamily:"'Impact',sans-serif" }}>UNLOCK</button>
                  <button onClick={()=>{ setShowPasswordPrompt(false); setPasswordInput(""); setPasswordError(false); }} style={{ flex:1,background:"transparent",color:"#aaa",border:"1px solid #444",padding:"0.6rem",borderRadius:"8px",cursor:"pointer" }}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {confirmDelete && (
            <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100 }}>
              <div style={{ background:"#1a1a2e",border:"2px solid #e63946",borderRadius:"12px",padding:"2rem",maxWidth:"320px",textAlign:"center",fontFamily:"sans-serif" }}>
                <div style={{ fontSize:"1.5rem",marginBottom:"0.75rem" }}>🗑️</div>
                <div style={{ fontWeight:"700",marginBottom:"0.5rem" }}>Delete this set?</div>
                <div style={{ color:"#aaa",fontSize:"0.85rem",marginBottom:"1.25rem" }}>This can't be undone.</div>
                <div style={{ display:"flex",gap:"0.75rem",justifyContent:"center" }}>
                  <button onClick={()=>handleDelete(confirmDelete)} style={{ background:"#e63946",color:"#fff",border:"none",padding:"0.6rem 1.25rem",borderRadius:"8px",cursor:"pointer",fontWeight:"700" }}>Delete</button>
                  <button onClick={()=>setConfirmDelete(null)} style={{ background:"transparent",color:"#aaa",border:"1px solid #444",padding:"0.6rem 1.25rem",borderRadius:"8px",cursor:"pointer" }}>Cancel</button>
                </div>
              </div>
            </div>
          )}
          {/* Export buttons */}
          <div style={{ marginTop:"2rem",display:"flex",justifyContent:"center",gap:"1rem",flexWrap:"wrap" }}>
            <button onClick={()=>exportCSV(sets)} style={{ background:"rgba(26,26,46,0.9)",color:"#22c55e",border:"1px solid #22c55e44",padding:"0.6rem 1.25rem",borderRadius:"8px",cursor:"pointer",fontSize:"0.85rem",fontFamily:"sans-serif",fontWeight:"700" }}>
              📥 Export Full Collection (CSV)
            </button>
            <button onClick={()=>exportCSV(sets.filter(s=>s.status==="Wanted"),"lego-wishlist")} style={{ background:"rgba(26,26,46,0.9)",color:"#ec4899",border:"1px solid #ec489944",padding:"0.6rem 1.25rem",borderRadius:"8px",cursor:"pointer",fontSize:"0.85rem",fontFamily:"sans-serif",fontWeight:"700" }}>
              📥 Export Wishlist (CSV)
            </button>
          </div>
          <div style={{ marginTop:"1rem",fontSize:"0.65rem",color:"#2a2a3a",fontFamily:"sans-serif",textAlign:"center" }}>
            Images auto-fetched from Brickset · Paste a custom URL in Edit if a set is missing
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({icon,val}) {
  return <span style={{ background:"#ffffff0f",color:"#bbb",borderRadius:"100px",padding:"0.12rem 0.5rem",fontSize:"0.68rem",fontFamily:"sans-serif",display:"flex",alignItems:"center",gap:"0.2rem" }}>{icon} {val}</span>;
}

const IS = { background:"rgba(15,14,23,0.8)",border:"1px solid #333",color:"#fffffe",padding:"0.55rem 0.75rem",borderRadius:"6px",fontSize:"0.9rem",fontFamily:"sans-serif",width:"100%",boxSizing:"border-box" };
const LS = { display:"flex",flexDirection:"column",gap:"0.3rem",fontSize:"0.78rem",color:"#aaa",letterSpacing:"0.05em",textTransform:"uppercase" };
