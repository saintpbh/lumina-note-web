
import { Sermon } from '@/shared/types';

export const getSampleSermons = (): Sermon[] => {
    const now = new Date().toISOString();

    return [
        {
            id: Date.now(), // We'll add offset when adding to ensure uniqueness
            title: "The Substance of Things Hoped For",
            content: `
        <h1>The Substance of Things Hoped For</h1>
        <p><strong>Scripture: Hebrews 11:1-6</strong></p>
        <hr />
        
        <h2>Introduction</h2>
        <p>My brothers and sisters, today we stand on the precipice of understanding one of the most profound mysteries of the Christian life: Faith. The writer of Hebrews gives us a definition that has echoed through the corridors of church history: <em>"Now faith is the substance of things hoped for, the evidence of things not seen."</em></p>
        <p>In a world that demands empirical evidence, in a culture that shouts "seeing is believing," the Kingdom of God whispers a different truth: <strong>Believing is seeing.</strong></p>

        <h2>1. Faith is Substance</h2>
        <p>Notice the word used here: <em>substance</em>. The Greek word is <em>hypostasis</em>. It means a setting under, a support, an essence, a concrete reality. Faith is not a wisp of smoke. It is not wishful thinking. It is not crossing your fingers and hoping for the best.</p>
        <p>No, faith is <strong>Substance</strong>. It is as real as the chair you sit in, as real as the ground beneath your feet. It is the spiritual bedrock upon which we build our lives. When everything around you is shaking, when the economy crumbles, when health fails, when relationships are strained—faith remains. It is the solid ground.</p>
        <blockquote>"Faith is the art of holding on to things your reason has once accepted, in spite of your changing moods." — C.S. Lewis</blockquote>

        <h2>2. Faith is Evidence</h2>
        <p>The text says faith is the <em>evidence</em> of things not seen. Think about a courtroom. Evidence is what proves the reality of something that the jury did not witness with their own eyes. Faith acts as that proof.</p>
        <p>How do we know God is good when life is hard? Faith is the evidence. How do we know heaven is real when we have not been there? Faith is the evidence. It is the conviction that convinces the soul of truths the eye cannot perceive.</p>
        <p>This is why without faith it is impossible to please God. Because without faith, we cannot even acknowledge His reality in the way He desires. We must believe that He is, and that He is a rewarder of those who diligently seek Him.</p>

        <h2>3. The Heroes of Faith</h2>
        <p>Hebrews 11 is often called the "Hall of Faith." It lists men and women who lived not by what they saw, but by what they believed.</p>
        <ul>
          <li><strong>Abel</strong> offered a better sacrifice.</li>
          <li><strong>Enoch</strong> walked with God and was no more.</li>
          <li><strong>Noah</strong> built an ark when there was no rain.</li>
          <li><strong>Abraham</strong> went out not knowing where he was going.</li>
        </ul>
        <p>They didn't have the full picture. They didn't have the complete Bible as we do. But they had faith. And that faith was counted to them as righteousness.</p>

        <h2>Conclusion</h2>
        <p>Dear friends, what are you hoping for today? A restored marriage? A prodigal child to return? Healing in your body? Peace in your mind?</p>
        <p>Let faith be the substance of that hope. Let it be the firm foundation you stand on. Do not look at the waves; look at the One who walks on the water. Do not look at the size of the giant; look at the size of your God.</p>
        <p>Let us go forth from this place, not walking by sight, but walking by faith. For the just shall live by faith.</p>
        <p><strong>Amen.</strong></p>
      `,
            created_at: now,
            updated_at: now,
            tags: "faith, hebrews, hope"
        },
        {
            id: Date.now() + 1,
            title: "The Greatest of These is Love",
            content: `
        <h1>The Greatest of These is Love</h1>
        <p><strong>Scripture: 1 Corinthians 13:1-13</strong></p>
        <hr />
        
        <h2>Introduction</h2>
        <p>We live in a world obsessed with greatness. Who looks the best? Who has the most money? Who has the most influence? Even in the church, we can become obsessed with gifts—with eloquence, with knowledge, with power.</p>
        <p>But the Apostle Paul stops the Corinthian church—and he stops us—in our tracks. He shows us a "more excellent way." He tells us that we can have it all, but if we don't have love, we have <strong>nothing</strong>.</p>

        <h2>1. The Priority of Love</h2>
        <p>Paul uses hyperbole to make his point. He says:</p>
        <ul>
          <li>If I speak with angelic tongues... but have not love, I am a noisy gong.</li>
          <li>If I have prophetic powers and understand all mysteries... but have not love, I am nothing.</li>
          <li>If I give away all I have... but have not love, I gain nothing.</li>
        </ul>
        <p>Do you hear the math of heaven? <strong>Everything minus Love equals Nothing.</strong> You can be the most talented preacher, the most generous donor, the most devoted volunteer. But if your heart is devoid of the <em>agape</em> love of God, it is empty noise.</p>

        <h2>2. The Practice of Love</h2>
        <p>Paul doesn't leave love in the abstract. He defines it by what it <em>does</em> and what it <em>does not</em> do. This is the practical application of love.</p>
        <p><em>"Love is patient and kind."</em></p>
        <p>How often are we impatient? We rush through people to get to tasks. We honk in traffic. We snap at our spouses. Love slows down. Love breathes. Love extends kindness when harshness is deserved.</p>
        <p><em>"Love does not envy or boast; it is not arrogant or rude."</em></p>
        <p>The ego is the enemy of love. Love dethrones the self and enthrones the other. It seeks not its own way.</p>

        <h2>3. The Permanence of Love</h2>
        <p>Prophecies will pass away. Tongues will cease. Knowledge will vanish away. Why? Because they are partial. We see in a mirror dimly.</p>
        <p>But love? <strong>Love never fails.</strong></p>
        <p>When we get to heaven, we won't need faith, because we will see Him face to face. We won't need hope, because we will have realized our inheritance. But we will always need love. Because God <em>is</em> love.</p>
        
        <h2>Conclusion</h2>
        <p>In the end, three things remain: Faith, Hope, and Love. But the greatest of these is Love.</p>
        <p>Today, examine your heart. Are you a noisy gong? Or are you a vessel of God's love? Let us commit to loving one another, not just in word or talk, but in deed and in truth.</p>
        <p><strong>Amen.</strong></p>
      `,
            created_at: now,
            updated_at: now,
            tags: "love, corinthians, relationships"
        },
        {
            id: Date.now() + 2,
            title: "A Future and a Hope",
            content: `
        <h1>A Future and a Hope</h1>
        <p><strong>Scripture: Jeremiah 29:11-14</strong></p>
        <hr />
        
        <h2>Introduction</h2>
        <p>There is perhaps no verse more quoted, placed on graduation cards, or hung on living room walls than Jeremiah 29:11. <em>"For I know the plans I have for you, declares the Lord..."</em></p>
        <p>It is a beautiful promise. But to understand its depth, we must understand its context. This wasn't written to people living in ease and comfort. It was written to exiles. To refugees. To people who had lost their homes, their temple, and their identity.</p>

        <h2>1. The Context of Exile</h2>
        <p>God's people were in Babylon. They were weeping by the rivers (Psalm 137). They were asking, "Has God forgotten us? Is this the end?"</p>
        <p>And into that darkness, God sends a letter through Jeremiah. He tells them something shocking: <strong>Plant gardens. Build houses. Marry and have children. Seek the welfare of the city where I have sent you.</strong></p>
        <p>God was saying: "You're going to be here for a while (70 years). But don't give up. Don't check out. Bloom where you are planted."</p>

        <h2>2. The Character of the Plans</h2>
        <p><em>"Plans for welfare and not for evil, to give you a future and a hope."</em></p>
        <p>The word for "welfare" or "peace" here is <strong>Shalom</strong>. It means wholeness, completeness, flourishing. God's plan for His people—even in exile, even in discipline—is ultimately for their Shalom.</p>
        <p>Sometimes it looks like disaster. Sometimes it looks like a setback. But Romans 8:28 reminds us that God causes all things to work together for good. His plans are not accidental. They are intentional. "I know the plans I have for you." He knows them, even when we don't.</p>

        <h2>3. The Call to Seek</h2>
        <p>Verse 12 continues: <em>"Then you will call upon me and come and pray to me, and I will hear you. You will seek me and find me, when you seek me with all your heart."</em></p>
        <p>The promise of the future is tied to the pursuit of the Present One. God wants our hearts. He doesn't just want to give us a good future; He wants to give us Himself.</p>
        <p>Seeking with "all your heart" means a desperate dependence. It means prioritizing His presence above His presents.</p>

        <h2>Conclusion</h2>
        <p>Where do you feel exiled today? Are you in a job you hate? A season of loneliness? A period of waiting?</p>
        <p>Hear the word of the Lord: He has not forgotten you. He has a plan. It is a plan for your good. It is a plan for a future and a hope.</p>
        <p>Do not despair. Plant your gardens. Pray for your city. And seek His face. The best is yet to come.</p>
        <p><strong>Amen.</strong></p>
      `,
            created_at: now,
            updated_at: now,
            tags: "hope, jeremiah, future, trust"
        }
    ];
};
