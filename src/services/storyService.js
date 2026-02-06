/**
 * Story Generation Service
 *
 * Architecture
 * ============
 *   Story text  →  OpenAI gpt-4o-mini   (cloud API)
 *   Story image →  Z-Image-Turbo        (self-hosted on AWS EC2, saves to S3)
 *
 * Setup (dev only — keys in code)
 * ================================
 *   OPENAI_API_KEY   →  https://platform.openai.com/api-keys
 *   AWS_IMAGE_ENDPOINT  →  http://<your-ec2-public-ip>:8000
 *                          (paste once you've deployed the Z-Image Docker container)
 *
 * ⚠️  SECURITY: For production, proxy both calls through a backend
 *     so keys / internal URLs never ship in the app bundle.
 */

// ============================================================
// CONFIG  —  replace with your real values (dev only!)
// ============================================================
const OPENAI_API_KEY = 'sk-...';           // TODO: your OpenAI key
const AWS_IMAGE_ENDPOINT = 'http://...';   // TODO: http://<ec2-ip>:8000

// ============================================================
// TEXT GENERATION — OpenAI GPT
// ============================================================
export async function generateStoryText(userPrompt) {
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
          content:
            "You are a warm, imaginative children's story writer for ages 3–8. " +
            'Write stories that are 250–350 words, have a gentle positive message, ' +
            'and feel magical and adventurous. ' +
            'Output: first line is the title, then a blank line, then the story body. ' +
            'No markdown formatting.',
        },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 600,
      temperature: 0.85,
    }),
  });

  if (!response.ok) throw new Error('OpenAI text generation failed');
  const data = await response.json();
  return data.choices[0].message.content;
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
export async function createStory(childPhotoUri, userPrompt) {
  const id = `story_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  // Use real APIs when both keys are set, otherwise fall back to mock
  const keysReady =
    OPENAI_API_KEY && OPENAI_API_KEY !== 'sk-...' &&
    AWS_IMAGE_ENDPOINT && AWS_IMAGE_ENDPOINT !== 'http://...';

  if (keysReady) {
    const rawText = await generateStoryText(userPrompt);
    const { title, body } = parseStoryText(rawText);

    // Z-Image on AWS returns a permanent S3 URL — no download needed
    const illustrationUrl = await generateStoryImage(title, body.slice(0, 150));

    return {
      id,
      title,
      body,
      childPhotoUri,
      illustrationUrl,
      prompt: userPrompt,
      createdAt: new Date().toISOString(),
    };
  }

  // --- MOCK (no API key needed) ---
  const { title, body } = await mockGenerateStory();
  return {
    id,
    title,
    body,
    childPhotoUri,
    illustrationUrl: null,
    prompt: userPrompt,
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

// --- MOCK data (development without API keys) ---
async function mockGenerateStory() {
  await delay(2800);
  return {
    title: 'The Magical Garden',
    body:
      'Once upon a time, in a valley kissed by golden sunlight, there lived a curious little girl named Lily.\n\n' +
      'One morning, while exploring the woods behind her cottage, Lily stumbled upon a tiny gate hidden beneath a curtain of ivy. She pushed it open and stepped into the most beautiful garden she had ever seen.\n\n' +
      'Flowers of every color swayed and hummed soft melodies. A friendly ladybug landed on her finger and whispered, "Welcome, Lily! We\'ve been waiting for someone with a kind heart."\n\n' +
      'Lily spent the whole afternoon learning the garden\'s secrets — how the roses told jokes, how the butterflies painted rainbows in the sky, and how the pond reflected not just her face, but her dreams.\n\n' +
      'As the sun began to set, painting everything in shades of pink and gold, Lily promised the garden she would return.\n\n' +
      'And she did — every single day — because she had learned the most wonderful secret of all: the most magical places are the ones you discover with an open heart.\n\n' +
      'The End.',
  };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
