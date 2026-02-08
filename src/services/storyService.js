/**
 * Story Generation Service
 *
 * Architecture
 * ============
 *   Story text  →  OpenAI gpt-4o-mini OR Grok (xAI)  (cloud APIs)
 *   Story image →  Z-Image-Turbo                      (self-hosted on AWS EC2, saves to S3)
 *
 * Setup - Environment Variables
 * ==============================
 *   GROK_API_KEY        →  Set in .env file (never commit!)
 *   OPENAI_API_KEY      →  https://platform.openai.com/api-keys (optional)
 *   AWS_IMAGE_ENDPOINT  →  http://<your-ec2-public-ip>:8000 (optional)
 *
 * For local development:
 *   - Create .env file with: GROK_API_KEY=xai-your-key-here
 *   - .env is in .gitignore and will NEVER be committed
 *
 * For production builds:
 *   - Set secrets using: eas secret:create --scope project --name GROK_API_KEY --value xai-your-key
 *   - Secrets are encrypted and secure
 */

import Constants from 'expo-constants';

// ============================================================
// CONFIG - Load from environment variables (SECURE)
// ============================================================
const GROK_API_KEY = Constants.expoConfig?.extra?.grokApiKey || process.env.GROK_API_KEY || '';
const OPENAI_API_KEY = Constants.expoConfig?.extra?.openaiApiKey || '';
const AWS_IMAGE_ENDPOINT = Constants.expoConfig?.extra?.awsImageEndpoint || '';

// Choose which AI to use for story generation: 'openai' or 'grok'
const AI_PROVIDER = 'grok';

// Validate API key is present
if (!GROK_API_KEY && AI_PROVIDER === 'grok') {
  console.error('⚠️ GROK_API_KEY not found! Story generation will fail.');
  console.error('Set GROK_API_KEY in .env file or using EAS secrets');
}

// ============================================================
// TEXT GENERATION — OpenAI GPT
// ============================================================
export async function generateStoryTextOpenAI(userPrompt, childAge = 5) {
  // CRITICAL: Sanitize user prompt for child safety
  const safePrompt = sanitizePrompt(userPrompt);

  console.log(`🤖 Calling OpenAI API for age ${childAge} (density: ${getContentDensityLevel(childAge)})`);
  console.log('📝 Sanitized prompt:', safePrompt);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt(childAge),
        },
        { role: 'user', content: safePrompt },
      ],
      max_tokens: 900,
      temperature: 0.8,
    }),
  });

  if (!response.ok) throw new Error('OpenAI text generation failed');
  const data = await response.json();
  return data.choices[0].message.content;
}

// ============================================================
// CONTENT SAFETY FILTER
// ============================================================
function sanitizePrompt(userPrompt) {
  // List of inappropriate topics/words to filter out
  const inappropriatePatterns = [
    /sex/gi, /sexual/gi, /porn/gi, /nude/gi, /naked/gi,
    /kill/gi, /murder/gi, /death/gi, /dead/gi, /blood/gi,
    /abuse/gi, /violent/gi, /hurt/gi, /pain/gi,
    /drug/gi, /alcohol/gi, /beer/gi, /wine/gi, /drunk/gi,
    /gun/gi, /weapon/gi, /knife/gi, /sword/gi,
    /scary/gi, /horror/gi, /monster/gi, /nightmare/gi,
    /damn/gi, /hell/gi, /crap/gi, /stupid/gi,
  ];

  let sanitized = userPrompt;

  // Remove inappropriate words/phrases
  inappropriatePatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // If prompt becomes empty or too short after filtering, use a safe default
  if (sanitized.trim().length < 5) {
    sanitized = 'a magical adventure with friendship and kindness';
  }

  return sanitized.trim();
}

// ============================================================
// AGE-BASED CONTENT DENSITY SYSTEM
// ============================================================

/**
 * Determines content density level based on child's age
 * Ages are clamped to 3-12 range for content generation
 */
function getContentDensityLevel(age) {
  const clampedAge = Math.max(3, Math.min(12, age));
  if (clampedAge <= 4) return 'VERY_SIMPLE';
  if (clampedAge <= 6) return 'SIMPLE';
  if (clampedAge <= 8) return 'MODERATE';
  if (clampedAge <= 10) return 'ADVANCED';
  return 'PRETEEN'; // 11-12
}

/**
 * Returns configuration object for each content density level
 * Defines vocabulary, sentence structure, themes, and examples
 */
