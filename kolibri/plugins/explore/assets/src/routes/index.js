import store from 'kolibri.coreVue.vuex.store';
import router from 'kolibri.coreVue.router';
import {
  showTopicsTopic,
  showTopicsChannel,
  showTopicsContent,
} from '../modules/topicsTree/handlers';
import { showFilteredChannels } from '../modules/topicsRoot/handlers';
import { PageNames, ClassesPageNames } from '../constants';

function unassignedContentGuard() {
  const { canAccessUnassignedContent } = store.getters;
  if (!canAccessUnassignedContent) {
    // If there are no memberships and it is allowed, redirect to topics page
    return router.replace({ name: ClassesPageNames.ALL_CLASSES });
  }
  // Otherwise return nothing
  return;
}

export default [
  {
    name: PageNames.ROOT,
    path: '/',
    handler: () => {
      const { memberships } = store.state;
      const { canAccessUnassignedContent } = store.getters;

      // If a registered user, go to Classes Page, else go to Content
      return router.replace({
        name:
          memberships.length > 0 || !canAccessUnassignedContent
            ? ClassesPageNames.ALL_CLASSES
            : PageNames.TOPICS_ROOT,
      });
    },
  },
  {
    name: PageNames.TOPICS_ROOT,
    path: '/topics',
    handler: () => {
      if (unassignedContentGuard()) {
        return unassignedContentGuard();
      }
      showFilteredChannels(store);
    },
  },
  {
    name: PageNames.CONTENT_UNAVAILABLE,
    path: '/content-unavailable',
    handler: () => {
      store.commit('SET_PAGE_NAME', PageNames.CONTENT_UNAVAILABLE);
      store.commit('CORE_SET_PAGE_LOADING', false);
      store.commit('CORE_SET_ERROR', null);
    },
  },
  {
    name: PageNames.TOPICS_CHANNEL,
    path: '/topics/:channel_id',
    handler: toRoute => {
      if (unassignedContentGuard()) {
        return unassignedContentGuard();
      }
      showTopicsChannel(store, toRoute.params.channel_id);
    },
  },
  {
    name: PageNames.TOPICS_TOPIC,
    path: '/topics/t/:id',
    handler: toRoute => {
      if (unassignedContentGuard()) {
        return unassignedContentGuard();
      }
      showTopicsTopic(store, { id: toRoute.params.id });
    },
  },
  {
    name: PageNames.TOPICS_CONTENT,
    path: '/topics/c/:id',
    handler: toRoute => {
      if (unassignedContentGuard()) {
        return unassignedContentGuard();
      }
      showTopicsContent(store, toRoute.params.id);
    },
  },
  {
    path: '*',
    redirect: '/',
  },
];
