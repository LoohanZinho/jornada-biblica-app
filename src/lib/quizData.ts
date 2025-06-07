import type { QuizQuestionType } from '@/types';

export const sampleQuizQuestions: QuizQuestionType[] = [
  {
    id: '1',
    question: "Who built the Ark as instructed by God to save his family and animals from the great flood?",
    options: ["Moses", "Noah", "Abraham", "David"],
    correctAnswer: "Noah",
    topic: "Old Testament",
    difficulty: "easy",
    explanationContext: "The story of Noah's Ark is found in the Book of Genesis, chapters 6-9. God instructed Noah, a righteous man, to build a large vessel (ark) to preserve life during a worldwide flood meant to cleanse the earth of wickedness.",
    imageHint: "ark flood"
  },
  {
    id: '2',
    question: "Which prophet is known for parting the Red Sea?",
    options: ["Elijah", "Isaiah", "Moses", "Jeremiah"],
    correctAnswer: "Moses",
    topic: "Old Testament",
    difficulty: "easy",
    explanationContext: "Moses, a key figure in Judaism, Christianity, and Islam, led the Israelites out of slavery in Egypt. The parting of the Red Sea, described in the Book of Exodus, allowed them to escape the pursuing Egyptian army.",
    imageHint: "sea parting"
  },
  {
    id: '3',
    question: "What is the first book of the New Testament?",
    options: ["Genesis", "Revelation", "Matthew", "Acts"],
    correctAnswer: "Matthew",
    topic: "New Testament",
    difficulty: "easy",
    explanationContext: "The Gospel of Matthew is the first book of the New Testament and one of the three synoptic Gospels. It tells how Israel's Messiah, Jesus, comes to his people and forms a community of disciples.",
    imageHint: "bible open"
  },
  {
    id: '4',
    question: "Who was swallowed by a great fish after disobeying God's command to go to Nineveh?",
    options: ["Jonah", "Daniel", "Job", "Samuel"],
    correctAnswer: "Jonah",
    topic: "Prophets",
    difficulty: "medium",
    explanationContext: "The Book of Jonah tells the story of a Hebrew prophet named Jonah, son of Amittai, who is sent by God to prophesy the destruction of Nineveh but tries to escape the divine mission.",
    imageHint: "whale fish"
  },
  {
    id: '5',
    question: "Which of these is NOT one of the Ten Commandments?",
    options: ["You shall not murder.", "Honor your father and your mother.", "Love your neighbor as yourself.", "Remember the Sabbath day by keeping it holy."],
    correctAnswer: "Love your neighbor as yourself.",
    topic: "Old Testament",
    difficulty: "medium",
    explanationContext: "'Love your neighbor as yourself' is a central commandment (Leviticus 19:18), often called the Golden Rule, but it's distinct from the Ten Commandments given to Moses on Mount Sinai (Exodus 20, Deuteronomy 5).",
    imageHint: "stone tablets"
  },
  {
    id: '6',
    question: "Who is considered the father of the faithful and was promised descendants as numerous as the stars?",
    options: ["Isaac", "Jacob", "Abraham", "Joseph"],
    correctAnswer: "Abraham",
    topic: "Patriarchs",
    difficulty: "easy",
    explanationContext: "Abraham, originally Abram, is a central figure in Judaism, Christianity, and Islam. God made a covenant with him, promising him numerous descendants and land. His story is primarily found in the Book of Genesis.",
    imageHint: "stars desert"
  },
  {
    id: '7',
    question: "In which city was Jesus born?",
    options: ["Jerusalem", "Nazareth", "Bethlehem", "Capernaum"],
    correctAnswer: "Bethlehem",
    topic: "New Testament",
    difficulty: "easy",
    explanationContext: "According to the Gospels of Matthew and Luke, Jesus was born in Bethlehem of Judea. This fulfilled prophecies from the Old Testament (Micah 5:2).",
    imageHint: "manger star"
  },
  {
    id: '8',
    question: "Who was the first king of Israel?",
    options: ["David", "Solomon", "Saul", "Samuel"],
    correctAnswer: "Saul",
    topic: "Kings of Israel",
    difficulty: "medium",
    explanationContext: "Saul, son of Kish, from the tribe of Benjamin, was anointed by the prophet Samuel as the first king of the united Kingdom of Israel. His reign is described in the Book of Samuel.",
    imageHint: "ancient crown"
  },
  {
    id: '9',
    question: "What miracle is Jesus most known for performing with five loaves and two fish?",
    options: ["Walking on water", "Healing the blind", "Feeding the 5000", "Raising Lazarus"],
    correctAnswer: "Feeding the 5000",
    topic: "Miracles of Jesus",
    difficulty: "medium",
    explanationContext: "The feeding of the 5000 is one of the most famous miracles of Jesus, recorded in all four Gospels. With just five barley loaves and two small fish, Jesus fed a crowd of five thousand men, plus women and children.",
    imageHint: "bread fish"
  },
  {
    id: '10',
    question: "Which apostle denied Jesus three times before the rooster crowed?",
    options: ["Judas", "Peter", "John", "Thomas"],
    correctAnswer: "Peter",
    topic: "Apostles",
    difficulty: "medium",
    explanationContext: "Simon Peter, one of Jesus's closest apostles, famously denied knowing Jesus three times on the night of Jesus's arrest, as Jesus had predicted. This event is recorded in all four Gospels.",
    imageHint: "rooster night"
  }
];

export const quizTopics = ["All Topics", "Old Testament", "New Testament", "Prophets", "Patriarchs", "Kings of Israel", "Miracles of Jesus", "Apostles"];
export const quizDifficulties = ["any", "easy", "medium", "hard"];