function getDensityConfig(densityLevel) {
  const configs = {
    VERY_SIMPLE: {
      vocabularyDesc: 'VERY SIMPLE',
      vocabularyLevel: 'VERY SIMPLE words that 3-4 year olds know',
      syllableGuidance: '1-2 syllables when possible',
      sentenceLength: 'SHORT sentences: 5-10 words maximum per sentence',
      sentenceStructure: 'Simple subject-verb-object structure',
      tenseGuidance: 'Use present tense and active voice',
      dialogueStyle: 'Use simple dialogue with common words kids say: "Wow!" "Look!" "Yay!" "Oh no!"',
      narrativeTechniques: 'Include repetitive phrases that kids can predict and follow',
      pageWordCount: '40-50',
      sentencesPerPage: '5-6 very short',
      themes: 'daily activities, toys, family, simple emotions (happy, sad, excited)',
      emotionTypes: 'basic emotions children understand: happy, excited, curious, proud, caring',
      conflictTypes: 'lost toys, making friends, trying new things',
      vocabularyExamples:
        "VOCABULARY GUIDELINES:\n" +
        "✅ USE: run, jump, play, look, see, happy, sad, big, small, friend, help, find, try, smile, laugh\n" +
        "❌ AVOID: discover, realize, magnificent, extraordinary, venture, journey, behold",
      sentenceExamples:
        "SENTENCE STRUCTURE EXAMPLES:\n" +
        "Good: 'Emma saw a big tree. It was so tall! Emma wanted to climb it.'\n" +
        "Bad: 'Emma discovered an enormous oak tree and contemplated ascending it.'",
    },

    SIMPLE: {
      vocabularyDesc: 'simple',
      vocabularyLevel: 'simple words with some variety',
      syllableGuidance: '1-3 syllables, prioritize common words',
      sentenceLength: 'sentences: 8-15 words per sentence',
      sentenceStructure: 'Compound sentences with "and", "but" allowed',
      tenseGuidance: 'Mix of present and past tense, keep it simple',
      dialogueStyle: 'Natural dialogue with more variety: "I can do this!" "What should we do?" "That\'s amazing!"',
      narrativeTechniques: 'Use descriptive words kids know. Show emotions through actions.',
      pageWordCount: '45-55',
      sentencesPerPage: '4-6',
      themes: 'school, friendships, simple challenges, nature, seasons',
      emotionTypes: 'emotions: happy, sad, brave, worried, curious, proud, surprised',
      conflictTypes: 'small challenges, learning new skills, solving simple problems together',
      vocabularyExamples:
        "VOCABULARY GUIDELINES:\n" +
        "✅ USE: discover, wonderful, adventure, together, celebrate, explore, secret\n" +
        "✅ USE: 'Emma discovered a tall tree' or 'Emma felt brave and curious'\n" +
        "❌ AVOID: magnificent, contemplated, extraordinary, triumphant",
      sentenceExamples:
        "SENTENCE STRUCTURE EXAMPLES:\n" +
        "Good: 'Emma discovered a tall tree in the forest, and she wanted to climb to the very top. She felt brave and curious.'\n" +
        "Bad: 'Emma observed the magnificent oak and contemplated her ascent with trepidation.'",
    },

    MODERATE: {
      vocabularyDesc: 'moderate',
      vocabularyLevel: 'richer vocabulary with descriptive words',
      syllableGuidance: '2-4 syllables, use descriptive adjectives and adverbs',
      sentenceLength: 'sentences: 10-20 words per sentence',
      sentenceStructure: 'Complex sentences with subordinate clauses',
      tenseGuidance: 'Varied tenses, more sophisticated transitions',
      dialogueStyle: 'Dialogue reveals character: "I\'m a little scared, but I\'m going to try!" "We can figure this out together."',
      narrativeTechniques: 'Use vivid descriptions. Show character growth. Include internal thoughts.',
      pageWordCount: '50-60',
      sentencesPerPage: '4-5',
      themes: 'problem-solving, teamwork, overcoming fears, exploration, creativity, persistence',
      emotionTypes: 'emotions: determined, disappointed, amazed, relieved, confident, uncertain',
      conflictTypes: 'overcoming fears, working through disagreements, persisting through difficulty',
      vocabularyExamples:
        "VOCABULARY GUIDELINES:\n" +
        "✅ USE: realized, magnificent, determined, cautious, glimmering, towered, beckoned\n" +
        "✅ USE: 'As Emma gazed up at the magnificent tree' or 'She felt determined to reach the top'\n" +
        "✅ Metaphors: 'tall as a skyscraper' 'branches like arms reaching for the sky'",
      sentenceExamples:
        "SENTENCE STRUCTURE EXAMPLES:\n" +
        "Good: 'As Emma gazed up at the magnificent tree, she realized it was the tallest one in the entire forest. She felt determined to reach the top, even though it seemed a little scary.'\n" +
        "Bad: 'Emma contemplated the existential implications of her arboreal ascent.'",
    },

    ADVANCED: {
      vocabularyDesc: 'advanced',
      vocabularyLevel: 'sophisticated vocabulary',
      syllableGuidance: '2-5+ syllables, use literary vocabulary',
      sentenceLength: 'sentences: 12-25 words per sentence',
      sentenceStructure: 'Complex sentence structures with varied syntax',
      tenseGuidance: 'Sophisticated tense usage, including perfect tenses',
      dialogueStyle: 'Nuanced dialogue that reveals subtext and character development',
      narrativeTechniques: 'Use foreshadowing, internal monologue, symbolism. Develop character arc.',
      pageWordCount: '55-65',
      sentencesPerPage: '3-5',
      themes: 'complex moral dilemmas, identity, responsibility, consequences, personal growth',
      emotionTypes: 'emotions: conflicted, resilient, empathetic, introspective, ambitious, vulnerable',
      conflictTypes: 'moral choices, complex problems requiring creative solutions, internal struggles',
      vocabularyExamples:
        "VOCABULARY GUIDELINES:\n" +
        "✅ USE: contemplated, extraordinary, perseverance, obstacles, triumph, beckoned, ancient, phenomenon\n" +
        "✅ Literary devices: metaphors, similes (\"like a skyscraper\"), personification (\"the tree whispered\")\n" +
        "✅ Rich descriptions with multiple adjectives and adverbs",
      sentenceExamples:
        "SENTENCE STRUCTURE EXAMPLES:\n" +
        "Good: 'Emma contemplated the extraordinary challenge before her: the ancient oak towered above like a skyscraper, its branches beckoning her upward. Despite her racing heart, she knew that conquering this obstacle would prove her perseverance.'",
    },

    PRETEEN: {
      vocabularyDesc: 'sophisticated',
      vocabularyLevel: 'advanced, literary vocabulary',
      syllableGuidance: 'no syllable restrictions, embrace complexity',
      sentenceLength: 'sentences: 15-30+ words per sentence',
      sentenceStructure: 'Sophisticated narrative voice with literary techniques',
      tenseGuidance: 'Complex tense usage, flashbacks, multiple timelines possible',
      dialogueStyle: 'Sophisticated dialogue with subtext, irony, wit',
      narrativeTechniques: 'Use all literary devices: symbolism, allegory, multiple perspectives, philosophical themes',
      pageWordCount: '60-70',
      sentencesPerPage: '3-4',
      themes: 'abstract concepts, social dynamics, self-discovery, ethical questions, coming-of-age',
      emotionTypes: 'emotions: ambivalent, nostalgic, cynical, enlightened, melancholic, euphoric',
      conflictTypes: 'abstract challenges, philosophical dilemmas, complex social situations',
      vocabularyExamples:
        "VOCABULARY GUIDELINES:\n" +
        "✅ USE: phenomenon, philosophical, existential, nuanced, juxtaposition, paradox, ephemeral\n" +
        "✅ Literary devices: alliteration, personification, symbolism, allegory\n" +
        "✅ Complex metaphors and layered meaning",
      sentenceExamples:
        "SENTENCE STRUCTURE EXAMPLES:\n" +
        "Good: 'Standing at the base of the colossal oak, Emma pondered the philosophical implications of her ascent: was this merely a physical challenge, or a metaphor for the obstacles she'd face in life? The tree seemed to whisper ancient wisdom through its rustling leaves, each rustle a secret about perseverance and growth.'",
    },
  };

  return configs[densityLevel];
}

