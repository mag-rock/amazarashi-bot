declare module 'twitter-text' {
  export interface ParsedTweet {
    weightedLength: number;
    permillage: number;
    valid: boolean;
    displayRangeStart: number;
    displayRangeEnd: number;
    validRangeStart: number;
    validRangeEnd: number;
  }

  export function parseTweet(text: string): ParsedTweet;
  export function autoLink(text: string, options?: any): string;
  export function htmlEscape(text: string): string;
  export function extractMentions(text: string): string[];
  export function extractHashtags(text: string): string[];
  export function extractUrls(text: string): string[];
}

export default 'twitter-text'; 