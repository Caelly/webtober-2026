import {sculptures,parts,p,e,r,s} from './sculptures.js';
import {palette,catalogCharacters} from './catalog.js';

const color=value=>palette[value]||palette[value?.split('-')[0]]||palette[value?.split('-').at(-1)]||'#b7a77d';
const has=(c,key)=>c.design.features.some(f=>f===key||f.startsWith(`${key}:`));
const val=(c,key)=>c.design.features.find(f=>f.startsWith(`${key}:`))?.slice(key.length+1);
const ink='#303139',ivory='#eee8d9';
const hairStyles={
  short:h=>parts.cropHair(h),
  parted:h=>p('M9 39Q4 13 28 10Q49 7 66 16L72 37 61 31 49 19Q30 17 18 39Z',h)+s('M44 13 48 23','#fff',1,'opacity=".18"'),
  bob:h=>parts.bob(h),
  long:h=>parts.sweepHair(h),
  wavy:h=>p('M8 41Q0 27 13 19Q12 3 33 10Q53 0 63 14Q80 14 73 38L65 49 60 32 52 24Q30 20 18 41Z',h),
  curly:h=>[12,22,33,44,55,66].map((x,i)=>e(x,20+i%2*5,9,12,h)).join(''),
  spiky:h=>p('M8 36 2 24 14 24 10 8 26 15 30 0 40 15 52 3 57 18 74 10 70 29 78 31 65 42 56 26 24 26 16 43Z',h),
  flat:h=>p('M9 38 11 7H65L71 37 61 31 59 26H23L18 40Z',h),
  bowl:h=>p('M8 41Q4 10 38 9Q75 8 73 40L62 32H18L16 42Z',h),
  braid:h=>parts.sweepHair(h),braids:h=>parts.sweepHair(h),ponytail:h=>parts.sweepHair(h),ponytails:h=>parts.sweepHair(h),pigtails:h=>parts.cropHair(h),
  dreads:h=>[10,18,26,34,42,50,58,66].map((x,i)=>s(`M${x} 34Q${x-4} 10 ${x+5} ${15+i%3*3}L${x+2} 43`,h,7)).join(''),
  bun:h=>parts.sweepHair(h)+e(40,9,11,9,h),
  twinbun:h=>parts.sweepHair(h)+e(8,32,10,11,h)+e(72,32,10,11,h),
  triplebun:h=>parts.sweepHair(h)+e(66,24,7,7,h)+e(67,42,6,7,h)+e(65,59,5,6,h),
  topknot:h=>parts.sweepHair(h)+p('M34 17 31 2 44 1 49 15Z',h),
  mohawk:h=>p('M31 30 26 7 34 0 37 12 44 2 47 26Z',h),
  afro:h=>[12,25,40,55,68].map((x,i)=>e(x,25+i%2*4,13,20,h)).join('')+r(15,11,52,20,12,h),
  tall:h=>p('M16 31Q6 16 18 5Q14-10 36-7Q54-12 63 5Q77 17 66 34L57 27H24Z',h),
  bandana:h=>p('M10 25H69L70 35 39 28 10 35Z',h)+p('M68 32 79 41 77 50 65 36Z',h),
  hood:h=>p('M8 43Q4 11 39 9Q75 10 74 44L65 70 57 61 62 33 48 20 28 22 17 38 22 60 14 70Z',h),
  helmet:h=>p('M7 37Q6 8 40 8Q76 8 74 39L68 60 57 62V36H23V61L12 59Z',h)+s('M14 24Q40 12 67 24','#fff',1,'opacity=".2"'),
  tentacles:h=>parts.sweepHair(h)+p('M10 30Q-1 51 10 78L17 94 25 91 16 53M70 30Q81 51 70 78L63 94 55 91 64 53Z',h),
  snakehair:h=>[10,25,40,55,70].map((x,i)=>s(`M${x} 33Q${x-8} 8 ${x+4} ${13+i%2*5}Q${x+12} 18 ${x+9} 6`,h,6)+e(x+9,6,4,4,h)).join(''),
  bald:()=>'',square:()=>'',
};
const tools={
  wand:s('M62 105 72 68','#775331',2)+e(72,67,2,2,'#e4cf8f'),
  sword:p('M66 94 69 59 73 54 76 61 71 95Z','#c1cbd0')+s('M61 94 76 96','#b9a16b',3)+s('M67 97 66 108','#674c3b',4),
  katana:s('M66 109 71 58','#cbd1d0',2)+s('M63 94H76','#d6b36d',2)+s('M66 97 65 108','#454139',4),
  saber:s('M68 106V94','#aaaab0',3)+s('M68 93V57','#91d5cb',3),
  gun:r(60,81,18,6,1,'#49525a')+p('M63 86H70L69 99H63Z','#393d43'),
  pistol:r(59,83,18,5,1,'#687172')+p('M61 87H67L66 97H61Z','#4a4440'),
  bow:s('M68 62Q88 84 65 108M68 62 65 108','#b29565',2),
  staff:s('M68 112V54','#9b7b50',3)+e(68,53,5,6,'#8aa9aa'),
  spear:s('M69 115V53','#877553',2.5)+p('M65 54 70 38 75 54 70 62Z','#b5c5c6'),
  trident:s('M69 112V53M60 47V61H78V47M69 42V64','#c3a353',2.5),
  hammer:s('M66 107 67 78','#96784e',4)+r(53,70,26,15,2,'#9daaae'),
  axe:s('M65 109 71 67','#8a6541',3)+p('M60 61Q48 79 60 88L69 83 75 68Z','#a9b5b8'),
  book:r(57,84,21,18,2,'#815846')+s('M67 86V101M60 88H65M70 88H75','#d9c596',1),
  notebook:r(59,84,17,20,1,'#788b86')+s('M63 90H72M63 94H72M63 98H72','#e2ddcb',1),
  scroll:r(56,84,21,17,1,'#e6d8b7')+e(57,84,3,2,'#b6a180')+e(76,101,3,2,'#b6a180')+s('M60 89H72M60 92H70','#7c7567',1),
  fan:p('M62 98 50 77Q70 64 82 79L65 99Z','#c2a9bd')+s('M62 98 54 79M63 98 66 74M65 98 77 80','#84717d',1),
  umbrella:s('M69 111V64Q47 63 58 49Q74 34 84 62H69','#b28368',2.5),
  parasol:s('M68 110V65','#aab4ad',2)+p('M48 65Q67 32 85 65Z','#d49ab2'),
  guitar:e(62,99,12,14,'#cda769')+e(62,90,8,8,'#cda769')+s('M63 93 70 63','#7c5a42',4)+e(61,95,3,3,'#453c35'),
  violin:e(63,98,8,12,'#ac7750')+s('M64 93 69 69','#775338',3)+s('M73 106 56 73','#8c724e',1),
  cane:s('M67 112V81Q67 73 76 78','#9e7c51',2.5),
  knife:p('M66 93 69 67 76 66 73 95Z','#b7c1c2')+s('M69 95 67 106','#765d4a',3),
  scythe:s('M67 110V59','#5f625d',3)+p('M68 61Q82 55 83 77L76 72 67 69Z','#bcc6c4'),
  crossbow:r(59,80,16,6,1,'#6e7067')+s('M56 77Q70 88 79 76M68 82V97','#9e8660',3),
  slingshot:s('M65 102 66 85 59 76M66 85 74 76M59 76H74','#a38c63',3),
  fishingrod:s('M64 111 74 59Q82 58 81 96','#947c4b',1.5)+e(80,98,2,3,'#b69768'),
  broom:s('M66 63 62 110','#8d6e4c',3)+p('M57 98 54 113 70 116 67 98Z','#b59762'),
  microphone:s('M68 92 63 105','#5b6770',3)+e(70,89,4,5,'#969da2'),
  saxophone:s('M71 71 65 97Q76 109 78 93','#c3a453',4)+p('M74 96 82 90 83 100Z','#d1b968'),
  shield:e(66,89,13,17,'#9b9d88')+e(66,89,8,12,'#778b86'),
  cards:r(60,85,14,19,1,'#eee5d2')+parts.star(67,93,'#be5865',.55),
  claybird:p('M60 88 51 82 64 85 68 77 73 86 82 82 75 91 65 93Z',ivory),
  cheese:p('M57 88 76 84 76 101H57Z','#d5b866')+e(63,92,2,2,'#aa9455')+e(71,97,2,2,'#aa9455'),
  carrot:p('M65 101 59 84 72 84Z','#d58b44')+p('M61 86 59 76 65 80 68 74 71 85Z','#7a9853'),
  donut:e(67,92,8,8,'#d0a87b')+e(67,92,3,3,'#706653'),
  apple:e(66,92,7,8,'#b85a4c')+p('M66 85Q71 77 76 81L69 86Z','#638c57'),
  ring:e(67,94,5,6,'none','stroke="#d6b460" stroke-width="2"'),
  teacup:e(64,89,7,3,'#dedacb')+p('M57 89H71L70 99H59Z','#ede6d6')+e(73,94,3,4,'none','stroke="#d0ccb9" stroke-width="1.5"'),
  teddy:e(65,94,7,10,'#aa8868')+e(65,82,7,7,'#aa8868')+e(59,77,3,3,'#aa8868')+e(71,77,3,3,'#aa8868'),
  ball:e(66,92,8,8,'#d1b879')+s('M60 88Q69 89 72 97','#6b6350',1),
  tools:r(60,92,17,12,2,'#876f50')+s('M63 92V82M69 91V79M74 92V84','#afbcb9',2),
  spoon:s('M68 104 70 80','#a8b8b4',2)+e(70,78,4,6,'#bfcac2'),
};
for(const [alias,original] of Object.entries({pistols:'pistol',pistols2:'pistol',rifle:'gun',sniper:'gun',swords:'sword',blades:'knife',daggers:'knife',knives:'knife',batons:'staff',mace:'hammer',club:'staff',kunai:'knife',keyblade:'sword',gunblade:'sword',rapier:'katana',arrow:'spear',pickaxe:'axe',wood:'staff',clarinet:'staff',lute:'guitar','axe-guitar':'guitar','wooden-spoon':'spoon',pendulum:'ring',pizza:'cheese',plant:'carrot',leek:'carrot',banana:'carrot',pan:'shield',briefcase:'book',laptop:'book',clipboard:'notebook',mirror:'shield',cigarette:'wand',cigar:'wand',cigars:'wand',scrolls:'scroll',yoyo:'ball',dice:'ball',cup:'teacup',sock:'scroll',portalgun:'gun'}))tools[alias]=tools[original];

