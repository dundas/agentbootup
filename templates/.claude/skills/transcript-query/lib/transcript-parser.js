/**
 * Transcript Parser
 *
 * Parses Claude Code .jsonl transcript files and extracts structured data
 * for querying and analysis.
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export class TranscriptParser {
  constructor() {
    this.projectsDir = path.join(os.homedir(), '.claude', 'projects');
  }

  /**
   * Parse a transcript file
   */
  async parseTranscript(transcriptPath) {
    const content = await fs.readFile(transcriptPath, 'utf-8');
    const lines = content.split('\n').filter(Boolean);

    const events = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch (err) {
        console.error(`Failed to parse line: ${line.substring(0, 100)}`);
        return null;
      }
    }).filter(Boolean);

    return this.extractStructuredData(events);
  }

  /**
   * Extract structured data from events
   */
  extractStructuredData(events) {
    const data = {
      sessionId: null,
      startTime: null,
      endTime: null,
      cwd: null,
      gitBranch: null,
      messages: [],
      toolUses: [],
      filesModified: [],
      tasks: [],
      errors: [],
      summary: null
    };

    for (const event of events) {
      // Extract session metadata
      if (event.sessionId && !data.sessionId) {
        data.sessionId = event.sessionId;
      }
      if (event.cwd && !data.cwd) {
        data.cwd = event.cwd;
      }
      if (event.gitBranch && !data.gitBranch) {
        data.gitBranch = event.gitBranch;
      }
      if (event.timestamp) {
        if (!data.startTime || event.timestamp < data.startTime) {
          data.startTime = event.timestamp;
        }
        if (!data.endTime || event.timestamp > data.endTime) {
          data.endTime = event.timestamp;
        }
      }

      // Extract messages
      if (event.type === 'user' && event.message) {
        // Handle both string and object content
        const content = typeof event.message.content === 'string'
          ? event.message.content
          : JSON.stringify(event.message.content);

        data.messages.push({
          type: 'user',
          content,
          timestamp: event.timestamp,
          uuid: event.uuid
        });
      } else if (event.type === 'assistant' && event.message) {
        // Handle array of content blocks or string
        let textContent;
        if (Array.isArray(event.message.content)) {
          textContent = event.message.content
            ?.filter(c => c.type === 'text')
            ?.map(c => c.text)
            ?.join('\n');
        } else if (typeof event.message.content === 'string') {
          textContent = event.message.content;
        }

        if (textContent) {
          data.messages.push({
            type: 'assistant',
            content: textContent,
            timestamp: event.timestamp,
            uuid: event.uuid
          });
        }
      }

      // Extract tool uses
      if (event.type === 'tool_use') {
        data.toolUses.push({
          tool: event.tool,
          parameters: event.parameters,
          timestamp: event.timestamp
        });
      }

      // Extract file modifications (from Edit, Write tools)
      if (event.type === 'tool_result' && event.toolName) {
        if (['Edit', 'Write'].includes(event.toolName) && event.result?.file_path) {
          data.filesModified.push({
            path: event.result.file_path,
            action: event.toolName,
            timestamp: event.timestamp
          });
        }
      }

      // Extract errors
      if (event.type === 'error' || (event.result && event.result.error)) {
        data.errors.push({
          message: event.error || event.result.error,
          timestamp: event.timestamp
        });
      }
    }

    // Generate summary
    data.summary = this.generateSummary(data);

    return data;
  }

  /**
   * Generate a summary of the session
   */
  generateSummary(data) {
    const userMessages = data.messages.filter(m => m.type === 'user');
    const duration = data.endTime && data.startTime
      ? new Date(data.endTime) - new Date(data.startTime)
      : 0;

    return {
      messageCount: data.messages.length,
      userMessageCount: userMessages.length,
      toolUseCount: data.toolUses.length,
      filesModifiedCount: data.filesModified.length,
      errorCount: data.errors.length,
      durationMs: duration,
      durationFormatted: this.formatDuration(duration)
    };
  }

  /**
   * Format duration in human-readable form
   */
  formatDuration(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(' ');
  }

  /**
   * Search messages by keyword
   */
  searchMessages(data, keyword) {
    const lowerKeyword = keyword.toLowerCase();
    return data.messages.filter(m =>
      m.content.toLowerCase().includes(lowerKeyword)
    );
  }

  /**
   * Find context before a specific message
   */
  findContextBefore(data, targetMessage, contextLines = 5) {
    const index = data.messages.findIndex(m =>
      m.content.includes(targetMessage)
    );

    if (index === -1) return null;

    const start = Math.max(0, index - contextLines);
    return {
      contextMessages: data.messages.slice(start, index),
      targetMessage: data.messages[index],
      followingMessages: data.messages.slice(index + 1, index + contextLines + 1)
    };
  }

  /**
   * List all transcripts for a project
   */
  async listTranscripts(projectPath) {
    // Normalize project path to match .claude/projects directory structure
    // /Users/foo/project -> -Users-foo-project
    const normalizedPath = projectPath.replace(/\//g, '-');
    const projectDir = path.join(this.projectsDir, normalizedPath);

    try {
      const files = await fs.readdir(projectDir);
      const transcripts = files
        .filter(f => f.endsWith('.jsonl'))
        .map(f => ({
          path: path.join(projectDir, f),
          sessionId: f.replace('.jsonl', ''),
          name: f
        }));

      return transcripts;
    } catch (err) {
      if (err.code === 'ENOENT') {
        return [];
      }
      throw err;
    }
  }

  /**
   * Get the most recent transcript for a project
   */
  async getMostRecentTranscript(projectPath) {
    const transcripts = await this.listTranscripts(projectPath);

    if (transcripts.length === 0) return null;

    // Get file stats to sort by modification time
    const transcriptsWithStats = await Promise.all(
      transcripts.map(async (t) => {
        const stats = await fs.stat(t.path);
        return { ...t, mtime: stats.mtime };
      })
    );

    transcriptsWithStats.sort((a, b) => b.mtime - a.mtime);
    return transcriptsWithStats[0];
  }

  /**
   * Answer "what were we working on before X?"
   */
  async findWorkBefore(projectPath, targetTopic) {
    const transcripts = await this.listTranscripts(projectPath);

    // Parse all transcripts (could optimize by parsing on-demand)
    const parsedTranscripts = await Promise.all(
      transcripts.map(async (t) => ({
        ...t,
        data: await this.parseTranscript(t.path)
      }))
    );

    // Sort by time
    parsedTranscripts.sort((a, b) =>
      new Date(a.data.startTime) - new Date(b.data.startTime)
    );

    // Find the transcript containing the target topic
    const targetIndex = parsedTranscripts.findIndex(t =>
      this.searchMessages(t.data, targetTopic).length > 0
    );

    if (targetIndex === -1) {
      return { found: false, message: `No sessions found containing "${targetTopic}"` };
    }

    // Get previous sessions
    const previousSessions = parsedTranscripts.slice(Math.max(0, targetIndex - 3), targetIndex);

    return {
      found: true,
      targetSession: parsedTranscripts[targetIndex],
      previousSessions: previousSessions.map(s => ({
        sessionId: s.sessionId,
        startTime: s.data.startTime,
        cwd: s.data.cwd,
        gitBranch: s.data.gitBranch,
        summary: s.data.summary,
        keyTopics: this.extractKeyTopics(s.data)
      }))
    };
  }

  /**
   * Extract key topics from a session
   */
  extractKeyTopics(data) {
    const topics = [];

    // Extract from user messages
    const userMessages = data.messages
      .filter(m => m.type === 'user')
      .map(m => m.content)
      .join(' ');

    // Simple keyword extraction (could use better NLP)
    const words = userMessages.toLowerCase().split(/\s+/);
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'what', 'when', 'where', 'who', 'why', 'how', 'this', 'that', 'these', 'those', 'i', 'you', 'we', 'they', 'it', 'he', 'she']);

    const wordFreq = {};
    for (const word of words) {
      if (word.length > 3 && !commonWords.has(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    }

    // Get top keywords
    const sortedWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    return sortedWords;
  }
}
