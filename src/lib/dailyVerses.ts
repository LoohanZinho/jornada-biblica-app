import type { DailyVerse } from '@/types';

export const dailyVerses: DailyVerse[] = [
  { 
    id: '1', 
    reference: 'John 3:16', 
    text: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
    theme: 'Salvation' 
  },
  { 
    id: '2', 
    reference: 'Philippians 4:13', 
    text: 'I can do all things through him who strengthens me.',
    theme: 'Strength'
  },
  { 
    id: '3', 
    reference: 'Proverbs 3:5-6', 
    text: 'Trust in the LORD with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.',
    theme: 'Trust'
  },
  { 
    id: '4', 
    reference: 'Jeremiah 29:11', 
    text: 'For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope.',
    theme: 'Hope'
  },
  { 
    id: '5', 
    reference: 'Romans 8:28', 
    text: 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.',
    theme: 'Purpose'
  },
  {
    id: '6',
    reference: 'Matthew 6:33',
    text: 'But seek first the kingdom of God and his righteousness, and all these things will be added to you.',
    theme: 'Priorities'
  },
  {
    id: '7',
    reference: 'Isaiah 40:31',
    text: 'But they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.',
    theme: 'Patience'
  },
  {
    id: '8',
    reference: '1 Corinthians 10:13',
    text: 'No temptation has overtaken you that is not common to man. God is faithful, and he will not let you be tempted beyond your ability, but with the temptation he will also provide the way of escape, that you may be able to endure it.',
    theme: 'Temptation'
  },
  {
    id: '9',
    reference: 'Psalm 23:1',
    text: 'The LORD is my shepherd; I shall not want.',
    theme: 'Guidance'
  },
  {
    id: '10',
    reference: 'Galatians 5:22-23',
    text: 'But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control; against such things there is no law.',
    theme: 'Character'
  }
];

export function getRandomVerse(): DailyVerse {
  const randomIndex = Math.floor(Math.random() * dailyVerses.length);
  return dailyVerses[randomIndex];
}
