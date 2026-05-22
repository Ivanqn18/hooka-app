import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class HookymiaSeedService {
  private readonly logger = new Logger(HookymiaSeedService.name);

  constructor(private prisma: PrismaService) {}

  async scrapeAndSeed() {
    this.logger.log(
      'Iniciando Volcado COMPLETO de Tabacos de Cachimba disponibles en España...',
    );

    const seedData = [
      {
        brand: 'Adalya',
        price: 3.3,
        flavors: [
          'Love 66',
          'Lady Killer',
          'Hawaii',
          'Mi Amor',
          'Swiss Bonbon',
          'The Two Apples',
          'Mixfruit',
          'Watermelon',
          'Grape',
          'Blueberry',
          'Mint',
          'Lemon Mint',
          'Ice Bonbon',
          'Mango Tango',
          'Peach',
          'Cherry',
          'Strawberry',
          'Blue Ice',
          'Grape Mint',
          'Wind of Amazon',
          "Tony's Destiny",
          'Berlin Nights',
          'Pineapple',
          'Melon',
          'Orange',
          'Raspberry',
          'Coconut',
          'Vanilla',
          'Gum',
          'Cola',
          'Cola Dragon',
          'Power',
          'Angel Lips',
          'Cactus',
          'Ice Lime on the Rocks',
          'Maracuja',
          'Guava',
          'Kiwi',
          'Pomegranate',
          'Blackberry',
          'Banana',
          'Double Melon',
          'Fresh Mint',
          'Spearmint',
          'Lychee',
          'Dragon Fruit',
          'Passion Fruit',
          'Lime',
          'Rose',
          'Cherry Banana',
          'Mango',
          'Ice Mango',
          'Lemon Pie',
          'Caramel',
          'Cappuccino',
          'Milk Coffee',
          'Cinnamon',
          'Blue Melon',
          'Two Apples Mint',
          'Aqua Mentha',
          'Ice Raspberry',
          'Watermelon Mint',
          'Sheikh Money',
          'Discovery',
          'Hookah Rush',
          'Gyspy Kings',
          'Strong Stallone',
          'Baku Nights',
          'Moscow Evenings',
          'Black Cherry',
          'Pear',
          'Tangerine',
          'Grapefruit',
          'Cranberry',
        ],
      },
      {
        brand: 'Al Fakher',
        price: 3.5,
        flavors: [
          'Double Apple',
          'Double Apple Mint',
          'Grape',
          'Grape Mint',
          'Blueberry',
          'Blueberry Mint',
          'Mint',
          'Fresh Mint',
          'Spearmint',
          'Watermelon',
          'Watermelon Mint',
          'Lemon Mint',
          'Strawberry',
          'Peach',
          'Orange',
          'Mango',
          'Cherry',
          'Apple',
          'Banana',
          'Coconut',
          'Melon',
          'Kiwi',
          'Grapefruit',
          'Pineapple',
          'Gum',
          'Gum Mint',
          'Rose',
          'Jasmine',
          'Vanilla',
          'Chocolate',
          'Cappuccino',
          'Cola',
          'Energy Drink',
          'Lemon',
          'Pomegranate',
          'Raspberry',
          'Blackberry',
          'Cranberry',
          'Two Apples',
          'Citrus Mint',
          'Bubble Gum',
          'Tutti Frutti',
          'Mixed Fruit',
          'Passion Fruit',
          'Guava',
          'Plum',
          'Cinnamon',
          'Cardamom',
          'Berry',
          'Berry Mint',
          'Pan Raas',
          'Fakhfakhina',
          'Grenadine',
          'Apricot',
          'Lychee',
          'Fig',
        ],
      },
      {
        brand: 'Tangiers',
        price: 25.0,
        flavors: [
          'Cane Mint',
          'Kashmir Peach',
          'Orange Soda',
          'Static Starlight',
          'Horchata',
          'Noir Lucid Dream',
          'Foreplay on the Beach',
          'Blue Gumball',
          'Ololiuqui',
          'Maraschino Cherry',
          'Peach Iced Tea',
          'Mimon',
          'Bug Powder',
          'Schnozzberry',
          'Watermelon',
          'Jackfruit',
          'Guajava',
          'Picnic Punch',
          'K Peach',
          'Boysenberry',
          'Brambleberry',
          'Welsh Cream',
          'Cocoa',
          'Hacitragus',
          "It's Like That One Breakfast Cereal",
          'Sevilla Orange',
          'New Lime',
          'Absinthe',
          'Mint',
          'Kashmir Cherry',
          'Kashmir Apple',
          'Passion Fruit',
          'Tropical Revenge',
          'Melon Blend',
          'Indian Summer',
        ],
      },
      {
        brand: 'Fumari',
        flavors: [
          'White Gummy Bear',
          'Blueberry Muffin',
          'Lemon Loaf',
          'Tropical Punch',
          'Mint Chocolate Chill',
          'Ambrosia',
          'Mandarin Zest',
          'French Vanilla',
          'Spiced Chai',
          'Island Papaya',
          'Guava',
          'Red Gummy Bear',
          'Tangelo',
          'Fakhfakhina',
          'Prickly Pear',
          'Limoncello',
          'Mojito Mojo',
          'Orange Cream',
          'Watermelon',
          'Strawberry',
          'Grape',
          'Mint',
          'Cherry',
          'Peach',
          'Mango',
          'Citrus Mint',
          'Double Apple',
          'Jasmine',
          'Rose',
          'Vanilla',
          'Sweet Mint',
          'Lemon Mint',
          'Passion Fruit',
        ],
      },
      {
        brand: 'Darkside',
        price: 4.5,
        flavors: [
          'Supernova',
          'Falling Star',
          'Polar Cream',
          'Space Dessert',
          'Generis Raspberries',
          'Barvy Orange',
          'Green Beam',
          'Hola',
          'Needls',
          'Antarctica',
          'Cosmos Flower',
          'Torpedo',
          'Darkside Cola',
          'Virgin Peach',
          'Grape Core',
          'Red Tea',
          'Bananapapa',
          'Kalee Grap',
          'Lemon Blast',
          'Wild Forest',
          'Mental Storm',
          'Deep Dive',
          'Skyline',
          'Base',
          'Needls',
          'Arctic Mix',
          'Dark Mint',
          'Mango Lassi',
          'Pear Click',
          'Cookie Monster',
        ],
      },
      {
        brand: 'Element',
        flavors: [
          'Watermelon Halls',
          'Moroz',
          'Pear',
          'Cola',
          'Banana Daiquiri',
          'Kalamansi',
          'Lychee',
          'Kriek',
          'Mongolia',
          'Fir',
          'Raspberry',
          'Belgian Waffle Bazaar',
          'Blueberry',
          'Peach',
          'Grape Mint',
          'Mango',
          'Lime',
          'Grapefruit',
          'Cherry',
          'Passion Fruit',
          'Pineapple',
          'Coconut',
          'Pomegranate',
          'Vanilla',
          'Cactus Fig',
          'Strawberry',
          'Blackcurrant',
          'Elderflower Lemonade',
        ],
      },
      {
        brand: 'MustHave',
        flavors: [
          'Pinkman',
          'Pineapple Rings',
          'Space Flavour',
          'Kiwi Smoothie',
          'Mango Sling',
          'Banana Mama',
          'Frosty',
          'Orange Team',
          'Cherry Cola',
          'Lemon Pie',
          'Cookie',
          'Raspberry',
          'Watermelon',
          'Peach',
          'Grape',
          'Mint',
          'Melon',
          'Berry Holls',
          'Grapefruit',
          'Forest Mix',
          'Blueberry',
          'Strawberry',
          'Passion Fruit',
          'Black Currant',
          'Apple',
          'Honey',
        ],
      },
      {
        brand: 'Nameless',
        flavors: [
          'Black Nana',
          "L'Oasis",
          'Loko',
          'Kite',
          '#108 Green Lights',
          '#111 Black Nana',
          '#222 Cactus Attack',
          '#333 Fruity Cloud',
          '#506 Tropical Hurricane',
          '#609 Forbidden Fruit',
          '#777 Dark Nana',
          'Hacklberry',
          'Gringo',
          'Baba Jaga',
          'Bloody Eye',
          'Chilly Hills',
          'Icy Passion',
          'Sunshine',
          'Black Bomb',
          'Green Crack',
        ],
      },
      {
        brand: 'Serbetli',
        flavors: [
          'Ice Grape Mint',
          'Ice Watermelon',
          'Ice Lemon',
          'Lemon Mint',
          'Blueberry',
          'Watermelon',
          'Grape',
          'Mint',
          'Peach',
          'Orange',
          'Strawberry',
          'Cherry',
          'Mango',
          'Apple',
          'Double Apple',
          'Passion Fruit',
          'Pomegranate',
          'Banana',
          'Coconut',
          'Melon',
          'Kiwi',
          'Berry Mix',
          'Ice Citrus Mint',
          'Pineapple',
          'Gum',
          'Lime',
          'Vanilla',
          'Cinnamon',
          'Grapefruit',
          'Lychee',
          'Guava',
          'Fig',
          'Ice Mango',
          'Rose',
          'Ice Berry',
        ],
      },
      {
        brand: 'Zomo',
        flavors: [
          'Strong Mint',
          'My Cherry Pie',
          'My Honey Melon',
          'Hype X',
          'Cinnamon Gum',
          'Dragon Wall',
          'Watermelon',
          'Grape',
          'Blue Ice',
          'Mint',
          'Double Apple',
          'Peach',
          'Mango',
          'Lemon',
          'Orange',
          'Strawberry',
          'Blueberry',
          'Cherry',
          'Coconut',
          'Gum',
          'Banana',
          'Pineapple',
          'Apple',
          'Kiwi',
          'Mixed Fruit',
          'Berry',
          'Passion Fruit',
          'Pomegranate',
          'Guava',
          'Raspberry',
          'Blackberry',
          'Lime',
        ],
      },
      {
        brand: 'Holster',
        flavors: [
          'Ice Kaktuz',
          'Grpe Mint',
          'Watermelon Ice',
          'Bloody Punch',
          'Quwi Smash',
          'Breezy',
          'Yellow Pnch',
          'Grp Slurp',
          'Bnna Sh4k',
          'MNG TNG',
          'Pnch',
          'Strw Chk',
          'P4ssion',
          'Strwbrry Ice',
          'Lmn Ice',
          'Phut',
          'DR Gre',
          'W4terM',
          'Org Lmn',
          'Bond',
          'Sheriff',
        ],
      },
      {
        brand: 'Revoshi',
        flavors: [
          'Pancho Villa',
          'Biscotti',
          "D'App Strong",
          'Mango Festival',
          'Eskimo',
          'Chapolin',
          'Love Story',
          'Karma',
          'Black Velvet',
          'Sweet Strawberry',
          'Frozen Grape',
          'Cool Mint',
          'Watermelon Ice',
          'Blueberry Ice',
          'Cola Lemon',
          'Peach Paradise',
          'Tropical Breeze',
          'Dark Mint',
        ],
      },
      {
        brand: 'Dozaj',
        flavors: [
          'Carnival',
          'Starblood',
          'Black',
          'Chillma',
          'Polar Blue',
          'Green Swirl',
          'Red Storm',
          'Purple Haze',
          'Orange Sun',
          'Blue Moon',
          'Pink Cloud',
          'Golden Touch',
          'Fresh Breeze',
          'Dark Night',
          'Sweet Dreams',
          'Ice Pop',
          'Tropical Mix',
          'Berry Blast',
        ],
      },
      {
        brand: 'Kismet',
        flavors: [
          'Black Bisquit',
          'Black Cane',
          'Black Lemon',
          'Black Mnt',
          'Black Hnydw',
          'Black Bry',
          'Black Pch',
          'Black Grp',
          'Black Wtrm',
          'Black Mng',
          'Black Org',
          'Black Strw',
          'Honey Blend No. 1',
          'Honey Blend No. 7',
          'Honey Blend No. 14',
          'Honey Blend No. 21',
          'Honey Blend No. 25',
          'Honey Blend No. 32',
        ],
      },
      {
        brand: 'Trifecta',
        flavors: [
          'Peppermint Shake',
          'Twice the Ice',
          'Pearfect',
          'Nawar',
          'TTI (Twice the Ice X)',
          'Enigma',
          'BDSM',
          'Cherry on Top',
          'Death by Ice',
          'Lavender Mint',
          'Mountain Fog',
          'Hipster Fairy',
          'Spearmint',
          'Lemon Lit',
          'Blonde',
          'Morning Glory',
          'Dark Leaf Cherry',
          'Dark Leaf Grape',
          'Dark Leaf Mint',
        ],
      },
      {
        brand: 'Overdozz',
        flavors: [
          '24 Karatine',
          'Wild Night Out',
          'Double Trouble',
          'Paradise City',
          'Bloody Beach',
          'Brain Storm',
          'Hurricane',
          "Romeo's Dream",
          'Royal Flash',
          'Northern Lights',
          'Sky Dive',
          'Under Cover',
        ],
      },
      {
        brand: 'Social Smoke',
        flavors: [
          'Absolute Zero',
          'Arctic Lemon',
          'Baja Blue',
          'Chai Latte',
          'Cinnamon Roll',
          'Citrus Chill',
          'Grape Chill',
          'Japanese Yuzu',
          'Lemon Chill',
          'Mango Habanero',
          'Pink Lemonade',
          'Pistachio Breeze',
          "Tiger's Blood",
          'Tropical Lei',
          'Voltage',
          'Watermelon Chill',
          'White Gummy Bear',
          'Wild Berry',
        ],
      },
      {
        brand: 'Starbuzz',
        flavors: [
          'Blue Mist',
          "Pirate's Cave",
          'Safari Melon Dew',
          'Code 69',
          'Bold',
          'Geisha',
          'Flower Power',
          'Irish Peach',
          'Queen of Sex',
          'Pink',
          'Simply Mint',
          'Grapefruit',
          'Citrus Mint',
          'Melon Blue',
          'Guava',
          'Mango',
          'Peach',
          'Grape',
          'Watermelon',
          'Blueberry',
          'Grape Freeze',
          'Coconut',
          'Sex on the Beach',
          'Lebanese Bombshell',
          'White Mint',
        ],
      },
      {
        brand: 'Azure',
        flavors: [
          'Royal Queen',
          'Lemon Muffin',
          'Melon King',
          'Blueberry Muffin',
          'Pineapple Express',
          'Winter Chill',
          'Lemon Chill',
          'Silver',
          'Gold',
          'Moroccan Mint',
          'Black Lemon',
          'Double Apple',
          'Lime',
          'Cherry',
          'Orange',
          'Grape',
          'Raspberry',
          'Watermelon',
          'Mango',
          'Peach',
        ],
      },
      {
        brand: 'Chaos',
        flavors: [
          'Code Red',
          'Medusa',
          'Oz Kansen',
          'Wild Side',
          'Royal Gold',
          'Turkish Bubbles',
          'Purple Poison',
          'Code Black',
          'Karma',
          'Phoenix',
          'The One',
          'Fallen King',
          'Bloody Queen',
          'Star Gazer',
          'Avalanche',
        ],
      },
      {
        brand: 'True Passion',
        flavors: [
          'Cinderella',
          'Hawaii Kiss',
          'Green Love',
          'Red Storm',
          'Blue Clouds',
          'Miss Joocy',
          'Okolom',
          'WaMe',
          'Baba Jaga',
          'Vampire Nights',
          'Black Jack',
          'Arctic Line',
          'Nero',
          'Pink Crack',
          'Exotic Dream',
          'Django',
          'Le Chill',
          'Red Ice',
        ],
      },
      {
        brand: 'Hookain',
        flavors: [
          'Punani',
          'Intensify!',
          'Orojina',
          'Laoz',
          'Fellini',
          'White Caek',
          'Big Papa',
          'Zenta Schpp',
          'Green Crack',
          'Eisbonbong',
          'American Pei',
          'Kaurakansen',
        ],
      },
      {
        brand: 'XRacher',
        flavors: [
          'Mlnbrry',
          'PStchCk',
          'IceFrutt',
          'LmnCk',
          'Kxxx',
          'Lmon Loops',
          'Brry Bomb',
          'Grp Mn',
          'Deja Vu',
          'Himbeerphase',
          'Juicy P',
          'Icy Cact',
          'Twang',
          'Kopfnuss',
          'Chrry',
          'PchIcT',
        ],
      },
      {
        brand: '187 Tobacco',
        flavors: [
          '#006 Miami Vice',
          '#009 Yakuza',
          '#010 Hamburg Nights',
          '#011 Green Lights',
          '#015 Kool Vibes',
          '#018 Wild Berry',
          '#019 Nasty Bold',
          '#020 Sparkling Peach',
          '#023 Yakuza X',
          '#028 Splashy',
          '#040 Grapolar',
        ],
      },
      {
        brand: 'Al Waha',
        flavors: [
          'Double Apple',
          'Grape',
          'Grape Mint',
          'Mint',
          'Watermelon',
          'Lemon Mint',
          'Blueberry',
          'Peach',
          'Cherry',
          'Mango',
          'Orange',
          'Strawberry',
          'Banana',
          'Coconut',
          'Melon',
          'Mixed Fruit',
          'Gum',
          'Rose',
          'Apple',
          'Pomegranate',
          'Pineapple',
          'Vanilla',
        ],
      },
      {
        brand: 'Mazaya',
        flavors: [
          'Two Apples',
          'Grape',
          'Mint',
          'Lemon Mint',
          'Blueberry',
          'Watermelon',
          'Peach',
          'Mango',
          'Cherry',
          'Strawberry',
          'Orange',
          'Banana',
          'Coconut',
          'Melon',
          'Kiwi',
          'Mixed Fruit',
          'Gum',
          'Rose',
          'Pomegranate',
          'Guava',
          'Pineapple',
          'Grape Mint',
          'Cool Sensation',
          'Pan Twist',
          'Love Story',
          'Cool Breeze',
        ],
      },
      {
        brand: 'Maridan',
        flavors: [
          'Tingle Tangle',
          'Twang',
          'Bloody Monkey',
          'Green Storm',
          'Purple Rain',
          'Artic Breeze',
          'Wild Passion',
          'Cool Cloud',
          'Tropic Thunder',
          'Berry Bomb',
          'Ice Ice Baby',
          'Sunset Vibes',
        ],
      },
      {
        brand: "O's Tobacco",
        flavors: [
          'African Queen',
          'Casanova',
          'Green',
          'Kiselo',
          'Onyx',
          'Red Alert',
          'After 8',
          'Blue Eyes',
          'Exotic',
          'Dragon',
          'Ghana Shake',
          'Lady Lemon',
        ],
      },
      {
        brand: 'Hasso',
        flavors: [
          'Hassoya',
          'Bavarian Cream',
          'Babos',
          'Almaz',
          'Berrylov',
          'Habicht',
          'Mandarino',
          'Green Gun',
          'Crystal',
          'Infinity',
          'Le Bang',
          'Moskau Nights',
        ],
      },
      {
        brand: 'Aqua Mentha',
        flavors: [
          'Aqua Mentha No. 1',
          'Aqua Mentha No. 5',
          'Aqua Mentha No. 7 (Pink Grapefruit)',
          'Aqua Mentha No. 11 (Grape Mint)',
          'Aqua Mentha No. 16 (Pineapple)',
          'Aqua Mentha No. 21 (Watermelon Mint)',
          'Aqua Mentha No. 25 (Cherry Mint)',
          'Aqua Mentha No. 33 (Black Box)',
          'Aqua Mentha No. 40 (Blueberry Mint)',
          'Aqua Mentha No. 44 (Mango Mint)',
        ],
      },
      {
        brand: 'Daily Hookah',
        flavors: [
          'Formula 78',
          'Element 6L',
          'Lmn Ice',
          'Peach Yogurt',
          'Berry Blend',
          'Grape Ice',
          'Cherry Bomb',
          'Mango Lassi',
          'Passion Mint',
          'Watermelon Freeze',
          'Strawberry Cream',
        ],
      },
      {
        brand: 'Argelini',
        flavors: [
          'Citrus Mint',
          'White Russian',
          'Blue Legend',
          'Grapefruit Mint',
          'Ice Banana',
          'Red Berries',
          'Two Apples',
          'Watermelon',
          'Mango Tango',
          'Tropical Island',
          'Fresh Mint',
          'Lemon Drop',
        ],
      },
      {
        brand: 'Moassel',
        flavors: [
          'Double Apple',
          'Grape',
          'Mint',
          'Watermelon',
          'Blueberry',
          'Lemon Mint',
          'Peach',
          'Cherry',
          'Mango',
          'Strawberry',
          'Orange',
          'Mixed Fruit',
        ],
      },
      {
        brand: 'Taboo',
        flavors: [
          'Casanova',
          'Naughty',
          'Impulse',
          'Desire',
          'Temptation',
          'Passion',
          'Obsession',
          'Seduction',
          'Euphoria',
          'Rebellion',
          'Midnight',
          'Whisper',
        ],
      },
      {
        brand: 'Blackburn',
        price: 5.0,
        flavors: [
          'Lemon Shock',
          'Peach Killer',
          'Cherry Garden',
          'Famous Apple',
          'Melon Halls',
          'Ananas Shock',
          'Apple Shock',
          'Cherry Shock',
          'Cranberry Shock',
          'Red Orange',
          'Raspberries',
          'Watermelon',
          'Grapefruit',
          'Kiwi Stoner',
          'Sweet Papaya',
          'Feijoa Jam',
          'Ekzo Mango',
          'Asian Lychee',
          'Peachberry',
          'Strawberry Coconut',
          'Tropic Jack',
          'Summer Basket',
          'Mirinda',
          'After 8',
          'Brownie',
          'Cheesecake',
          'Creme Brulee',
          'Pistachio Ice Snow',
          'Almond Ice Cream',
          'Pinacolada',
          'Haribon',
          'Grape Lollipop',
          'Muesli',
          'Cane Mint',
          'Iceberg',
          'Ice Baby',
          'Black Cola',
          'Overdose',
          'Pear Lemonade',
          'Green Tea',
          'Irish Cream',
          'Garnet',
          'Epic Yogurt',
          'Peach Yogurt',
          'Red Energy',
          'Bubble Gum',
          'Lemon Sweets',
          'Black Honey',
          'Berry Lemonade',
          'Malibu',
        ],
      },
      {
        brand: 'Blaze',
        price: 5.5,
        flavors: [
          'Lym Hype',
          'Preach',
          'Black Namik',
          'LUV',
          'Baba Gamma',
          'Black Uber',
          'Lemenciaga',
          'Wiwi',
          'Suavemente',
          'Mama Kujat',
          'Black Cry',
          'Cinema Roll',
          'Batluva',
          'White Heaven',
          'Koka Koala',
          'Mango Flame',
        ],
      },
      {
        brand: 'Blyat',
        price: 6.0,
        flavors: [
          'Clipporizz',
          'Cono Verde',
          'Mentido',
          'Optimus Leim',
          'Temptation',
        ],
      },
      {
        brand: 'Anda',
        price: 5.5,
        flavors: [
          'Temptation',
          'Tiki Taka',
          'Tropido',
          'Chupala',
          'Red & Green',
          'Blue Toteta',
          'Sour Dia',
          'Optimus Lime',
          'Mentido',
          'Clipporizz',
          'Casinada',
          'Mandingo',
        ],
      },
      {
        brand: 'Dozaj Black',
        price: 5.0,
        flavors: [
          'Black Double Apple',
          'Black Grape',
          'Black Mint',
          'Black Watermelon',
          'Black Lemon',
          'Black Mango',
          'Black Cherry',
          'Black Peach',
          'Black Blueberry',
          'Black Orange',
          'Black Berry Mix',
          'Black Ice',
          'Black Cola',
          'Black Gum',
          'Black Passion',
        ],
      },
      {
        brand: 'SAYes!',
        price: 11.95,
        flavors: [
          'Nord Star',
          'Space',
          'Citri-nade',
          'Berri Te',
          'Dominika',
          'Ginbrew',
          'Pinkman',
          'Raspi',
          'Passika',
          'Shak',
          'Rokman',
          'Zola',
          'Spayz',
        ],
      },
    ];

    let addedBrands = 0;
    let addedTastes = 0;

    for (const item of seedData) {
      const brandInfo = await this.prisma.brand.upsert({
        where: { name: item.brand },
        update: {},
        create: { name: item.brand },
      });
      addedBrands++;

      for (const flav of item.flavors) {
        const existingTaste = await this.prisma.taste.findFirst({
          where: { name: flav, brandId: brandInfo.id },
        });

        // Heurística de formato y precio base oficial en España (BOE/General)
        let explicitFormat = '50g';
        let explicitPrice = (item as any).price || 3.5;

        switch (item.brand) {
          case 'SAYes!':
            explicitFormat = '100g';
            explicitPrice = 11.95;
            break;
          case 'Blackburn':
            explicitFormat = '100g';
            explicitPrice = 14.95;
            break;
          case 'Darkside':
            explicitFormat = '30g';
            explicitPrice = 4.5;
            break;
          case 'MustHave':
            explicitFormat = '30g';
            explicitPrice = 4.5;
            break;
          case 'Element':
            explicitFormat = '30g';
            explicitPrice = 4.5;
            break;
          case 'Blaze':
            explicitFormat = '50g';
            explicitPrice = 5.7;
            break;
          case 'Anda':
            explicitFormat = '50g';
            explicitPrice = 4.0;
            break;
          case 'Blyat':
            explicitFormat = '50g';
            explicitPrice = 5.5;
            break;
          case 'Hookain':
            explicitFormat = '50g';
            explicitPrice = 3.95;
            break;
          case '187 Tobacco':
            explicitFormat = '50g';
            explicitPrice = 3.95;
            break;
          case 'Starbuzz':
            explicitFormat = '100g';
            explicitPrice = 12.5;
            break;
          case 'Fumari':
            explicitFormat = '100g';
            explicitPrice = 11.5;
            break;
          case 'Tangiers':
            explicitFormat = '250g';
            explicitPrice = 25.0;
            break;
          case 'Nameless':
            explicitFormat = '50g';
            explicitPrice = 4.0;
            break;
          case 'Serbetli':
            explicitFormat = '50g';
            explicitPrice = 3.3;
            break;
          case 'Zomo':
            explicitFormat = '50g';
            explicitPrice = 3.3;
            break;
          case 'Revoshi':
            explicitFormat = '50g';
            explicitPrice = 3.3;
            break;
          case 'Dozaj':
            explicitFormat = '50g';
            explicitPrice = 3.5;
            break;
          case 'Dozaj Black':
            explicitFormat = '50g';
            explicitPrice = 3.8;
            break;
          case 'Overdozz':
            explicitFormat = '50g';
            explicitPrice = 3.6;
            break;
          case 'Taboo':
            explicitFormat = '50g';
            explicitPrice = 3.3;
            break;
          case 'Adalya':
            explicitFormat = '50g';
            explicitPrice = 3.3;
            break;
          case 'Al Fakher':
            explicitFormat = '50g';
            explicitPrice = 3.5;
            break;
          case 'Al Waha':
            explicitFormat = '50g';
            explicitPrice = 3.2;
            break;
          case 'Azure':
            explicitFormat = '50g';
            explicitPrice = 4.5;
            break;
          case 'Social Smoke':
            explicitFormat = '50g';
            explicitPrice = 10.0;
            break;
          case 'XRacher':
            explicitFormat = '50g';
            explicitPrice = 3.8;
            break;
        }

        if (!existingTaste) {
          const newTaste = await this.prisma.taste.create({
            data: {
              name: flav,
              brandId: brandInfo.id,
              linea: 'Standard',
              descripcion: `Sabor oficial en estancos de España`,
            },
          });

          await this.prisma.tasteFormat.create({
            data: {
              tasteId: newTaste.id,
              formato: explicitFormat,
              precio: explicitPrice,
            },
          });
          addedTastes++;
        } else {
          // Check if format exists
          const existingFormat = await this.prisma.tasteFormat.findFirst({
            where: { tasteId: existingTaste.id, formato: explicitFormat },
          });

          if (!existingFormat) {
            await this.prisma.tasteFormat.create({
              data: {
                tasteId: existingTaste.id,
                formato: explicitFormat,
                precio: explicitPrice,
              },
            });
          } else {
            await this.prisma.tasteFormat.update({
              where: { id: existingFormat.id },
              data: { precio: explicitPrice },
            });
          }
        }
      }
    }

    this.logger.log(
      `✅ Semilla COMPLETA: ${addedBrands} Marcas procesadas. ${addedTastes} nuevos sabores insertados.`,
    );
    return { success: true, addedBrands, addedTastes };
  }
}