function costume(c) {
  const {clothing}=c.design,o=c.outfit,h=c.hair;
  let art='';
  if(['coat','robe','jacket'].includes(clothing))art+=p('M25 70 34 76 31 108 17 105 21 76M55 70 46 76 49 108 63 105 59 76Z',o)+s('M31 74 40 85 49 74','#ded9c8',1.5);
  if(clothing==='suit')art+=p('M24 70 34 74 40 85 46 74 56 70 57 99H23Z',o)+p('M33 72H47L40 84Z',ivory)+p('M39 80H42L44 94 39 97 37 91Z','#765150');
  if(clothing==='armor'||clothing==='armour')art+=p('M23 71 31 68 40 74 49 68 57 71 58 96 47 102H31L22 96Z',o)+s('M28 76 40 82 53 76M30 88H51','#eee9dc',1.5,'opacity=".5"')+r(7,73,14,10,4,o)+r(59,73,14,10,4,o);
  if(clothing==='uniform')art+=s('M40 72V97','#d4c5a2',1.2)+[79,86,93].map(y=>e(42,y,1.2,1.2,'#dab655')).join('')+r(25,80,8,7,1,'#4d5c5f');
  if(clothing==='vest')art+=p('M22 72 31 71 34 97H22M58 72 49 71 46 97H58Z',o)+p('M32 72H48V94H32Z',ivory);
  if(clothing==='overalls')art+=p('M26 72H31V83H49V72H55V102H25Z',o)+e(31,84,2,2,'#d6b864')+e(50,84,2,2,'#d6b864');
  if(['shorts','trousers','trunks'].includes(clothing))art+=p('M23 69H57V94H23Z',c.skin)+p('M23 91H57L57 105H44L40 97 36 105H23Z',o);
  if(clothing==='gi')art+=p('M25 70 40 85 53 70 50 94H28Z',o)+s('M27 73 42 86 47 75','#38445a',2)+r(23,93,34,4,1,'#354c73');
  if(clothing==='shirt'||clothing==='sweater')art+=s('M25 73Q40 81 55 73','#fff',1,'opacity=".35"')+p('M23 98H58L57 105H44L40 98 36 105H24Z','#3e5269');
  return art;
}

