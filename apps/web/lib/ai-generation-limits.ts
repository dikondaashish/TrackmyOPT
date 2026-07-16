export interface AiGenerationLimitState {
  allowed: boolean; dailyLimit: number; dailyRemaining: number;
  itemRegenerationLimit: number; itemRegenerationsRemaining: number;
  resetsAt?: string; error?: 'ai_daily_limit_reached'|'ai_item_regeneration_limit_reached'|'ai_rate_limited';
}
const DAILY = 25, ITEM = 3;
const buckets = new Map<string,{ day:string; used:number; items:Map<string,number> }>();
/** Atomic in-process implementation; production deployments should back this with a transactional store. */
export function consumeAiGeneration(userId:string,itemKey:string, isRegeneration:boolean): AiGenerationLimitState {
  const day = new Date().toISOString().slice(0,10); let b=buckets.get(userId);
  if (!b || b.day!==day) { b={day,used:0,items:new Map()}; buckets.set(userId,b); }
  const usedItem=b.items.get(itemKey)||0;
  const remaining=Math.max(0,DAILY-b.used), itemRemaining=Math.max(0,ITEM-usedItem);
  if (!remaining) return {allowed:false,dailyLimit:DAILY,dailyRemaining:0,itemRegenerationLimit:ITEM,itemRegenerationsRemaining:itemRemaining,error:'ai_daily_limit_reached'};
  if (isRegeneration && !itemRemaining) return {allowed:false,dailyLimit:DAILY,dailyRemaining:remaining,itemRegenerationLimit:ITEM,itemRegenerationsRemaining:0,error:'ai_item_regeneration_limit_reached'};
  b.used++; if(isRegeneration)b.items.set(itemKey,usedItem+1);
  return {allowed:true,dailyLimit:DAILY,dailyRemaining:DAILY-b.used,itemRegenerationLimit:ITEM,itemRegenerationsRemaining:ITEM-(isRegeneration?usedItem+1:usedItem)};
}
