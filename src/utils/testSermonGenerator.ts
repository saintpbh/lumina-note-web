import { Sermon } from '@/shared/types';

/**
 * Generate test sermons for performance testing
 */

const SERMON_TITLES = [
    'Faith and Works',
    'The Grace of God',
    'Walking in the Spirit',
    'The Power of Prayer',
    'Living by Faith',
    'God\'s Sovereignty',
    'The Love of Christ',
    'Renewing Your Mind',
    'The Gospel Truth',
    'Hope in Trials',
    'The Kingdom of God',
    'Spiritual Warfare',
    'Christian Unity',
    'The Fruit of the Spirit',
    'God\'s Promises',
    'Eternal Life',
    'The Cross of Christ',
    'Forgiveness and Mercy',
    'The Holy Spirit',
    'Sanctification',
    'Justification by Faith',
    'The Character of God',
    'Worship in Spirit and Truth',
    'The Church',
    'The Great Commission',
    'Stewardship',
    'Gratitude and Thanksgiving',
    'Wisdom from Above',
    'The Fear of the Lord',
    'Redemption',
];

const SCRIPTURE_REFS = [
    'John 3:16',
    'Romans 8:28',
    'Philippians 4:13',
    'Psalm 23',
    '1 Corinthians 13',
    'Matthew 5:1-12',
    'Ephesians 2:8-9',
    'James 2:14-26',
    'Galatians 5:22-23',
    'Hebrews 11:1',
    'Genesis 1:1',
    'Revelation 21:1-5',
    'Isaiah 53',
    '2 Timothy 3:16',
    'Proverbs 3:5-6',
    'Matthew 28:19-20',
    'Acts 2:38',
    'Romans 12:1-2',
    '1 John 4:7-8',
    'Colossians 3:1-4',
];

const TAGS = [
    'faith',
    'grace',
    'love',
    'hope',
    'prayer',
    'worship',
    'holiness',
    'salvation',
    'redemption',
    'sanctification',
    'justification',
    'evangelism',
    'discipleship',
    'service',
    'stewardship',
    'wisdom',
    'courage',
    'perseverance',
    'joy',
    'peace',
];

const SERMON_CONTENT_TEMPLATES = [
    '<h1>{title}</h1><p>Scripture: {scripture}</p><p>Introduction: Today we explore the profound truth about {theme}.</p><p>Point 1: The biblical foundation of {theme} is found in God\'s Word.</p><p>Point 2: We must apply {theme} to our daily lives.</p><p>Point 3: The transformative power of {theme} changes everything.</p><p>Conclusion: Let us walk in the light of {theme}.</p>',
    '<h1>{title}</h1><p>Text: {scripture}</p><p>As we gather today, let us consider the importance of {theme} in our Christian walk.</p><p>First, we see that {theme} is essential for spiritual growth.</p><p>Second, {theme} equips us for service.</p><p>Third, {theme} brings glory to God.</p><p>May we embrace {theme} wholeheartedly.</p>',
    '<h1>{title}</h1><p>Reading: {scripture}</p><p>The Word of God teaches us about {theme}.</p><p>I. Understanding {theme}</p><p>II. Practicing {theme}</p><p>III. Sharing {theme}</p><p>Let us commit ourselves to {theme}.</p>',
];

function generateRandomContent(title: string, scripture: string, theme: string): string {
    const template = SERMON_CONTENT_TEMPLATES[Math.floor(Math.random() * SERMON_CONTENT_TEMPLATES.length)];
    return template
        .replace(/{title}/g, title)
        .replace(/{scripture}/g, scripture)
        .replace(/{theme}/g, theme.toLowerCase());
}

function getRandomItems<T>(arr: T[], count: number): T[] {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

export function generateTestSermons(count: number = 1000): Sermon[] {
    console.log(`Generating ${count} test sermons...`);
    const startTime = performance.now();

    const sermons: Sermon[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
        const title = SERMON_TITLES[i % SERMON_TITLES.length] +
            (i >= SERMON_TITLES.length ? ` (Part ${Math.floor(i / SERMON_TITLES.length) + 1})` : '');
        const scripture = SCRIPTURE_REFS[i % SCRIPTURE_REFS.length];
        const theme = TAGS[Math.floor(Math.random() * TAGS.length)];
        const selectedTags = getRandomItems(TAGS, Math.floor(Math.random() * 3) + 1).join(', ');

        // Distribute dates over the past 3 years
        const daysAgo = Math.floor(Math.random() * (365 * 3));
        const createdDate = new Date(now - (daysAgo * 24 * 60 * 60 * 1000));

        sermons.push({
            id: i + 1000, // Start from 1000 to avoid conflicts with real sermons
            title,
            content: generateRandomContent(title, scripture, theme),
            created_at: createdDate.toISOString(),
            updated_at: createdDate.toISOString(),
            passage: scripture,
            theme: theme,
            tags: selectedTags
        });
    }

    const endTime = performance.now();
    console.log(`✅ Generated ${count} sermons in ${(endTime - startTime).toFixed(2)}ms`);

    return sermons;
}

// Generate a smaller set for quick testing
export function generateSmallTestSet(): Sermon[] {
    return generateTestSermons(50);
}

// Generate medium set
export function generateMediumTestSet(): Sermon[] {
    return generateTestSermons(250);
}

// Generate large set for stress testing
export function generateLargeTestSet(): Sermon[] {
    return generateTestSermons(1000);
}

// Generate extra large set
export function generateExtraLargeTestSet(): Sermon[] {
    return generateTestSermons(5000);
}