function headwear(kind,tone='#8c7955') {
  if(['tophat','tallhat'].includes(kind))return e(40,20,31,5,tone)+r(22,-3,37,24,3,tone)+s('M22 16H59','#b6a47d',3);
  if(['cap','hat','beanie','beret','fedora','bowler','strawhat'].includes(kind))return p('M10 23Q12 6 40 5Q67 6 70 24Z',tone)+e(43,23,36,4,tone)+s('M17 20H62','#665740',3);
  if(['witchhat','piratehat'].includes(kind))return e(40,23,39,5,tone)+p(kind==='witchhat'?'M16 22 42-3 58 23Z':'M8 23 17 5 38 13 61 3 73 22Z',tone)+parts.star(40,18,ivory,.55);
  if(kind==='chefhat'||kind==='turban')return e(24,10,12,12,tone)+e(42,6,15,13,tone)+e(59,11,11,12,tone)+r(20,15,40,10,3,tone);
  if(['crown','hornhelmet','horsehelmet'].includes(kind))return p('M15 24 14 9 26 18 40 1 53 18 66 9 65 25Z',tone)+e(40,16,3,4,'#b76968');
  if(kind==='fez')return p('M25 20 28 1H52L57 20Z',tone)+s('M43 4Q51 7 50 15',ink,2);
  if(kind==='jesterhat')return p('M13 26 3 2 35 18 48-1 72 13 67 29Z',tone)+e(3,2,3,3,'#d6b35e')+e(48,0,3,3,'#d6b35e');
  return '';
}

