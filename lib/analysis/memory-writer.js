/**
 * Memory Writer
 *
 * Formats extracted insights and writes them to memory files:
 * - memory/daily/YYYY-MM-DD.md - Daily session logs
 * - memory/MEMORY.md - Long-term learnings (curated)
 */

import fs from 'fs/promises';
import path from 'path';

export class MemoryWriter {
  constructor(options = {}) {
    this.basePath = options.basePath || process.cwd();
    this.memoryDir = path.join(this.basePath, 'memory');
    this.dailyDir = path.join(this.memoryDir, 'daily');
  }

  /**
   * Write insights to daily log
   */
  async writeDailyLog(insights) {
    const { sessionId, startTime, cwd, gitBranch, insights: data, metadata } = insights;

    // Ensure daily directory exists
    await fs.mkdir(this.dailyDir, { recursive: true });

    // Determine daily log file
    const date = new Date(startTime);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const dailyLogPath = path.join(this.dailyDir, `${dateStr}.md`);

    // Format entry
    const entry = this.formatDailyEntry(insights);

    // Append to daily log
    try {
      const existing = await fs.readFile(dailyLogPath, 'utf-8').catch(() => '');

      // Check if this session already logged
      if (existing.includes(sessionId)) {
        console.log(`[MemoryWriter] Session ${sessionId} already in daily log`);
        return dailyLogPath;
      }

      // Append new entry
      const updated = existing
        ? `${existing}\n\n${entry}`
        : this.formatDailyHeader(dateStr) + '\n\n' + entry;

      await fs.writeFile(dailyLogPath, updated, 'utf-8');
      console.log(`[MemoryWriter] Wrote to ${dailyLogPath}`);

      return dailyLogPath;
    } catch (err) {
      console.error('[MemoryWriter] Failed to write daily log:', err);
      throw err;
    }
  }

  /**
   * Format daily log header
   */
  formatDailyHeader(dateStr) {
    return `# Daily Log: ${dateStr}

> Autonomous session analysis and learnings`;
  }

  /**
   * Format daily entry
   */
  formatDailyEntry(insights) {
    const { sessionId, startTime, cwd, gitBranch, insights: data, metadata } = insights;

    const time = new Date(startTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    let entry = `## Session ${sessionId.substring(0, 8)} (${time})

**Summary:** ${data.summary}
**Duration:** ${metadata.durationFormatted}
**Location:** \`${cwd}\`
**Branch:** \`${gitBranch || 'unknown'}\`
**Activity:** ${metadata.messageCount} messages, ${metadata.filesModified} files modified`;

    if (metadata.errors > 0) {
      entry += `, ${metadata.errors} errors`;
    }

    // Technical learnings
    if (data.technicalLearnings.length > 0) {
      entry += '\n\n### Technical Learnings\n';
      data.technicalLearnings.forEach(learning => {
        entry += `- ${learning}\n`;
      });
    }

    // Skills developed
    if (data.skillsDeveloped.length > 0) {
      entry += '\n\n### Skills Developed\n';
      data.skillsDeveloped.forEach(skill => {
        entry += `- ${skill}\n`;
      });
    }

    // Mistakes and corrections
    if (data.mistakesAndCorrections.length > 0) {
      entry += '\n\n### Mistakes & Corrections\n';
      data.mistakesAndCorrections.forEach(item => {
        entry += `- **Mistake:** ${item.mistake}\n`;
        entry += `  - **Correction:** ${item.correction}\n`;
        entry += `  - **Lesson:** ${item.lesson}\n`;
      });
    }

    // Strategic decisions
    if (data.strategicDecisions.length > 0) {
      entry += '\n\n### Strategic Decisions\n';
      data.strategicDecisions.forEach(item => {
        entry += `- **Decision:** ${item.decision}\n`;
        entry += `  - **Rationale:** ${item.rationale}\n`;
        if (item.alternatives) {
          entry += `  - **Alternatives:** ${item.alternatives}\n`;
        }
      });
    }

    // Patterns
    if (data.patterns.length > 0) {
      entry += '\n\n### Patterns\n';
      data.patterns.forEach(pattern => {
        entry += `- ${pattern}\n`;
      });
    }

    return entry;
  }

  /**
   * Update MEMORY.md with significant learnings
   * (Only for truly significant insights)
   */
  async updateMemoryMd(insights) {
    const { insights: data } = insights;

    // Only update MEMORY.md for significant learnings
    const significantLearnings = [
      ...data.technicalLearnings.filter(l => this.isSignificant(l)),
      ...data.patterns.filter(p => this.isSignificant(p))
    ];

    if (significantLearnings.length === 0) {
      console.log('[MemoryWriter] No significant learnings for MEMORY.md');
      return null;
    }

    const memoryPath = path.join(this.memoryDir, 'MEMORY.md');

    try {
      const existing = await fs.readFile(memoryPath, 'utf-8').catch(() => null);

      if (!existing) {
        console.log('[MemoryWriter] MEMORY.md not found, skipping update');
        return null;
      }

      // TODO: Implement smart MEMORY.md updates
      // For now, just log that we would update it
      console.log('[MemoryWriter] Would update MEMORY.md with:');
      significantLearnings.forEach(l => console.log(`  - ${l}`));

      return memoryPath;
    } catch (err) {
      console.error('[MemoryWriter] Failed to update MEMORY.md:', err);
      return null;
    }
  }

  /**
   * Determine if a learning is significant enough for MEMORY.md
   */
  isSignificant(learning) {
    // Heuristics for significance:
    // - Mentions "never", "always", "critical"
    // - Contains specific patterns or anti-patterns
    // - Length > 50 chars (substantial insight)

    const keywords = ['never', 'always', 'critical', 'important', 'pattern', 'anti-pattern'];
    const hasKeyword = keywords.some(kw => learning.toLowerCase().includes(kw));
    const isSubstantial = learning.length > 50;

    return hasKeyword || isSubstantial;
  }

  /**
   * Get summary of what was written
   */
  getSummary(dailyLogPath, memoryPath) {
    return {
      dailyLog: dailyLogPath,
      memoryUpdated: !!memoryPath,
      timestamp: new Date().toISOString()
    };
  }
}
