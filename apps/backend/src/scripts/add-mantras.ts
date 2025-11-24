/**
 * ADD MANTRAS SCRIPT
 * Adds new mantras to the database with duplicate protection.
 * Run: npx tsx src/scripts/add-mantras.ts (from backend folder)
 * 
 * Prerequisites: Admin user must exist (run seed.ts first if needed)
 */

import 'dotenv/config';
import { UserModel } from '../models/user.model';
import { MantraModel } from '../models/mantra.model';
import { db } from '../db';

// Mantra data array
const MANTRAS = [
  {
    title: "Sometimes it's better to pay for parking",
    key_takeaway: "Every moment is a choice: the pill of stress, or the pill of peace. Choose peace. Choose presence. Choose joy.",
    background_author: null,
    background_description: null,
    jamie_take: `Ask yourself, how much would you pay to be free from the anxiety and distraction of wondering whether you'll get a ticket?

Or, how much is your time worth while you're at the event?

It becomes especially clear when the cost of the ticket to attend the event outweighs the price of parking.

Here's another way to look at it:

If you could buy a pill before the event that would make you happier, more relaxed and less stressed that had no side-effects would you take it?

Worrying about parking is like taking the opposite pill: one that makes you anxious and distracted. You're reinforcing the anxious thought and strengthening the cycle of worry.

So, how much did you say you'd pay for the good pill? Whatever that number is, that's how much your peace of mind around parking is worth.

So use this mantra to identify what's distracting you from being present. What's stealing the joy for you? Once identified, "pay for parking" whether that's actually buying a parking ticket or some other act that frees your mind and conscience doesn't matter. What's important is that you do it.

Use this mantra in scenarios beyond parking to help you appreciate the moment:

• Letting go of the need to be right
• Clearing the air with someone (or offering an apology)
• Forgiving (since holding a grudge only steals your joy)
• Arriving early (definitely not my strength!)
• Avoiding cheating or lying

CBT teaches us that our thoughts shape our emotions. When you shift your focus, you shift your feelings.`,
    when_where: `Everyday Life: Choose ease over hassle. Pay for peace, not stress.

Relationships: Let go faster. Apologize or forgive to free yourself.

Work + Productivity: Don't overcomplicate. Buy back time and clarity.

Health + Well-Being: Slow down: Do what supports calm and presence.

Experiences: Be here. Protect the joy of the moment.`,
    negative_thoughts: `"I should save the money, even if it stresses me out." → My peace has value.

"I don't want to give in first." → Connection matters more than being right.

"I'll just push through, it doesn't matter." → How I feel does matter.

"I don't have time to slow down." → Rushing steals the moment.

"I'll deal with this later." → Doing it now frees my mind.

"This resentment is justified." → Holding it costs me the most.

"If I worry about it, I'll prevent the problem." → Worry doesn't protect me — presence does.`,
    cbt_principles: `Cognitive Reframing (Restructuring): We often magnify small stressors (like worrying about a parking ticket) into sources of anxiety. By reframing, we change the meaning of the situation.

Cost-Benefit Analysis: When stuck in rumination or worry, therapists often ask clients to weigh the actual cost of stress vs. the benefit of letting go. The mantra is exposing an unhelpful thought pattern.

Mantras as Cognitive Anchors: Repeating simple, rational statements helps override automatic negative thoughts.

Mindfulness Integration in CBT (MBCT): Mindfulness-based CBT emphasizes staying in the present moment rather than attaching to "what if" thoughts.`,
    references: 'Beck, J. S. (2011). Cognitive Behavior Therapy: Basics and Beyond. Greenberger, D., & Padesky, C. A. (2016). Mind Over Mood. Kabat-Zinn, J. (2003). Mindfulness-based interventions in context. Clinical Psychology: Science and Practice, 10(2), 144–156.',
  },
  {
    title: 'Give people an excuse that has nothing to do with you',
    key_takeaway: "Giving people an excuse isn't about letting them off the hook. It's about freeing yourself. By refusing to make their actions about you, you protect your own peace of mind.",
    background_author: null,
    background_description: null,
    jamie_take: `When someone wrongs you or does something you disagree with, blaming them and judging them as "bad" will make you feel self righteous or good in the moment, but it only hurts you in the long run.

Why? Because blame fuels negativity. You end up carrying resentment, anger, or even thoughts of revenge, which leaves you stuck in suffering.

Holding on to negativity can harm your health, raising stress and affecting mental well-being. The distraction or dampened attitude can also damage your relationships with individuals that weren't involved in the original offense.

Additionally, it primes you to notice injustices everywhere. Similar to how a pregnant woman suddenly notices every other pregnant woman. Once you're tuned in to notice each offense, you keep finding it in situations you might not have otherwise noticed.

We've all experienced this: a stranger honks or yells at you in traffic. Hours later, you're still on edge, bracing for the next attack and hyper alert to whether your behavior is socially acceptable. All this anxiety stemming from a situation in which you may have done nothing wrong.

The best way to escape this trap is simple: give them an excuse that has nothing to do with you! Remove yourself from the equation. Realize they would have acted that way toward anyone.

Examples:

When you've made a mistake: You told your friend the wrong date for the party, and she is furious. You apologize, but she stays angry. Naturally, you feel bad and are distracted in your daily life. At some point, it's out of your hands. If she wants to stay upset, give her an excuse that has nothing to do with you. "She missed the party last year too, so was already sensitive, but I've done what I can. This is about her feelings, not my worth."

When your feelings are hurt: You send a thoughtful gift or thank-you note and your friend never acknowledges your act of kindness. You might think, "They don't care enough about me to respond," which could bring up feelings of low self-esteem and resentment. Or you could say, "They probably meant to reply but got busy, and by the time they remembered, too much time had passed." Suddenly, the sting is gone.

When their choices frustrate you: A friend mismanages her finances. Instead of seeing her as careless, you might recognize that she learned unhealthy patterns from her parents or upbringing. The same goes for public figures: you can interpret a politician's decision as deliberately harmful, or you can see it as a sincerely held (even if flawed) belief about what's best. One view fills you with anger; the other leaves you with peace.`,
    when_where: `Everyday Life:
• Someone cuts you off in traffic → Not about me.
• A cashier or stranger is rude → They're stressed, I don't need to hold it.

Relationships:
• Your partner snaps or seems distant → Their mood, not my worth.
• A friend replies late or forgets plans → They're juggling things; it's not personal.

Work:
• Blunt email or short tone → They're rushing, not attacking.
• Someone takes credit or doesn't acknowledge you → Their insecurity, not my value.

Social & Emotional Moments:
• You feel judged or overlooked → Their reaction is shaped by their world, not mine.
• Someone criticizes your choices → They speak from their experience, not my identity.

Bigger Context:
• You disagree with decisions from leaders, coworkers, or family → They are acting from their own belief system—not in response to me.`,
    negative_thoughts: `Self-Blame: "It's my fault." → "This isn't about me."

Personalization: "They don't care about me." → "They would act this way with anyone."

Judgment & Blame: "They're selfish/rude." → "They act from their own stress and history."

Resentment & Rumination: "I can't let this go." → "I don't need to carry it."

Low Self-Worth: "I'm not important." → "Their behavior isn't a reflection of my value."`,
    cbt_principles: `Cognitive Reframing: By "giving people an excuse that has nothing to do with you," you're actively reframing the situation. Instead of interpreting someone's behavior as personal (→ "they don't respect me"), you reinterpret it in a way that's less threatening (→ "they were stressed or distracted; this isn't about me").

Personalization & Cognitive Distortions: The mantra directly challenges personalization. By giving them an excuse outside of yourself, you avoid falling into distorted thinking.

Stress Reduction & Emotional Regulation: By excusing others' actions (in a non-self-blaming way), you short-circuit the cycle of rumination, reducing stress and promoting emotional balance.

Behavioral Consequences: By shifting perspective, you preserve relationships and avoid unnecessary conflict.`,
    references: 'Research shows cognitive reappraisal lowers emotional distress and improves resilience (Gross, 2002; Aldao et al., 2010). Research shows cognitive reappraisal lowers emotional distress and improves resilience (Gross, 2002; Aldao et al., 2010). Studies show that reappraising others\' behavior in less personal ways reduces anger and physiological stress (Ray et al., 2008). Beck\'s model of depression highlights personalization as a key thinking trap that fuels negative mood and self-esteem problems (Beck, 1979).',
  },
  {
    title: 'I am healthy, my favourite people are healthy. Inhale deep. Exhale slow.',
    key_takeaway: "This mantra helps calm racing thoughts by combining mindful breathing with a CBT-based shift of attention toward gratitude for health (yours and your loved ones'), which research shows reduces stress and builds resilience.",
    background_author: null,
    background_description: null,
    jamie_take: `This mantra is a powerful tool when your mind is spinning… when your thoughts race or negativity takes over.

Why does it work?

It brings your attention back to what truly matters.

At the core to a good life is health - your own and that of the people you love.

For example:

You might be focused on a promotion, a new car or an important tournament. But the moment your health falters (you can't walk without pain or you discover a tumor) nothing else matters.

The same is true when a loved one is hospitalized; suddenly, everything else fades into the background.

The challenge is that when we are healthy, we often take it for granted. Our daily stresses distract us from how good life really is.

That's what makes this mantra so grounding.

It is effective in moments of stress or distraction, but is also effective when you are healthy. It's a reminder that well-being (yours and your loved ones') is the foundation to happiness and that life is much better when you're healthy.

With this mantra, your daily concerns tend to fade away, leaving space for gratitude and peace, even if it is just for a moment.`,
    when_where: `Everyday Life: stuck in traffic, running late, feel annoyed by small inconveniences or are comparing your life to others

Relationships: a conversation or disagreement feels tense, you're assuming the worst, or worrying about someone

Work + Productivity: feel overwhelmed, frustrated about progress or you're overthinking

Health + Well-Being: feeling anxious, stressed, before or after appointments

Experiences: something doesn't go exactly as planned, you're trying to be perfect, you want to be more present and appreciate the moment.`,
    negative_thoughts: `Catastrophizing - "This is a disaster."

Comparison spirals - "Everyone else is doing better than me."

Outcome obsession - "This has to turn out perfectly."

Control thinking - "I need to fix everything right now."

Pressure + urgency mode - "I can't slow down — I'll fall behind."

Self-judgment - "What's wrong with me?"`,
    cbt_principles: `Attention Training (Shifting Focus): In CBT, we learn that where attention goes, emotion follows. The mantra acts as a cue to break rumination and reorient attention toward gratitude and core values.

Cognitive Reframing: CBT encourages challenging automatic thoughts by putting them in perspective. The mantra reframes daily stressors as less significant when contrasted with the importance of health, creating a healthier cognitive perspective.

Mindful Breathing Integration: "Inhale deep – exhale slow" ties into CBT-informed relaxation strategies. Slow breathing activates the parasympathetic nervous system, reducing physiological arousal associated with anxiety and stress. Pairing a thought ("I am healthy… my favourite people are healthy") with a calming breath strengthens both cognitive and physiological regulation.

Gratitude Practice (Behavioral Activation): CBT often incorporates gratitude journaling or exercises as part of behavioral activation. Repeating this mantra builds an automatic habit of recognizing health as a present gift, which is linked to improved mood and resilience.`,
    references: 'Beck, J. S. (2011). Cognitive Behavior Therapy: Basics and Beyond. Explains how shifting attention and reframing thoughts reduces distress. Clark, D. A., & Beck, A. T. (2010). Cognitive Therapy of Anxiety Disorders. Highlights how redirecting focus from worry to present-oriented, constructive thoughts can reduce anxiety. Bohlmeijer, E., et al. (2017). "The effects of positive psychology interventions on well-being and distress." Clinical Psychology Review. Shows gratitude-based practices (like focusing on health and loved ones) improve well-being. Hofmann, S. G., et al. (2010). "The effect of mindfulness-based therapy on anxiety and depression." Journal of Consulting and Clinical Psychology. Evidence that mindfulness + breathing practices reduce stress and improve regulation.',
  },
  {
    title: 'When life feels good, take a deep breath and notice something - get absorbed in the feelings and emotions that come up',
    key_takeaway: 'By pausing to breathe and to notice when life feels good, you train your mind to step out of worry and rumination, anchor in the present, and fully savor positive experiences.',
    background_author: null,
    background_description: null,
    jamie_take: `Do you think this moment is good or bad? The truth is: this moment is as good as any moment could be.

We often carry myths about what makes a moment great. These two myths are especially true for me:

• I have to be with other people for it to be great
• I have to be at my peak performance to truly enjoy it.

But, many of our most cherished memories feel like they flew by. Sometimes we wonder if we truly appreciated a moment that we describe as one of our greatest.

The challenge is that there's no single, "correct" way to experience a moment. It's subjective and thus we get to decide how. But In most cases, we don't decide at all. Instead, the moment just happens and we look back and wonder as to whether or not we truly enjoyed it.

Brainstorming prompt: What does it mean to live in and appreciate a moment in your life? Come up with a few examples.

Often, our memory of a moment convinces us we were present, when in reality we were stuck in the future or the past. Don't be discouraged. This is not a "bad" way to live, it's just not living in the present moment.

Future: Living in the future means imagining a scenario that hasn't happened yet. For example: you think "I'm going to make pizza for dinner tonight." Suddenly your mind drifts ahead and you see yourself grating cheese, rolling the dough, preheating the oven. In that moment, you're no longer experiencing what you are physically doing.

Past: Living in the past means replaying a scenario that already happened. For example: rehearsing the dialogue from an argument, or reliving the feeling of scoring a goal. Again, your attention has left the present.

Living in the present means paying attention to what we are feeling or sensing, right here, right now. Here are some techniques:

• Heightening your awareness of any one of your five senses (sight, sound, touch, smell, taste).
• Noticing what you are feeling
• Noticing what emotional state you are in
• Being aware of what is happening. In other words, consciously appreciating the events as they take place rather than being so absorbed that they pass by unnoticed.

A note on flow: We can still appreciate a moment while in flow. When in a state of flow, you are so absorbed that you don't feel or notice that much. At the same time though, you are not living in the future or the past. This being said, flow is a different way of appreciating a moment than what we are trying to achieve with the above mantra.`,
    when_where: `Everyday Life: when noticing a moment that feels nice or you realize you're rushing through your day without feeling anything.

Relationships: when you're laughing with someone you care about or you notice a moment of closeness, kindness, or warmth.

Work or Productivity: when feeling a small sense of accomplishment or are in a good conversation, collaboration, or creative flow.

Health & Well-Being: when your body feels good or you catch yourself feeling calm, balanced, or steady.

Experiences: during moments of beauty or awe or you realize this is one of those moments you'll want to remember.`,
    negative_thoughts: `"This moment isn't special enough." → This moment is worth noticing.

"I'll enjoy life later when things are better." → I can enjoy what feels good right now.

"I need to be achieving or performing to feel good." → I'm allowed to just experience and feel.

"If I don't hold onto this, I'll lose it." → I can let the moment unfold without gripping it.

"Good moments slip by before I even notice them." → I can pause and take this in, on purpose.`,
    cbt_principles: `Cognitive Distortions and Time Orientation: CBT highlights how unhelpful thinking patterns — like worry (future-focused) and rumination (past-focused) — fuel anxiety and depression. They pull attention away from the present moment and keep people "stuck in their heads" rather than engaged with life. This mantra helps break this cycle by using the breath as an anchor, pulling your attention back from past/future loops into the now.

Mindfulness as a CBT Tool: Modern CBT approaches use mindfulness to train people to anchor attention in the present. Practicing mindful awareness of sensations, emotions, and thoughts reduces relapse in depression, lowers stress, and improves emotional regulation. This mantra mirrors this — it prompts you to notice your feelings and senses in real time, which is mindfulness in action.

Behavioral Activation and Enjoyment: CBT encourages engaging in activities that generate positive reinforcement and emotional well-being. By deliberately pausing to notice pleasure when life "feels good," you reinforce positive experiences in memory. This strengthens resilience and counters the brain's natural negativity bias. This mantra builds this positive reinforcement loop by teaching you to pause and savor enjoyable experiences as they happen.

Self-Regulation and Flow: Attention training — focusing on what you're feeling right now — builds self-regulation. Studies show that this kind of present-moment focus increases well-being and reduces stress, because it prevents the spiral into "what-if" thinking or regret. This mantra is a self-regulation tool — each deep breath and moment of noticing strengthens your ability to direct your focus toward what matters now.`,
    references: 'Nolen-Hoeksema (2000); Watkins (2008): Rumination (past-focused) and worry (future-focused) are core thinking patterns that maintain anxiety and depression. Segal, Williams, & Teasdale (2018): Mindfulness-Based Cognitive Therapy (MBCT) shows that anchoring attention in the present reduces relapse in depression and improves emotional regulation. Beck (2011): CBT emphasizes behavioral activation — engaging in and savoring positive activities helps counter the brain\'s negativity bias. Kabat-Zinn (2003): Mindfulness training builds self-regulation, stress reduction, and present-moment awareness.',
  },
];