function details(c,sculpt) {
  const features=c.design.features;
  for(const feature of features){
    const [key,value]=feature.split(':'),tone=color(value);
    if(tools[key]){
      let tool=tools[key];
      if(key==='saber')tool=s('M68 106V94','#aaaab0',3)+s('M68 93V55',tone,3)+s('M68 93V55','#fff',1.1,'opacity=".6"');
      sculpt.prop+=tool;
    }
    if(['glasses','sunglasses','goggles','eyemask'].includes(key))sculpt.face+=e(24,40,11,11,key==='sunglasses'?ink:'none',`stroke="${value?tone:ink}" stroke-width="2"`)+e(56,40,11,11,key==='sunglasses'?ink:'none',`stroke="${value?tone:ink}" stroke-width="2"`)+s('M35 39H45',ink,2);
    if(key==='visor'||key==='blindfold')sculpt.face+=r(12,33,57,14,3,value?tone:ink)+s('M17 36H63','#fff',1,'opacity=".25"');
    if(key==='mask')sculpt.face+=value==='spiral'?e(40,40,28,27,'#bf833f')+s('M40 26Q58 25 55 40Q49 58 31 50Q18 45 24 30Q38 17 59 30','#5b4637',1.5):p('M15 43 33 49H49L66 43 63 61 47 65H30L17 59Z',value?tone:c.outfit);
    if(key==='facehalf')sculpt.underEyes+=p('M41 17H54Q72 17 70 42L68 53Q59 66 41 67Z',tone);
    if(key==='cyborg')sculpt.underEyes+=p('M44 20 64 26 68 44 60 59 44 60 47 45 41 36Z','#a7b2b7');
    if(key==='muzzle'&&value==='bamboo')sculpt.face+=r(24,54,32,9,3,'#789767')+s('M29 55V61M42 55V61M51 55V61','#b4c59a',1.2);
    if(['hat','cap','beanie','beret','fedora','bowler','tophat','tallhat','strawhat','piratehat','witchhat','chefhat','turban','crown','hornhelmet','horsehelmet','fez','jesterhat'].includes(key))sculpt.hair+=headwear(key,value?tone:c.outfit);
    if(key==='headband'||key==='bandana')sculpt.hair+=r(10,23,60,7,1,value?tone:'#87999d')+r(27,22,26,10,2,'#bcc4bf')+s('M37 24q9 0 6 5h-8l-3-3','#4d6262',1);
    if(key==='bow')sculpt.hair+=p('M30 16 16 3 14 21 32 24 48 22 67 4 63 24 48 25Z',tone)+e(40,21,5,5,tone);
    if(['beard','goatee','moustache','crescentmoustache'].includes(key))sculpt.face+=key==='moustache'?p('M24 52Q31 46 40 51Q49 46 57 52L51 58 43 58 40 55 34 59 26 57Z',c.hair):key==='crescentmoustache'?s('M14 50Q40 68 68 49',ivory,5):p(key==='goatee'?'M32 54 40 59 47 54 44 68 36 68Z':'M18 52 31 55 40 60 51 55 62 51 59 70 41 85 22 70Z',c.hair);
    if(key==='cape'||key==='cloak'||key==='coat')sculpt.back+=parts.cape(value?tone:c.outfit);
    if(key==='scarf')sculpt.costume+=r(24,68,33,8,2,tone)+p('M30 73H38V105H30Z',tone)+s('M31 84H37M31 95H37',value?.includes('gold')?'#d6b651':'#eee3bf',2);
    if(key==='belt'||key==='sash'||key==='rope')sculpt.costume+=parts.belt(value?tone:'#92744e');
    if(key==='tie'||key==='bowtie')sculpt.costume+=p(key==='tie'?'M38 76H42L45 94 40 97 35 94Z':'M39 77 26 72 27 84 40 79 52 84 54 72Z',tone);
    if(key==='star'||key==='starcheek')sculpt.costume+=parts.star(40,83,value?tone:'#d0b456',1.2);
    if(key==='emblem')sculpt.costume+=e(40,84,10,9,'#e8dbc4')+parts.text(40,88,value,ink,value.length>3?6:11);
    if(['spider','phoenix','bird','dragon','scarab','ankh','crescent','atom','question','skull','cross','maple'].includes(key))sculpt.costume+=key==='skull'?e(40,81,9,7,ivory)+r(35,86,10,5,1,ivory)+e(36,80,2,2,ink)+e(44,80,2,2,ink):key==='cross'?s('M31 83H49M40 74V92',value?tone:ivory,3):key==='crescent'?e(40,82,10,10,'#ccb45d')+e(44,79,8,8,c.outfit):key==='spider'?s('M40 74V89M32 78 47 87M48 78 32 87M31 83H49',value?tone:ink,2):s('M28 80 35 88 40 78 45 88 53 80M35 92H45',value?tone:'#d4b35f',2);
    if(key==='headset'||key==='headphones')sculpt.face+=s('M8 41Q3 3 40 7Q79 7 72 41',ink,3)+r(3,35,8,16,3,ink)+r(69,35,8,16,3,ink)+s('M70 45 58 52',ink,2);
    if(key==='eyepatch'||key==='eye')sculpt.face+=e(key==='eye'?56:24,40,9,10,value?tone:ink)+s('M12 31 58 52',ink,1.4);
    if(key==='scouter')sculpt.face+=r(10,30,23,19,3,'#71787d')+r(13,33,18,13,2,value?tone:'#7dab8c');
    if(['earring','earrings','jewelry'].includes(key))sculpt.face+=e(10,52,4,5,'none','stroke="#d2b560" stroke-width="2"')+e(70,52,4,5,'none','stroke="#d2b560" stroke-width="2"');
    if(key==='forehead'||key==='jewel'||key==='diamond')sculpt.face+=p('M40 20 45 26 40 32 35 26Z',tone);
    if(key==='scar'||key==='scars')sculpt.face+=s('M17 33 22 49M22 36 17 37M23 41 19 42','#ab7569',1.2);
    if(key==='freckles'||key==='whiskers')sculpt.face+=key==='freckles'?[17,21,25,55,59,63].map((x,i)=>e(x,49+i%2,1,1,'#a16b51')).join(''):s('M12 45 25 49M12 51 25 52M12 57 25 55M55 49 69 45M55 52 69 51M55 55 69 57',ink,1);
    if(key==='tattoos'||key==='facepaint'||key==='cheeks')sculpt.face+=s('M13 34 20 45 15 51M64 34 59 45 66 51M30 58H50',value?tone:'#6c5e56',2);
    if(key==='brows'||key==='angry'||key==='eyebrows')sculpt.face+=s('M16 28 31 33M49 33 65 27',ink,key==='brows'?4:2);
    if(key==='nose')sculpt.face+=value==='none'?s('M37 49V52M43 49V52',ink,1):value==='long'?p('M37 45 64 49 40 54Z',c.skin):e(40,49,7,5,tone);
    if(key==='beak'||key==='snout')sculpt.face+=value==='long'?p('M33 45 76 50 40 57Z',value==='long'?color('gold'):tone):e(40,51,19,7,value?tone:color('gold'));
    if(key==='clownnose')sculpt.face+=e(40,48,8,7,'#bc5152');
    if(key==='teeth'||key==='fangs'||key==='buckteeth'||key==='grin')sculpt.face+=p('M24 54Q40 63 58 54L52 64H29Z',ivory)+s('M32 57V62M42 59V63M50 57V61',ink,.6);
    if(key==='lips'||key==='lipstick')sculpt.face+=p('M31 57Q40 52 49 57Q40 66 31 57Z',value?tone:'#b75b73');
    if(key==='fur'||key==='ruff')sculpt.costume+=p('M19 67 28 73 31 66 40 77 49 66 52 74 61 67 57 83 41 84 22 80Z',tone);
    if(['stripes','stripe','pinstripes','bands','mesh','checks'].includes(key))sculpt.costume+=key==='checks'?r(26,73,9,9,0,ink)+r(43,73,9,9,0,ink)+r(34,82,9,9,0,ink)+r(26,91,9,9,0,ink)+r(43,91,9,9,0,ink):s('M25 78H55M25 86H55M25 94H55',value?tone:'#c8bfa1',key==='mesh'?1:3);
    if(key==='clouds')sculpt.costume+=[27,47,39].map((x,i)=>e(x,78+i*9,5,3,'#b8525a')+e(x+4,80+i*9,5,3,'#b8525a')).join('');
    if(key==='stars'||key==='flowers'||key==='patterns'||key==='triangles'||key==='diamonds'||key==='flamehem')sculpt.costume+=[29,45,37,52].map((x,i)=>key==='flowers'?parts.flower(x,78+i*7,tone):parts.star(x,78+i*7,tone,.4)).join('');
    if(key==='necklace'||key==='collar'||key==='beadnecklace'||key==='prayerbeads')sculpt.costume+=s('M26 70Q40 91 55 70',value?tone:'#cdb36e',2.5)+e(40,82,3,4,value?tone:'#d3b46e');
    if(key==='piercings')sculpt.face+=e(40,47,2,1,ink)+e(36,60,1.2,1.2,ink)+e(44,60,1.2,1.2,ink)+e(11,43,1.5,1.5,ink);
    if(key==='dots')sculpt.face+=[32,40,48].map(x=>e(x,23,1.5,1.5,ink)+e(x,28,1.5,1.5,ink)).join('');
    if(key==='thirdeye')sculpt.face+=e(40,25,4,5,ivory)+e(40,25,2,3,ink);
    if(key==='gloves'||key==='fists'||key==='boxinggloves')sculpt.prop+=e(12,91,7,8,value?tone:ivory)+e(68,91,7,8,value?tone:ivory);
    if(key==='claws'||key==='needles')sculpt.prop+=s('M7 91 3 81M12 92 11 81M17 91 19 81M63 91 61 81M68 92 68 81M73 91 77 81','#bac7c6',1.5);
    if(key==='boots'||key==='feet')sculpt.boots=tone;
    if(key==='barefeet')sculpt.boots=c.skin;
    if(key==='arm'||key==='gunarm')sculpt.prop+=r(60,74,12,27,5,key==='gunarm'?ink:tone)+s('M63 80H70M63 86H70','#a8b0af',1);
    if(key==='reactor'||key==='diamond'||key==='badge'||key==='buttons')sculpt.costume+=e(40,82,5,5,value?tone:'#bfd5d1')+e(40,82,2,2,ivory);
    if(key==='fourarms')sculpt.back+=s('M21 85 2 97 5 107M59 85 79 97 76 107',c.skin,8)+e(5,108,6,6,c.skin)+e(76,108,6,6,c.skin);
    if(key==='panels')sculpt.costume+=r(25,73,13,9,1,tone)+r(45,73,12,9,1,tone)+r(30,91,21,5,1,tone);
    if(key==='skullbelt')sculpt.costume+=r(22,94,35,5,1,'#d9b272')+[28,40,52].map(x=>e(x,96,4,4,'#e3dcc9')+e(x-1,96,1,1,ink)).join('');
    if(key==='muscles')sculpt.costume+=s('M26 75Q32 83 38 78M42 78Q48 83 54 75M32 87H38M42 87H48',c.design.clothing==='trousers'?'#746d59':'#c6b695',1.3,'opacity=".6"');
    if(key==='tattoo')sculpt.face+=s('M16 54q7-5 9 0q-4 5-8 0','#577581',1.5);
    if(key==='tips'||key==='streak'||key==='hairhalf')sculpt.hair+=key==='hairhalf'?p('M41 10Q69 7 71 38L61 32 54 22 42 25Z',tone):p('M8 71 18 63 20 95 12 100M61 63 71 73 69 96 59 98Z',tone);
    if(key==='temples')sculpt.hair+=p('M11 29 17 24 20 34 17 45H11M62 24 68 29 69 44H63Z',tone);
    if(key==='dome')sculpt.hair+=p('M10 31Q10 6 40 6Q71 7 71 31Z',tone)+s('M11 31H69',ink,1.3)+e(40,23,5,5,'#354b61');
    if(key==='jetpack'||key==='backpack'||key==='quiver')sculpt.back+=r(7,66,18,31,4,value?tone:'#6d755e')+r(56,66,17,31,4,value?tone:'#6d755e');
    if(key==='wheelchair')sculpt.back+=e(11,102,13,14,'none','stroke="#555e64" stroke-width="3"')+e(69,102,13,14,'none','stroke="#555e64" stroke-width="3"')+s('M14 78H66M14 78V106M66 78V106','#a1aaa5',3);
    if(key==='hood')sculpt.hair+=hairStyles.hood(value?tone:c.outfit);
    if(key==='wings')sculpt.back+=p('M22 72Q-12 40 3 30L28 49 40 64 51 50 78 30Q92 49 58 74Z',value==='flame'?'#d79c45':value?tone:'#d8d4bf')+s('M7 43 25 61M74 43 55 61','#67696c',1,'opacity=".5"');
    if(key==='antenna'||key==='horns'||key==='antlers')sculpt.back+=key==='antenna'?s('M22 23 14 0M57 23 66 0',value?tone:c.hair,3)+e(14,0,3,3,value?tone:c.hair)+e(66,0,3,3,value?tone:c.hair):p('M21 24Q3 15 10 0Q9 16 29 17M51 17Q71 15 70 0Q79 19 59 25Z',value?tone:sculpt.animal?'#b7ab80':c.hair);
    if(key==='horn')sculpt.hair+=p('M34 20 43-1 48 23Z',value?tone:'#cdc6af');
    if(key==='pointedears'||key==='ears')sculpt.back+=value==='long'?p('M14 28 0 0 14-2 28 23M52 23 65-2 80 0 67 29Z',c.skin):p('M16 27 0 20 8 44 22 39M63 27 80 20 72 44 58 39Z',c.skin);
    if(key==='flame'||key==='fire'||key==='lightning'||key==='ice'||key==='magic'||key==='water'||key==='smoke'||key==='sparks')sculpt.prop+=key==='lightning'?p('M66 65 57 82H66L58 103 79 76H70L80 63Z','#d6c570'):p('M63 101Q48 87 62 79L61 69Q78 82 73 94L81 89Q85 107 63 101Z',key==='ice'||key==='water'?'#90c9d3':key==='magic'?tone:key==='smoke'?'#a49ab6':'#d8a44e');
    if(key==='tail'||key==='tails')sculpt.back+=value==='lightning'?p('M55 94 68 87 64 74 80 65 81 76 73 81 78 99 62 109Z','#c5ad48'):value==='flame'?s('M55 101Q84 115 75 79',c.skin,5)+p('M73 81Q63 69 74 57Q84 70 78 82Z','#d6a64b'):s('M57 101Q83 113 74 74',value==='purple'?palette.purple:c.skin,value==='fluffy'||value==='two'?10:4);
  }
  return sculpt;
}