/**
 * Builds dynamic system prompt based on child's age
 * Returns a complete system prompt with age-appropriate guidelines
 */
function buildSystemPrompt(age) {
  const densityLevel = getContentDensityLevel(age);
  const config = getDensityConfig(densityLevel);

  return (
    `You are an award-winning children's story writer creating magical tales for ages ${Math.max(3, Math.min(12, age))}.\n\n` +

    "CONTENT SAFETY RULES (ABSOLUTE):\n" +
    "- NEVER include sexual, violent, abusive, scary, or adult content\n" +
    "- NEVER use profanity, curse words, or mean language\n" +
    "- NEVER include death, injury, weapons, or danger\n" +
    "- NEVER reference drugs, alcohol, or inappropriate substances\n" +
    "- If the user prompt contains inappropriate topics, IGNORE them and create a wholesome story instead\n\n" +

    "STORY QUALITY GUIDELINES:\n" +
    "- IMPORTANT: If a child's name is provided in the prompt, use it consistently as the main character throughout the entire story\n" +
    `- Use ${config.vocabularyDesc} vocabulary appropriate for age ${age}\n` +
    `- Focus on ${config.themes}\n` +
    `- Include ${config.emotionTypes}\n` +
    "- Create relatable characters children can connect with\n" +
    "- Use vivid, colorful descriptions that spark imagination\n" +
    `- Make conflicts age-appropriate: ${config.conflictTypes}\n` +
    "- End with a warm, positive resolution that reinforces the lesson\n\n" +

    "WRITING STYLE:\n" +
    `- Use ${config.vocabularyLevel} words (${config.syllableGuidance})\n` +
    `- Write ${config.sentenceLength}\n` +
    `- ${config.sentenceStructure}\n` +
    `- ${config.tenseGuidance}\n` +
    `- ${config.dialogueStyle}\n` +
    `- ${config.narrativeTechniques}\n\n` +

    `${config.vocabularyExamples}\n\n` +

    "FORMAT REQUIREMENTS:\n" +
    "Write stories in EXACTLY 6 pages like a children's picture book.\n" +
    `Each page should be ${config.pageWordCount} words total.\n` +
    `Use ${config.sentencesPerPage} sentences per page.\n` +
    "The story should flow naturally across all 6 pages with a clear beginning, middle, and end.\n\n" +

    `${config.sentenceExamples}\n\n` +

    "Output format:\n" +
    "TITLE: [Engaging, child-friendly title]\n" +
    "PAGE 1: [Opening - introduce character and setting]\n" +
    "PAGE 2: [Something interesting happens]\n" +
    "PAGE 3: [A gentle challenge or adventure begins]\n" +
    "PAGE 4: [Character tries to solve the challenge]\n" +
    "PAGE 5: [Solution found through positive actions]\n" +
    "PAGE 6: [Happy ending with lesson learned]\n\n" +

    "No other formatting or markdown. Keep it pure, wholesome, and magical!"
  );
}

