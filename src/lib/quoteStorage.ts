/// <reference types="chrome" />

export interface Quote {
  text: string;
  author: string;
}

const QUOTE_STORAGE_KEY = 'dailyQuote';

export async function saveQuote(quote: Quote): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [QUOTE_STORAGE_KEY]: quote }, () => {
      resolve();
    });
  });
}

export async function getQuote(): Promise<Quote | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get([QUOTE_STORAGE_KEY], (result) => {
      resolve(result[QUOTE_STORAGE_KEY] || null);
    });
  });
}