export function catalogSculpture(c) {
  const {silhouette,clothing}=c.design,h=c.hair,o=c.outfit;
  if(clothing==='animal'||!hairStyles[silhouette])return creatureSculpture(c);
  const dress=['dress','robe','nightshirt','pyjamas'].includes(clothing);
  const sculpt=parts.human({bodyShape:dress?parts.dress:parts.body,headShape:has(c,'round')?parts.broadHead:parts.head,skin:c.skin,boots:'#4d4840',hair:hairStyles[silhouette](h),costume:costume(c)});
  if(silhouette==='helmet'){sculpt.skin=h;sculpt.masked=true;sculpt.underEyes+=r(15,31,50,17,5,'#3d4953');}
  if(['long','wavy','braid','braids','dreads','tentacles'].includes(silhouette))sculpt.back+=parts.longBack(h);
  if(['braid','braids','ponytail','pigtails','ponytails'].includes(silhouette))sculpt.back+=parts.braid(69,34,h)+(silhouette==='braids'||silhouette==='pigtails'||silhouette==='ponytails'?parts.braid(11,34,h):'');
  if(silhouette==='tall')sculpt.headShape='M14 40V10Q16-5 40-4Q64-3 67 12V48Q65 68 40 69Q14 66 14 40Z';
  if(has(c,'eye')||has(c,'visor')||has(c,'blindfold')||val(c,'nose')==='none')sculpt.masked=true;
  if(has(c,'young'))sculpt.headShape=parts.femaleHead;
  return details(c,sculpt);
}

