// a name for every URL pattern
export const PageNames = {
  ROOT: 'ROOT',
  TOPICS_ROOT: 'TOPICS_ROOT',
  TOPICS_CUSTOM_CHANNEL: 'TOPICS_CUSTOM_CHANNEL',
  TOPICS_CHANNEL: 'TOPICS_CHANNEL',
  TOPICS_TOPIC: 'TOPICS_TOPIC',
  TOPICS_CONTENT: 'TOPICS_CONTENT',
  CONTENT_UNAVAILABLE: 'CONTENT_UNAVAILABLE',
};

// switch between modes
export const PageModes = {
  TOPICS: 'TOPICS',
};

export const pageNameToModuleMap = {
  [PageNames.TOPICS_ROOT]: 'topicsRoot',
  [PageNames.TOPICS_CHANNEL]: 'topicsTree',
  [PageNames.TOPICS_CONTENT]: 'topicsTree',
  [PageNames.TOPICS_TOPIC]: 'topicsTree',
};

export const CUSTOM_PRESENTATION_TITLE = 'custom-channel-ui';
