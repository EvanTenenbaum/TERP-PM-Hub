import { drizzle } from 'drizzle-orm/mysql2';
import { pmItems } from '../drizzle/schema';
import * as fs from 'fs';

const DATABASE_URL = process.env.DATABASE_URL!;
const db = drizzle(DATABASE_URL);

async function populateDatabase() {
  console.log('📥 Loading TERP analysis...');
  
  const analysisData = JSON.parse(fs.readFileSync('/home/ubuntu/terp-full-analysis.json', 'utf-8'));
  
  console.log(`\n📊 Found:`);
  console.log(`   - ${analysisData.implemented_features.length} implemented features`);
  console.log(`   - ${analysisData.roadmap_items.length} roadmap items`);
  
  console.log('\n💾 Populating database...\n');
  
  let inserted = 0;
  
  // Insert implemented features
  for (const feature of analysisData.implemented_features) {
    try {
      await db.insert(pmItems).values({
        itemId: feature.id,
        type: 'FEAT',
        title: feature.title,
        description: feature.description,
        status: 'completed',
        priority: 'high',
        tags: JSON.stringify(['implemented', 'production']),
        metadata: JSON.stringify({
          features: feature.features,
          completedAt: feature.completed_at
        }),
        githubPath: `/TERP/client/src/pages/${feature.title.replace(/\s+/g, '')}.tsx`,
        createdAt: new Date(feature.created_at),
        updatedAt: new Date(feature.completed_at || feature.created_at)
      });
      
      console.log(`✅ ${feature.id}: ${feature.title}`);
      inserted++;
    } catch (error: any) {
      if (!error.message?.includes('Duplicate entry')) {
        console.error(`❌ Error: ${error.message}`);
      }
    }
  }
  
  // Insert roadmap items
  for (const item of analysisData.roadmap_items) {
    try {
      await db.insert(pmItems).values({
        itemId: item.id,
        type: 'FEAT',
        title: item.title,
        description: item.description,
        status: 'planned',
        priority: item.priority,
        tags: JSON.stringify(['roadmap', item.phase.toLowerCase().replace(/\s+/g, '-')]),
        metadata: JSON.stringify({ phase: item.phase }),
        githubPath: `/TERP/docs/roadmaps/defaults-implementation.md`,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.created_at)
      });
      
      console.log(`✅ ${item.id}: ${item.title}`);
      inserted++;
    } catch (error: any) {
      if (!error.message?.includes('Duplicate entry')) {
        console.error(`❌ Error: ${error.message}`);
      }
    }
  }
  
  console.log(`\n✨ Population complete! Inserted: ${inserted} items`);
  process.exit(0);
}

populateDatabase().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