// ============================================================
// TEXT GENERATION — Grok API (xAI)
// ============================================================
export async function generateStoryTextGrok(userPrompt, childAge = 5) {
  // CRITICAL: Sanitize user prompt for child safety
  const safePrompt = sanitizePrompt(userPrompt);

  console.log(`🤖 Calling Grok API for age ${childAge} (density: ${getContentDensityLevel(childAge)})`);
  console.log('📝 Sanitized prompt:', safePrompt);

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-3',
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt(childAge),
        },
        { role: 'user', content: safePrompt },
      ],
      max_tokens: 900,
      temperature: 0.8,
    }),
  });

  console.log('📡 Grok API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Grok API error:', errorText);
    throw new Error(`Grok API failed with status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log('✅ Grok API success! Generated 6-page story.');
  return data.choices[0].message.content;
}

// ============================================================
// UNIFIED TEXT GENERATION — Routes to selected provider
// ============================================================
export async function generateStoryText(userPrompt, childAge = 5) {
  if (AI_PROVIDER === 'grok') {
    return generateStoryTextGrok(userPrompt, childAge);
  }
  return generateStoryTextOpenAI(userPrompt, childAge);
}

// ============================================================
// IMAGE GENERATION — Z-Image-Turbo on AWS
// The EC2 server saves the image to S3 and returns a public URL.
// S3 URLs don't expire, so no local download is needed.
// ============================================================
export async function generateStoryImage(title, bodyPreview) {
  const prompt =
    "Children's book illustration, watercolor style, vibrant warm colors, no text in the image. " +
    `Scene: "${title}" — ${bodyPreview}. ` +
    'Soft lighting, dreamy atmosphere, suitable for young children.';

  const response = await fetch(`${AWS_IMAGE_ENDPOINT}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, width: 1024, height: 1024 }),
  });

  if (!response.ok) throw new Error('Z-Image generation failed');
  const data = await response.json();
  return data.url; // permanent S3 URL
}