async function addMantras() {
  console.log('Starting mantra addition script...\n');

  try {
    // Step 1: Check for admin user
    console.log('Checking for admin user...');
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@memantra.com';
    const admin = await UserModel.findByEmail(adminEmail);

    if (!admin) {
      throw new Error(
        `Admin user not found with email: ${adminEmail}\nPlease run seed.ts first to create the admin user.`
      );
    }

    console.log(`Admin found: ${admin.username} (ID: ${admin.user_id})\n`);

    // Step 2: Process each mantra
    let addedCount = 0;
    let skippedCount = 0;

    console.log(`Processing ${MANTRAS.length} mantras...\n`);

    for (let i = 0; i < MANTRAS.length; i++) {
      const mantraData = MANTRAS[i];
      const mantraNumber = i + 1;

      console.log(`${mantraNumber}. "${mantraData.title}"`);

      // Check if mantra already exists
      const existingMantra = await db
        .selectFrom('Mantra')
        .where('title', '=', mantraData.title)
        .selectAll()
        .executeTakeFirst();

      if (existingMantra) {
        console.log(`   Status: Already exists (ID: ${existingMantra.mantra_id})`);
        console.log(`   Skipped.\n`);
        skippedCount++;
        continue;
      }

      // Create new mantra
      const newMantra = await MantraModel.create({
        title: mantraData.title,
        key_takeaway: mantraData.key_takeaway,
        background_author: mantraData.background_author,
        background_description: mantraData.background_description,
        jamie_take: mantraData.jamie_take,
        when_where: mantraData.when_where,
        negative_thoughts: mantraData.negative_thoughts,
        cbt_principles: mantraData.cbt_principles,
        references: mantraData.references,
        created_by: admin.user_id,
        is_active: true,
      });

      console.log(`   Status: Created successfully (ID: ${newMantra.mantra_id})`);
      console.log(`   Added.\n`);
      addedCount++;
    }


    // Step 4: Verify total mantras in database
    console.log('Current mantras in database:\n');
    const allMantras = await MantraModel.findAll();
    
    allMantras.forEach((mantra, index) => {
      console.log(`  ${index + 1}. ${mantra.title}`);
    });
    
    console.log(`\nTotal: ${allMantras.length} mantras\n`);

    console.log('Mantra addition completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\nScript failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  addMantras();
}

export { addMantras };