function creatureSculpture(c) {
  const {silhouette:k}=c.design,h=c.hair,o=c.outfit;
  const sculpt=parts.animal({skin:h,bodyColor:o,boots:h,headShape:parts.head,bodyShape:'M23 71Q40 65 57 71L62 102Q40 115 18 101Z'});
  const round=['orb','slime','ghost','starfish','sponge','egg','clam','potato','cookie','mushroom','cocoon','slug','snail','clock','cup','teapot','droid','nautilus'].includes(k);
  if(round)sculpt.headShape='M7 42Q7 13 40 13Q74 13 73 43Q73 72 40 72Q7 72 7 42Z';
  if(['fox','wolf','cat','rat','mouse','raccoon','chipmunk','rabbit','hyena','lion','redpanda','dog','badger','echidna','hedgehog','sloth','panda','bear','gorilla','monkey','lemur','fur'].includes(k)){
    const pointed=['fox','wolf','cat','hyena','rabbit','hedgehog'].includes(k);
    sculpt.back+=pointed?p('M13 28 7 2 28 19 53 19 72 2 67 31Z',h):e(13,22,12,13,h)+e(67,22,12,13,h);
    sculpt.underEyes+=e(40,54,k==='dog'||k==='bear'?22:17,11,o);
    sculpt.face+=e(40,48,5,3,ink)+s('M32 57Q40 63 49 56',ink,1.2);
    if(k==='panda'||k==='raccoon'||k==='badger')sculpt.underEyes+=e(23,40,12,15,ink)+e(56,40,12,15,ink);
    if(k==='hedgehog'||k==='echidna')sculpt.back+=p('M11 35 0 21 14 19 8 5 27 17 49 15 69 5 65 27 80 34 68 45 78 61 63 64Z',h);
    if(k==='rabbit')sculpt.back+=p('M16 24 7-4 21-3 29 26M52 26 62-4 75-3 65 31Z',h);
    if(k==='dog'||k==='donkey')sculpt.back+=e(9,45,8,23,h)+e(71,45,8,23,h);
  }
  if(['deer','horse','donkey','bison','bull','cow','pig','kangaroo','rhino','armadillo','tapir','elephant','boar','ogre','elf','imp','goblin'].includes(k)){
    sculpt.back+=e(10,24,10,12,h)+e(70,24,10,12,h);
    sculpt.face+=e(40,52,21,12,o)+e(34,52,2,3,ink)+e(47,52,2,3,ink);
    if(k==='pig'||k==='boar'||k==='rhino')sculpt.face+=e(40,51,16,10,'#b9958d')+e(34,51,3,3,ink)+e(46,51,3,3,ink);
    if(k==='elephant')sculpt.face+=p('M34 49Q24 84 45 79L44 50Z',h);
    if(k==='elf'||k==='goblin'||k==='ogre'||k==='imp')sculpt.back+=p('M12 28-5 24 4 42 17 42M66 28 85 24 76 42 62 41Z',h);
    if(k==='deer'||k==='bison'||k==='bull')sculpt.back+=p('M18 24Q1 15 9 0L12 16 25 19M56 20 69 15 71 0Q79 17 62 28Z','#bdaa81');
  }
  if(['bird','duck','penguin','bee','butterfly','bat','moth'].includes(k)){
    sculpt.bodyShape='M27 71Q40 68 54 72L62 99Q40 114 18 99Z';
    if(['bird','duck','penguin'].includes(k))sculpt.face+=p(k==='duck'?'M19 47Q40 42 62 49L57 58H25Z':'M34 47 49 47 54 55 39 57 30 52Z',color(val(c,'beak')||'gold'));
    else sculpt.back+=p('M20 73Q-16 47 1 19L25 35 40 65 54 35 80 19Q96 47 59 73Z',color(val(c,'wings')||'cream'));
    sculpt.feet=e(26,108,12,5,'#c59a59')+e(55,108,12,5,'#c59a59');
    if(['bird','duck','penguin'].includes(k)){sculpt.limbs=false;sculpt.prop+=p('M24 72Q5 69 4 92L19 87M57 72Q74 67 76 92L62 87Z',h);sculpt.headShape='M15 35Q17 13 40 13Q64 14 66 37L63 55Q52 68 35 65Q12 63 15 35Z';}
  }
  if(['fish','shark','whale','seal','seahorse','jellyfish','octopus','crab','starfish','nautilus'].includes(k)){
    sculpt.limbs=false;sculpt.feet='';
    sculpt.back+=p('M56 78 80 61 80 102 60 91Z',h);
    sculpt.prop+=p('M17 70 0 81 19 92M62 69 78 77 62 88Z',h);
    if(k==='octopus'||k==='jellyfish')sculpt.feet=p('M18 87Q-4 107 9 114L23 105 26 118 37 117 41 102 48 116 60 115 60 103 75 113 80 104 62 84Z',h);
    if(k==='crab')sculpt.prop+=p('M17 80 2 75 0 56 12 60 8 70 20 71M60 72 72 68 68 55 80 57 80 80 65 83Z',h);
    if(k==='starfish')sculpt.headShape='M40 7 53 27 74 31 62 50 68 75 40 63 13 76 18 50 6 32 27 28Z';
  }
  if(['dragon','dinosaur','lizard','crocodile','turtle','frog','alien'].includes(k)){
    sculpt.underEyes+=e(40,55,22,12,o);
    sculpt.face+=e(34,49,1.4,1.5,ink)+e(48,49,1.4,1.5,ink);
    if(k==='turtle')sculpt.back+=e(40,86,35,28,color(val(c,'shell')||'brown'));
    if(k==='dragon')sculpt.back+=p('M18 75Q-4 64 2 31L29 50M59 75Q83 64 78 31L51 50Z',color(val(c,'wings')||'purple'));
    if(k==='dinosaur'||k==='crocodile')sculpt.headShape='M10 36Q11 13 42 15Q67 17 66 41L75 47Q74 70 42 70Q6 65 10 36Z';
    if(k==='frog')sculpt.headShape='M10 38Q-1 12 22 13Q32 10 39 24Q52 10 65 16Q80 23 71 44L68 60Q52 73 31 66Q8 64 10 38Z';
  }
  if(['snake','cobra','worm','vine','slug','slime','ghost','cocoon','mole','snail'].includes(k)){
    sculpt.limbs=false;sculpt.feet='';sculpt.bodyShape='M25 68H57L54 87Q72 91 77 107Q58 122 18 109L26 97Q38 101 40 90Z';
    if(k==='cobra')sculpt.back+=p('M17 32Q-5 23 3 71L28 83 52 83 79 72Q88 22 62 30Z',h);
    if(k==='snail')sculpt.back+=e(63,86,26,26,color(val(c,'shell')||'pink'))+s('M62 73Q82 88 62 98Q46 98 51 84Q58 75 67 85',ink,1.5);
    if(k==='mole')sculpt.feet=e(40,106,34,10,'#958069');
    if(k==='ghost')sculpt.bodyShape='M19 71H61L66 112 53 108 45 116 34 108 19 114Z';
    if(k==='cocoon'){sculpt.headShape='M39 10 64 26 69 50 58 74 24 74 9 52 16 27Z';sculpt.bodyShape='M22 63H58L54 100 40 117 24 100Z';sculpt.face+=s('M13 42 39 50 67 38M21 65 58 58M30 77 52 74',h===palette.gold?'#a78e47':'#638357',1.5);}
    if(k==='mole'){sculpt.headShape='M18 44Q16 22 40 23Q65 23 62 46V91H18Z';sculpt.bodyShape='M18 74H62V109H18Z';}
  }
  if(['robot','droid','polygon','clock','sponge','candle','cookie','cup','teapot','mushroom'].includes(k)){
    sculpt.limbs=k!=='droid';
    sculpt.headShape=['sponge','robot','clock','polygon'].includes(k)?'M10 18H70V64H10Z':parts.head;
    if(k==='droid')sculpt.bodyShape='M19 65H61V103H19Z';
    if(k==='candle')sculpt.hair+=p('M33 17Q23 5 39-6Q55 7 44 18Z','#dcad54');
    if(k==='mushroom')sculpt.hair+=p('M-1 32Q-3-2 39-2Q83-1 81 33Z',color(val(c,'cap')||'red'))+[10,39,70].map(x=>e(x,17,8,9,ivory)).join('');
    if(k==='cup'||k==='teapot')sculpt.back+=e(73,51,10,13,'none',`stroke="${h}" stroke-width="5"`);
    if(k==='clock')sculpt.customEyes=e(40,42,25,25,'#e2d5b7')+s('M40 26V42L52 47',ink,2)+parts.eyes(27,43,26,3.5);
    if(k==='droid'||k==='robot')sculpt.costume+=r(27,73,25,10,1,'#657378')+r(30,90,9,7,1,'#9eada7');
  }
  if(['rock','bug','beetle','mantis','fighter','mime','snow','fairy','ragdoll','flame','skull','egg'].includes(k)){
    sculpt.hair+=k==='flame'?p('M8 35 3 20 17 25 12 4 30 14 39-1 52 14 71 5 67 28 78 21 72 41Z','#db9d45'):k==='rock'?p('M9 34 15 13 28 18 40 8 57 14 73 29 66 43Z',h):'';
    if(k==='mantis'||k==='bug')sculpt.back+=s('M23 23 13 0M56 23 67 0',h,2);
    if(k==='skull')sculpt.face+=e(24,40,12,13,ink)+e(56,40,12,13,ink)+p('M40 46 35 54H45Z',ink)+s('M29 60H52M35 57V64M43 58V64',ink,1);
  }
  if(has(c,'eye')&&val(c,'eye')==='single')sculpt.customEyes=e(40,39,20,19,ivory)+e(40,39,10,12,ink)+e(37,35,3,3,ivory);
  if(val(c,'eyes')==='none')sculpt.customEyes=s('M19 38 30 40M50 40 62 38',h,3);
  if(has(c,'eyes')&&!['none','five','four','tiny','spiral','angry','large'].includes(val(c,'eyes')))sculpt.customEyes=e(24,40,8,10,color(val(c,'eyes')))+e(56,40,8,10,color(val(c,'eyes')))+parts.eyes(24,40,32,4.2);
  if(has(c,'bulb')||has(c,'bud')||has(c,'flower')||has(c,'palm')||has(c,'leaves'))sculpt.hair+=p('M23 25 8 8 30 14 39-5 50 14 73 7 56 26Z','#68915e')+(has(c,'flower')?parts.flower(40,7,color(val(c,'flower'))):has(c,'bud')?e(40,5,12,14,color(val(c,'bud'))):has(c,'bulb')?e(40,8,17,15,'#779c66'):'');
  if(has(c,'mushrooms')||has(c,'mushroom'))sculpt.back+=e(17,29,16,8,'#c07b6a')+e(63,26,17,9,'#c07b6a')+[10,19,26,55,64,72].map(x=>e(x,25+x%2*4,2,2,ivory)).join('');
  if(has(c,'segmented')||val(c,'tail')==='rock')sculpt.back+=[14,26,38,50,63,72].map((x,i)=>e(x,99+i%2*7,12,12,'#90999e')).join('');
  if(has(c,'shelltail'))sculpt.back+=e(68,95,14,21,'#b8b0a6')+s('M58 86 77 83M57 94 79 93M61 102 77 102','#888881',1.5);
  if(has(c,'muzzle'))sculpt.underEyes+=e(40,54,22,12,color(val(c,'muzzle')));
  if(has(c,'pouch'))sculpt.costume+=p('M25 86Q40 80 56 85L53 102H27Z',color(val(c,'pouch')||'cream'));
  if(has(c,'bone'))sculpt.prop+=s('M58 105 75 77',ivory,5)+e(75,77,4,4,ivory)+e(78,80,4,4,ivory);
  if(has(c,'magnets'))sculpt.prop+=p('M2 32H8V47H16V32H22V56H2Z','#8e9d9e')+p('M61 32H67V47H74V32H80V56H61Z','#8e9d9e')+r(2,31,6,7,0,'#b55c67')+r(15,31,7,7,0,'#5e8eaf');
  if(has(c,'tangles'))sculpt.hair+=[12,23,34,45,56,67].map((x,i)=>s(`M${x} 32Q${x-6} 16 ${x+3} 13Q${x+9} 18 ${x+6} ${65+i%2*6}`,h,5)).join('');
  if(has(c,'spots')||has(c,'scales')||has(c,'holes')||has(c,'craters'))sculpt.face+=[15,29,52,65].map((x,i)=>e(x,22+i%2*8,2.5,3,has(c,'spots')?color(val(c,'spots')):'#647466','opacity=".7"')).join('');
  if(has(c,'stripes')||has(c,'patches'))sculpt.face+=s('M10 29 22 34M71 29 59 34M26 17 31 23M52 16 47 23',color(val(c,'stripes')||val(c,'patches')),3);
  if(has(c,'spiral'))sculpt.costume+=e(40,86,15,14,ivory)+s('M39 78Q53 84 42 94Q28 94 31 83Q36 77 44 85Q45 91 39 89',ink,2);
  if(has(c,'shell'))sculpt.costume+=e(40,85,18,19,ivory)+s('M25 78H54M23 89H56M38 68V101','#a9a58b',1.5);
  if(has(c,'belly'))sculpt.costume+=e(40,87,20,22,color(val(c,'belly')));
  if(has(c,'egg'))sculpt.prop+=e(40,94,9,11,ivory);
  if(has(c,'triple')||has(c,'triplehead')||has(c,'twinhead')||has(c,'twin'))sculpt.back+=e(6,51,15,20,h)+e(73,48,15,21,h)+e(3,46,3,4,ink)+e(71,43,3,4,ink);
  if(has(c,'tongue'))sculpt.face+=p('M32 57Q30 80 46 74L49 56Z','#bb7c98');
  if(has(c,'dripping'))sculpt.headShape='M9 40Q0 27 14 26Q10 9 29 17Q46 6 60 20Q77 14 73 39L71 66 64 59 60 71 48 62 38 69 27 62 16 67Z';
  if(val(c,'eyes')==='tiny')sculpt.customEyes=e(25,40,2,2,ink)+e(55,40,2,2,ink);
  if(has(c,'smile'))sculpt.face+=s('M29 55Q40 64 52 55',ink,1.5);
  if(has(c,'spikes'))sculpt.hair+=p('M10 28 5 14 21 21 29 3 37 19 50 7 57 24 72 15 69 34Z',color(val(c,'spikes')));
  if(has(c,'mane')||has(c,'tuft')||has(c,'crest'))sculpt.hair+=p('M27 23 25 6 36 13 42-2 50 13 62 6 59 28Z',color(val(c,'mane')||val(c,'tuft')||val(c,'crest')));
  if(c.design.clothing!=='animal')sculpt.costume+=costume(c);
  return details(c,sculpt);
}

for(const character of catalogCharacters)sculptures[character.name]=catalogSculpture;