// ============================================================
// MAIN ENTRY POINT — called by CreateScreen
// ============================================================
export async function createStory(childPhotoUri, userPrompt, childName = '', childAge = 5) {
  const id = `story_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  // Build the complete prompt with child's name
  const enhancedPrompt = childName
    ? `Create a story where the main character is a child named ${childName}. Story theme: ${userPrompt}`
    : userPrompt;

  console.log(`📚 Creating story for child: ${childName}, age: ${childAge}`);

  // Check if AI key is ready (text generation)
  const aiKeyReady = AI_PROVIDER === 'grok'
    ? (GROK_API_KEY && GROK_API_KEY !== 'xai-...')
    : (OPENAI_API_KEY && OPENAI_API_KEY !== 'sk-...');

  // Check if image endpoint is ready (image generation - optional)
  const imageKeyReady = AWS_IMAGE_ENDPOINT && AWS_IMAGE_ENDPOINT !== 'http://...';

  // Use real AI if key is ready (image generation is optional)
  if (aiKeyReady) {
    try {
      // Generate story text with Grok/OpenAI using enhanced prompt
      const rawText = await generateStoryText(enhancedPrompt, childAge);
      const { title, pages } = parseStoryPages(rawText);

      // Try to generate image if AWS endpoint is configured
      let illustrationUrl = null;
      if (imageKeyReady) {
        try {
          // Use first page text for image prompt
          const imagePrompt = pages[0] ? pages[0].slice(0, 150) : title;
          illustrationUrl = await generateStoryImage(title, imagePrompt);
        } catch (imageError) {
          console.warn('Image generation failed, continuing without illustration:', imageError);
          // Continue without image - text generation succeeded
        }
      }

      return {
        id,
        title,
        pages, // Now using pages array instead of single body
        childPhotoUri,
        illustrationUrl,
        prompt: enhancedPrompt,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Story generation failed:', error);
      // Fall back to mock if API call fails
    }
  }

  // --- MOCK (no API key or API failed) ---
  const { title, body } = await mockGenerateStory(childName);
  return {
    id,
    title,
    pages: [body], // Convert mock body to single-page array for consistency
    childPhotoUri,
    illustrationUrl: null,
    prompt: enhancedPrompt,
    createdAt: new Date().toISOString(),
  };
}

// ============================================================
// HELPERS
// ============================================================
function parseStoryText(raw) {
  const lines = raw.split('\n');
  const title = lines[0].replace(/[*#\[\]]/g, '').trim();
  const body = lines.slice(1).join('\n').trim();
  return { title, body };
}

// Parse 6-page story format from Grok
function parseStoryPages(raw) {
  const lines = raw.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  let title = '';
  const pages = [];

  for (const line of lines) {
    if (line.startsWith('TITLE:')) {
      title = line.replace('TITLE:', '').trim();
    } else if (line.match(/^PAGE \d+:/)) {
      const pageText = line.replace(/^PAGE \d+:/, '').trim();
      pages.push(pageText);
    }
  }

  // Fallback: if parsing failed, return mock structure
  if (!title || pages.length === 0) {
    console.warn('Failed to parse 6-page format, using fallback parser');
    const fallback = parseStoryText(raw);
    return {
      title: fallback.title,
      pages: [fallback.body] // Put entire body as single page
    };
  }

  return { title, pages };
}

// --- MOCK data (development without API keys) ---
async function mockGenerateStory(childName = 'Alex') {
  await delay(2800);
  const name = childName || 'Alex'; // Use provided name or default
  return {
    title: `${name} and the Magic Garden`,
    body:
      `PAGE 1: ${name} saw a little gate behind some flowers. ${name} opened the gate. "Wow!" said ${name}. Inside was a pretty garden!\n\n` +
      `PAGE 2: The flowers were so bright! They looked like stars. A blue bird said, "Hi ${name}! We waited for you!" ${name} smiled big.\n\n` +
      `PAGE 3: ${name} walked in the garden. The roses giggled. The butterflies danced. But oh no! The rainbow was not there.\n\n` +
      `PAGE 4: "The rainbow needs help," said the bird. ${name} gave water to the flowers. ${name} helped a little vine. "I can help!" said ${name}.\n\n` +
      `PAGE 5: The rainbow came back! It was so pretty! Red, blue, yellow, and more! "You did it!" said all the friends. ${name} was so happy!\n\n` +
      `PAGE 6: ${name} goes to the garden every day now. ${name} knows that being kind makes magic happen. The End.`,
  };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
