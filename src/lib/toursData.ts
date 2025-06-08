
import type { VirtualTourType } from '@/types';

export const virtualToursData: VirtualTourType[] = [
  {
    id: '1',
    slug: 'jerusalem-antiga',
    title: 'Jerusalém Antiga: Uma Jornada no Tempo',
    shortDescription: 'Explore as ruas e muralhas da cidade sagrada como era nos tempos bíblicos.',
    longDescription: 'Caminhe pelas vielas históricas de Jerusalém, visite locais emblemáticos como o Monte do Templo (esplanada), o Muro das Lamentações e a Via Dolorosa. Entenda a importância desta cidade para múltiplas fés e sua rica tapeçaria histórica. (Componentes interativos como modelos 3D e reconstruções detalhadas em breve).',
    imagePlaceholderUrl: 'https://placehold.co/600x400.png',
    imageHint: 'ancient jerusalem',
    status: 'disponível',
    mainAttractions: ['Muro das Lamentações', 'Via Dolorosa', 'Monte das Oliveiras (vista)'],
    historicalContext: 'Jerusalém possui uma história que remonta a milênios, sendo um centro espiritual e cultural desde os tempos antigos, passando por diversos impérios e transformações.',
    relatedScriptures: ['Salmo 122:1-9', 'Lucas 19:41-44', 'Zacarias 14:4'],
  },
  {
    id: '2',
    slug: 'templo-de-salomao',
    title: 'O Magnífico Templo de Salomão',
    shortDescription: 'Descubra a grandiosidade e o significado do primeiro Templo de Jerusalém.',
    longDescription: 'Conheça a história da construção do Templo por Salomão, sua arquitetura sagrada e o papel central que desempenhou na adoração israelita. Explore virtualmente suas cortes, o Santo Lugar e o Santo dos Santos. (Componentes interativos como modelos 3D e reconstruções detalhadas em breve).',
    imagePlaceholderUrl: 'https://placehold.co/600x400.png',
    imageHint: 'solomon temple',
    status: 'disponível',
    mainAttractions: ['Pátio Externo', 'Santo Lugar', 'Santo dos Santos (Arca da Aliança - representação)'],
    historicalContext: 'Construído no século 10 a.C., o Templo de Salomão foi o centro da vida religiosa e nacional de Israel até sua destruição pelos babilônios em 586 a.C.',
    relatedScriptures: ['1 Reis 6', '2 Crônicas 3-4', 'Salmo 84'],
  },
  {
    id: '3',
    slug: 'mar-da-galileia',
    title: 'Navegando pelo Mar da Galileia',
    shortDescription: 'Visite as margens onde Jesus realizou muitos de seus milagres e ensinamentos.',
    longDescription: 'Explore as paisagens serenas do Mar da Galileia (Lago de Tiberíades), local de muitos eventos significativos no ministério de Jesus, como a pesca milagrosa, o acalmar da tempestade e o Sermão da Montanha. (Componentes interativos como modelos 3D e reconstruções detalhadas em breve).',
    imagePlaceholderUrl: 'https://placehold.co/600x400.png',
    imageHint: 'sea galilee',
    status: 'disponível',
    mainAttractions: ['Cafarnaum (ruínas)', 'Monte das Bem-Aventuranças', 'Passeio de barco (representação)'],
    historicalContext: 'O Mar da Galileia foi um centro vital para a pesca e o comércio na época de Jesus, e suas cidades vizinhas foram palco de grande parte de seu ministério terreno.',
    relatedScriptures: ['Mateus 4:18-22', 'Marcos 4:35-41', 'João 6:1-14'],
  },
  {
    id: '4',
    slug: 'caminhos-de-abraao',
    title: 'Os Caminhos de Abraão em Canaã',
    shortDescription: 'Siga os passos do patriarca Abraão pela Terra Prometida.',
    longDescription: 'Acompanhe a jornada de Abraão desde Ur dos Caldeus até Canaã, visitando locais importantes como Siquém, Betel e Hebrom, onde ele ergueu altares e viveu momentos cruciais de sua fé. (Componentes interativos como modelos 3D e reconstruções detalhadas em breve).',
    imagePlaceholderUrl: 'https://placehold.co/600x400.png',
    imageHint: 'abraham canaan',
    status: 'em breve',
  },
];

export function getTourBySlug(slug: string): VirtualTourType | undefined {
  return virtualToursData.find(tour => tour.slug === slug);
}
