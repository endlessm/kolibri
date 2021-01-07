<template>

  <CoreFullscreen
    ref="html5Renderer"
    class="html5-renderer"
    :style="{ height: contentRendererHeight, width: iframeWidth }"
    @changeFullscreen="isInFullscreen = $event"
  >

    <div
      class="fullscreen-header"
      :style="{ backgroundColor: this.$themePalette.grey.v_100 }"
    >
      <KButton
        :primary="false"
        appearance="flat-button"
        @click="$refs.html5Renderer.toggleFullscreen()"
      >
        <KIcon
          v-if="isInFullscreen"
          icon="fullscreen_exit"
          class="fs-icon"
        />
        <KIcon
          v-else
          icon="fullscreen"
          class="fs-icon"
        />
        {{ fullscreenText }}
      </KButton>
    </div>
    <div class="iframe-container" :style="containerStyle">
      <iframe
        ref="iframe"
        class="iframe"
        :style="{ backgroundColor: $themePalette.grey.v_100 }"
        :sandbox="sandbox"
        frameBorder="0"
        :name="name"
        :src="rooturl"
      >
      </iframe>
    </div>
  </CoreFullscreen>

</template>


<script>

  import { now } from 'kolibri.utils.serverClock';
  import CoreFullscreen from 'kolibri.coreVue.components.CoreFullscreen';
  import Hashi from 'hashi';
  import { nameSpace } from 'hashi/src/hashiBase';
  import plugin_data from 'plugin_data';
  import { ContentNodeResource } from 'kolibri.resources';
  import { getContentNodeThumbnail } from 'kolibri.utils.contentNode';
  import axios from 'axios';

  const defaultContentHeight = '500px';
  const frameTopbarHeight = '37px';
  const pxStringAdd = (x, y) => parseInt(x, 10) + parseInt(y, 10) + 'px';

  export default {
    name: 'Html5AppRendererIndex',
    components: {
      CoreFullscreen,
    },
    data() {
      return {
        isInFullscreen: false,
      };
    },
    computed: {
      name() {
        return nameSpace;
      },
      rooturl() {
        // Skip hashi on requests for these browsers
        return this.defaultFile.storage_url + '?SKIP_HASHI=true' + '?date=' + (+ new Date());
      },
      iframeHeight() {
        return (this.options && this.options.height) || defaultContentHeight;
      },
      iframeWidth() {
        return (this.options && this.options.width) || 'auto';
      },
      contentRendererHeight() {
        return pxStringAdd(this.iframeHeight, frameTopbarHeight);
      },
      sandbox() {
        return plugin_data.html5_sandbox_tokens;
      },
      fullscreenText() {
        return this.isInFullscreen ? this.$tr('exitFullscreen') : this.$tr('enterFullscreen');
      },
      userData() {
        return {
          userId: this.userId,
          userFullName: this.userFullName,
          progress: this.progress,
          complete: this.progress >= 1,
          language: this.lang.id,
          timeSpent: this.timeSpent,
        };
      },
      containerStyle() {
        if (this.isInFullscreen) {
          return {
            position: 'absolute',
            top: frameTopbarHeight,
            bottom: 0,
          };
        }
        return { height: this.iframeHeight };
      },
    },
    watch: {
      userData(newValue) {
        if (newValue && this.hashi) {
          this.hashi.updateData({ userData: newValue });
        }
      },
    },
    mounted() {
      window.addEventListener('message', event => {
        if (!event.data.event || !event.data.nameSpace || event.data.nameSpace !== 'customChannelPresentation') {
          return;
        }
        if (event.data.event === 'askChannelInformation') {
          this.sendChannelInformation();
        }
        if (event.data.event === 'goToContent') {
          this.goToContent(event.data.data);
        }
        if (event.data.event === 'getThumbnail') {
          this.sendThumbnail(event.data.data);
        }
      });

      this.hashi = new Hashi({ iframe: this.$refs.iframe, now });
      this.hashi.onStateUpdate(data => {
        this.$emit('updateContentState', data);
      });
      this.hashi.initialize(
        (this.extraFields && this.extraFields.contentState) || {},
        this.userData
      );
      this.$emit('startTracking');
      this.startTime = now();
      this.pollProgress();
    },
    beforeDestroy() {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      this.$emit('stopTracking');
    },
    methods: {
      sendChannelInformation() {
        if (!this.$refs.iframe) {
          return;
        }
        const iframeWindow = this.$refs.iframe.contentWindow;
        const channel = this.$store.state.topicsTree.channel;
        const currentNodeId = this.$store.state.topicsTree.content.id;

        ContentNodeResource.fetchCollection({
          getParams: {
            channel_id: channel.id,
            user_kind: this.$store.getters.getUserKind,
          },
        }).then((nodes) => {
          const promises = nodes.filter((node) => {
            return node.id !== currentNodeId;
          });

          Promise.all(promises).then((nodes) => {
            const event = 'sendChannelInformation';
            const message = {
              event,
              nameSpace,
              data: {channel, nodes},
            };
            iframeWindow.postMessage(message, '*');
          });
        });
      },

      sendThumbnail(id) {
        const iframeWindow = this.$refs.iframe.contentWindow;
        const event = 'sendThumbnail';
        ContentNodeResource.fetchModel({ id }).then((node) => {
          const thumbnailUrl = getContentNodeThumbnail(node);
          if (!thumbnailUrl) {
            const message = {
              event,
              nameSpace,
              data: {id, thumbnail: null},
            };
            iframeWindow.postMessage(message, '*');
            return;
          }
          const promise = axios.get(thumbnailUrl, {responseType: 'arraybuffer'}).then((response) => {
              const returnedB64 = Buffer.from(response.data).toString('base64');
              const thumbnail = "data:" + response.headers["content-type"] + ";base64," + returnedB64;
              return thumbnail;
          });
          promise.then((thumbnail) => {
            const message = {
              event,
              nameSpace,
              data: {id, thumbnail},
            };
            iframeWindow.postMessage(message, '*');
          });
        });
      },

      goToContent(id) {
        this.$router.push({ name: 'TOPICS_CONTENT', params: { id }});
      },

      recordProgress() {
        const totalTime = now() - this.startTime;
        const hashiProgress = this.hashi ? this.hashi.getProgress() : null;
        this.$emit(
          'updateProgress',
          hashiProgress === null ? Math.max(0, totalTime / 300000) : hashiProgress
        );
        this.pollProgress();
      },
      pollProgress() {
        this.timeout = setTimeout(() => {
          this.recordProgress();
        }, 15000);
      },
    },
    $trs: {
      exitFullscreen: 'Exit Fullscreen',
      enterFullscreen: 'View Fullscreen',
    },
  };

</script>


<style lang="scss" scoped>

  @import '~kolibri-design-system/lib/styles/definitions';

  .fullscreen-header {
    text-align: right;
  }

  .fs-icon {
    position: relative;
    top: 8px;
    width: 24px;
    height: 24px;
  }

  .html5-renderer {
    position: relative;
    text-align: center;
  }

  .iframe {
    width: 100%;
    height: 100%;
  }

  .iframe-container {
    @extend %momentum-scroll;

    width: 100%;
    overflow: visible;
  }

</style>
