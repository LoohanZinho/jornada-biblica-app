
import type { DailyVerse } from '@/types';

export const dailyVerses: DailyVerse[] = [
  {
    id: '1',
    reference: 'João 3:16',
    text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
    theme: 'Salvação'
  },
  {
    id: '2',
    reference: 'Filipenses 4:13',
    text: 'Posso todas as coisas naquele que me fortalece.',
    theme: 'Força'
  },
  {
    id: '3',
    reference: 'Provérbios 3:5-6',
    text: 'Confia no SENHOR de todo o teu coração e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.',
    theme: 'Confiança'
  },
  {
    id: '4',
    reference: 'Jeremias 29:11',
    text: 'Porque sou eu que conheço os planos que tenho para vocês", diz o SENHOR, "planos de fazê-los prosperar e não de lhes causar dano, planos de dar-lhes esperança e um futuro.',
    theme: 'Esperança'
  },
  {
    id: '5',
    reference: 'Romanos 8:28',
    text: 'Sabemos que Deus age em todas as coisas para o bem daqueles que o amam, dos que foram chamados de acordo com o seu propósito.',
    theme: 'Propósito'
  },
  {
    id: '6',
    reference: 'Mateus 6:33',
    text: 'Busquem, pois, em primeiro lugar o Reino de Deus e a sua justiça, e todas estas coisas lhes serão acrescentadas.',
    theme: 'Prioridades'
  },
  {
    id: '7',
    reference: 'Isaías 40:31',
    text: 'Mas aqueles que esperam no SENHOR renovam as suas forças. Voam alto como águias; correm e não ficam exaustos, andam e não se cansam.',
    theme: 'Paciência'
  },
  {
    id: '8',
    reference: '1 Coríntios 10:13',
    text: 'Não sobreveio a vocês tentação que não fosse comum aos homens. E Deus é fiel; ele não permitirá que vocês sejam tentados além do que podem suportar. Mas, quando forem tentados, ele mesmo lhes providenciará um escape, para que o possam suportar.',
    theme: 'Tentação'
  },
  {
    id: '9',
    reference: 'Salmos 23:1',
    text: 'O SENHOR é o meu pastor; nada me faltará.',
    theme: 'Orientação'
  },
  {
    id: '10',
    reference: 'Gálatas 5:22-23',
    text: 'Mas o fruto do Espírito é amor, alegria, paz, paciência, amabilidade, bondade, fidelidade, mansidão e domínio próprio. Contra essas coisas não há lei.',
    theme: 'Caráter'
  }
];

export function getRandomVerse(): DailyVerse {
  const randomIndex = Math.floor(Math.random() * dailyVerses.length);
  return dailyVerses[randomIndex];
}

    