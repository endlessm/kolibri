<template>

  <CoreBase
    :marginBottom="bottomSpaceReserved"
    :authorized="userIsAuthorized"
    authorizedRole="registeredUser"
    v-bind="immersivePageProps"
    :maxMainWidth="Infinity"
  >
    <template v-if="pageName !== 'TOPICS_ROOT'" slot="app-bar-actions">
      <router-link
        class="rm-link-style"
        :style="{ color: $themeTokens.textInverted }"
        to="/"
      >
        Back
      </router-link>
    </template>

    <!--
      Topics pages have a different heading style which
      includes passing the breadcrumbs
    -->
    <div v-if="currentPageIsTopic">
      <component :is="currentPage" />
      <router-view />
    </div>

    <div v-else>
      <component :is="currentPage" v-if="currentPage" />
      <router-view />
    </div>

  </CoreBase>

</template>


<script>

  import { mapGetters, mapState } from 'vuex';
  import lastItem from 'lodash/last';
  import commonCoreStrings from 'kolibri.coreVue.mixins.commonCoreStrings';
  import responsiveWindowMixin from 'kolibri.coreVue.mixins.responsiveWindowMixin';
  import CoreBase from 'kolibri.coreVue.components.CoreBase';
  import { PageNames } from '../constants';
  import commonLearnStrings from './commonLearnStrings';
  import ChannelsPage from './ChannelsPage';
  import CustomChannelsPage from './CustomChannelsPage';
  import TopicsPage from './TopicsPage';
  import ContentPage from './ContentPage';
  import ContentUnavailablePage from './ContentUnavailablePage';
  import plugin_data from 'plugin_data';

  const pageNameToComponentMap = {
    [PageNames.TOPICS_ROOT]: ChannelsPage,
    [PageNames.TOPICS_CUSTOM_CHANNEL]: CustomChannelsPage,
    [PageNames.TOPICS_CHANNEL]: TopicsPage,
    [PageNames.TOPICS_TOPIC]: TopicsPage,
    [PageNames.TOPICS_CONTENT]: ContentPage,
    [PageNames.CONTENT_UNAVAILABLE]: ContentUnavailablePage,
  };

  export default {
    name: 'LearnIndex',
    components: {
      CoreBase,
    },
    mixins: [commonCoreStrings, commonLearnStrings, responsiveWindowMixin],
    data() {
      return {
        lastRoute: null,
      };
    },
    computed: {
      ...mapGetters(['isUserLoggedIn']),
      ...mapState('topicsTree', {
        topicsTreeContent: 'content',
        topicsTreeChannel: 'channel',
      }),
      ...mapState(['pageName']),
      userIsAuthorized() {
        return (
          (plugin_data.allowGuestAccess && this.$store.getters.allowAccess) || this.isUserLoggedIn
        );
      },
      currentPage() {
        return pageNameToComponentMap[this.pageName] || null;
      },
      currentPageIsTopic() {
        return [
          pageNameToComponentMap[PageNames.TOPICS_TOPIC],
          pageNameToComponentMap[PageNames.TOPICS_CHANNEL],
        ].includes(this.currentPage);
      },
      immersivePageProps() {
        if (this.pageName === PageNames.TOPICS_CONTENT) {
          let immersivePageRoute = {};
          let appBarTitle;
          if (this.topicsTreeContent.parent) {
            // Need to guard for parent being non-empty to avoid console errors
            immersivePageRoute = this.$router.getRoute(PageNames.TOPICS_TOPIC, {
              id: this.topicsTreeContent.parent,
            });

            if (this.topicsTreeContent.breadcrumbs.length > 0) {
              appBarTitle = lastItem(this.topicsTreeContent.breadcrumbs).title;
              immersivePageRoute = this.lastRoute || this.$router.getRoute(PageNames.TOPICS_ROOT);
            } else {
              // `breadcrumbs` is empty if the direct parent is the channel, so pull
              // channel info from state.topicsTree.channel
              appBarTitle = this.topicsTreeChannel.title;
            }
          }
          return {
            appBarTitle,
            immersivePage: true,
            immersivePageRoute,
            immersivePagePrimary: true,
            immersivePageIcon: 'close',
          };
        }

        return {
          appBarTitle: this.learnString('exploreLabel'),
          immersivePage: false,
        };
      },
      bottomSpaceReserved() {
        return 0;
      },
    },
    watch: {
      $route: function(newRoute, oldRoute) {
        // Return if the user is leaving or entering the Search page.
        // This ensures we never set this.lastRoute to be any kind of
        // SEARCH route and avoids infinite loops.
        if (newRoute.name === 'SEARCH' || oldRoute.name === 'SEARCH') {
          return;
        }

        // Destructure the oldRoute into an object with 3 specific properties.
        // Setting this.lastRoute = oldRoute causes issues for some reason.
        this.lastRoute = {
          name: oldRoute.name,
          query: oldRoute.query,
          params: oldRoute.params,
        };
      },
    },
  };

</script>


<style lang="scss" scoped>

  @import './learn';

  .content {
    margin: auto;
  }

  .rm-link-style {
    text-decoration: none;
  }

</style>
