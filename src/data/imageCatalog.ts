export interface PresetImage {
  id: string;
  name: string;
  url: string;
  description: string;
}

export interface CustomImage {
  id: string;
  name: string;
  url: string;
  description?: string;
  isCustom: true;
  uploadDate: string;
}

export type ImageData = PresetImage | CustomImage;

export const LDS_IMAGES: PresetImage[] = [
  {
    id: 'none',
    name: 'No Image',
    url: '',
    description: 'Plain text header without image'
  },
  {
    id: 'resurrected-christ',
    name: 'Resurrected Christ',
    url: '/resurrected_christ.jpeg',
    description: 'The Resurrected Christ'
  },
  {
    id: 'jesus-raising-lazarus',
    name: 'Jesus Raising Lazarus',
    url: '/jesus_raising_lazarus.jpeg',
    description: 'Jesus raising Lazarus from the dead'
  },
  {
    id: 'crucifixion-christ',
    name: 'Crucifixion of Christ',
    url: '/crucifixion_christ_anderson.jpeg',
    description: 'The crucifixion of Jesus Christ'
  },
  {
    id: 'living-water',
    name: 'Living Water',
    url: '/living_water_jesus_christ.jpeg',
    description: 'Jesus Christ, the Living Water'
  },
  {
    id: 'triumphant-entry',
    name: 'Triumphant Entry',
    url: '/triumphant_entry.jpeg',
    description: 'Jesus Christ\'s triumphant entry'
  },
  {
    id: 'second-coming',
    name: 'The Second Coming',
    url: '/the_second_coming.jpeg',
    description: 'The Second Coming of Jesus Christ'
  },
  {
    id: 'lost-lamb',
    name: 'Lost Lamb',
    url: '/lost_lamb_art_lds.jpeg',
    description: 'The Good Shepherd and the lost lamb'
  },
  {
    id: 'john-baptizes-christ',
    name: 'John Baptizes Christ',
    url: '/john_baptizes_christ.jpeg',
    description: 'John the Baptist baptizing Jesus Christ'
  },
  {
    id: 'jesus-at-door',
    name: 'Jesus at the Door',
    url: '/jesus_at_the_door.jpeg',
    description: 'Jesus Christ knocking at the door'
  },
  {
    id: 'jesus-praying-gethsemane',
    name: 'Jesus Praying in Gethsemane',
    url: '/jesus_praying_in_gethsemane.jpeg',
    description: 'Jesus Christ praying in the Garden of Gethsemane'
  },
  {
    id: 'jesus-raising-jairus-daughter',
    name: 'Jesus Raising Jairus\' Daughter',
    url: '/jesus_raising_jairus_daughter_olsen.jpeg',
    description: 'Jesus raising Jairus\' daughter from the dead'
  },
  {
    id: 'jesus-blessing-children',
    name: 'Jesus Blessing the Children',
    url: '/jesus_blessing_the_children.jpeg',
    description: 'Jesus Christ blessing the children'
  },
  {
    id: 'go-ye-therefore',
    name: 'Go Ye Therefore',
    url: '/go_ye_therefore_and_teach_all_nations.jpeg',
    description: 'Go ye therefore and teach all nations'
  },
  {
    id: 'christ-rich-young-ruler',
    name: 'Christ and the Rich Young Ruler',
    url: '/christ_rich_young_ruler_hofmann.jpeg',
    description: 'Jesus Christ and the rich young ruler'
  },
  {
    id: 'christ-ordaining-apostles',
    name: 'Christ Ordaining the Apostles',
    url: '/christ_ordaining_the_apostles.jpeg',
    description: 'Jesus Christ ordaining the apostles'
  },
  {
    id: 'jesus-burial-tomb',
    name: 'Jesus Burial Tomb',
    url: '/jesus_burial_tomb.jpeg',
    description: 'The burial tomb of Jesus Christ'
  },
  {
    id: 'pool-of-bethesda',
    name: 'Pool of Bethesda',
    url: '/pool_of_bethesda_carl_bloch.jpeg',
    description: 'The Pool of Bethesda'
  },
  {
    id: 'calling-the-fishermen',
    name: 'Calling the Fishermen',
    url: '/calling_the_fishermen.jpeg',
    description: 'Jesus calling the fishermen to be fishers of men'
  },
  {
    id: 'angel-appears-shepherds',
    name: 'Angel Appears to Shepherds',
    url: '/angel_appears_shepherds.jpeg',
    description: 'The angel announcing Christ\'s birth to the shepherds'
  },
  {
    id: 'jesus-birth-nativity',
    name: 'Jesus Birth Nativity',
    url: '/jesus_birth_nativity.jpeg',
    description: 'The birth of Jesus Christ'
  },
  {
    id: 'mary-joseph-inn-bethlehem',
    name: 'Mary and Joseph at the Inn',
    url: '/mary_joseph_inn_bethlehem.jpeg',
    description: 'Mary and Joseph seeking room at the inn in Bethlehem'
  },
  {
    id: 'nativity',
    name: 'The Nativity',
    url: '/nativity.jpeg',
    description: 'The nativity scene'
  },
  {
    id: 'mary-joseph-bethlehem-inn-barrett',
    name: 'Mary and Joseph at Bethlehem Inn',
    url: '/robert_barrett_mary_joseph_bethlehem_inn.jpeg',
    description: 'Mary and Joseph at the Bethlehem inn by Robert Barrett'
  },
  {
    id: 'star-jesus-birth',
    name: 'Star of Jesus Birth',
    url: '/star_jesus_birth.jpeg',
    description: 'The star announcing the birth of Jesus'
  },
  {
    id: 'walter-rane-nativity',
    name: 'Nativity by Walter Rane',
    url: '/walter_rane_nativity.jpeg',
    description: 'The nativity scene by Walter Rane'
  }
];

export const getImageByIdSync = (id: string): ImageData => {
  const presetImage = LDS_IMAGES.find(img => img.id === id);
  if (presetImage) return presetImage;
  if (id.startsWith('custom-')) {
    return {
      id,
      name: 'Custom Image',
      url: '',
      description: 'Custom uploaded image',
    };
  }
  return LDS_IMAGES[0];
};
