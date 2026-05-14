import type { ToolReminderDetail } from '../../email-service';
import { generateOptApplySection } from './opt-apply';
import { generateOptClockSection } from './opt-clock';
import { generateStemApplySection } from './stem-apply';
import { generateStemClockSection } from './stem-clock';

export function generateToolSection(tool: ToolReminderDetail): string {
  if (tool.toolType === 'opt-apply') {
    return generateOptApplySection(tool);
  }
  if (tool.toolType === 'opt-clock') {
    return generateOptClockSection(tool);
  }
  if (tool.toolType === 'stem-apply') {
    return generateStemApplySection(tool);
  }
  if (tool.toolType === 'stem-clock') {
    return generateStemClockSection(tool);
  }
  return '';
}
