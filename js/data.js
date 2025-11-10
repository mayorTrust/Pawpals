const MOCK_NAMES = ['Buddy', 'Lucy', 'Max', 'Daisy', 'Rocky', 'Zoe', 'Charlie', 'Molly', 'Toby', 'Maggie', 'Bear', 'Sadie', 'Duke', 'Chloe', 'Jack', 'Sophie'];
const MOCK_BREEDS = ['Golden Retriever', 'Corgi', 'French Bulldog', 'Siberian Husky', 'Dachshund', 'Poodle', 'German Shepherd', 'Beagle', 'Boxer', 'Labrador'];
const placeholderImages = [
    "https://images.unsplash.com/photo-1552053831-71594a27632d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxkb2clMjBjdXRlfGVufDB8fHx8MTc2MjE4NjY3Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1629751223385-5e9e8c004b40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxwdXBweSUyMGhhcHB5fGVufDB8fHx8MTc2MjI3NjIwOHww&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1534628526458-a8de087b1123?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxzbWFsbCUyMGRvZ3xlbnwwfHx8fDE3NjIyMzQxOTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1608376698954-d5f13fc713f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxmbHVmZnklMjBkb2d8ZW58MHx8fHwxNzYyMjc2MjA5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1586875331842-5409a287612d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxkb2clMjBwYXJrfGVufDB8fHx8MTc2MjI0ODQ3NXww&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1670432257417-425febb333da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8cHVwcHklMjBleWVzfGVufDB8fHx8MTc2MjI3NjIwOHww&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1534361960057-19889db9621e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxkb2clMjBydW5uaW5nfGVufDB8fHx8MTc2MjI2MTg2OHww&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1627738643556-9be11fb1d77b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxzbGVlcHklMjBwdXBweXxlbnwwfHx8fDE3NjIyNzYyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1620325698009-4163b8f6d501?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxkb2clMjBwbGF5aW5nfGVufDB8fHx8MTc2MjI3MDYwOHww&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1631237930708-7f390f03c14c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxicm93biUyMGRvZ3xlbnwwfHx8fDE3NjIyNzYyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1587582856791-8802e1b8be51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHx3aGl0ZSUyMGRvZ3xlbnwwfHx8fDE3NjIyNzYyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1547569026-e7e7c51be6f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8YmxhY2slMjBkb2d8ZW58MHx8fHwxNzYyMjc2MjA4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1562176566-e9afd27531d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxwdXBweSUyMHNtaWxpbmd8ZW58MHx8fHwxNzYyMjc2MjA4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1650062416774-83dafdcdd9cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxkb2clMjB0b25ndWV8ZW58MHx8fHwxNzYyMjc2MjA4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1591946614720-90a587da4a36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxiaWclMjBkb2d8ZW58MHx8fHwxNzYyMjc2MjA4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1592432360900-db45ed919dfe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxzcG90dGVkJTIwZG9nfGVufDB8fHx8MTc2MjI3NjIwOHww&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1719910449236-77868f912a64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxkb2clMjBmaWVsZHxlbnwwfHx8fDE3NjIxNjY4MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHx0d28lMjBkb2dzfGVufDB8fHx8MTc2MjI3NjIwOHww&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1613135491238-10c9c61f4b2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxwdXBweSUyMHNhZHxlbnwwfHx8fDE3NjIyNzYyMDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1761483598637-b5552176eff3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxsb25nLWhhaXJlZCUyMGRvZ3xlbnwwfHx8fDE3NjIyNzYyMDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1676253134529-74a107149ceb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxzaG9ydC1oYWlyZWQlMjBkb2d8ZW58MHx8fHwxNzYyMjc2MjA5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1512723185835-0700e5069a9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxkb2clMjBqdW1waW5nfGVufDB8fHx8MTc2MjI3NjIwOHww&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1676208575926-0f8b900755c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxkb2clMjBzd2ltbWluZ3xlbnwwfHx8fDE3NjIyNzYyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1627969798858-d9f2ad4be01b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxwdXBweSUyMHNsZWVwaW5nfGVufDB8fHx8MTc2MjI3NjIwOHww&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1724367236214-e4f50691c27c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxkb2clMjBwb3J0cmFpdHxlbnwwfHx8fDE3NjIyNzYyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1587518102280-8d5fdcb68d13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxvbGQlMjBkb2d8ZW58MHx8fHwxNzYyMjM0OTY1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1609075377293-0fc919bd21ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxkb2clMjBiZWFjaHxlbnwwfHx8fDE3NjIyMDA3MzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1587559070757-f72a388edbba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxkb2clMjB0b3l8ZW58MHx8fHwxNzYyMjc2MjA4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1649003592839-ce0bf1a804fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxwdXBweSUyMGN1dGV8ZW58MHx8fHwxNzYyMTc0Mzg2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1569992274375-e56b14e234f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxkb2clMjB3YWxrfGVufDB8fHx8MTc2MjI3NjIwOXww&ixlib=rb-4.1.0&q=80&w=1080"
];

function pseudoRandom(seed) {
    let value = seed;
    return function() {
        value = (value * 9301 + 49297) % 233280;
        return value / 233280;
    }
}

function generateMockListings(count) {
  const listings = [];
  const rng = pseudoRandom(12345);

  for (let i = 0; i < count; i++) {
    const nameIndex = Math.floor(rng() * MOCK_NAMES.length);
    const breedIndex = Math.floor(rng() * MOCK_BREEDS.length);
    const imageUrl = placeholderImages[i % placeholderImages.length];

    listings.push({
      id: String(i + 1),
      name: MOCK_NAMES[nameIndex],
      breed: MOCK_BREEDS[breedIndex],
      age: Math.floor(rng() * 24) + 2, // 2 to 25 months
      price: Math.floor(rng() * 2000) + 500, // 500 to 2499
      status: 'available',
      imageUrls: [imageUrl],
      breederId: `mock-breeder-${i}`,
      healthInfo: { 
          vaccinated: rng() > 0.3, 
          dewormed: rng() > 0.2, 
          notes: 'A healthy and happy puppy.' 
      },
      createdAt: new Date().toISOString(),
      description: `This is a wonderful ${MOCK_BREEDS[breedIndex]} with a playful and friendly personality. Great with kids and other pets. Looking for a forever home!`
    });
  }
  return listings;
}

const mockListings = generateMockListings(30);

const mockOrders = [
    {
        orderId: 'ORD-001',
        date: '2025-10-28',
        total: 2150,
        status: 'Delivered',
        items: [mockListings[5], mockListings[12]]
    },
    {
        orderId: 'ORD-002',
        date: '2025-09-15',
        total: 980,
        status: 'Delivered',
        items: [mockListings[2]]
    }
];
