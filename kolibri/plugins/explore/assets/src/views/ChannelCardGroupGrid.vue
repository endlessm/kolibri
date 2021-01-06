<template>

  <div class="container" ref="container">
    <div class="carousel" ref="carousel">
      <div
        class="carousel-item"
        v-for="content in contents"
        :key="content.id"
      >
        <ChannelCard
          :isMobile="windowIsSmall"
          :title="content.title"
          :backgroundImage="getBackgroundImage(content)"
          :thumbnail="content.thumbnail"
          :kind="content.kind"
          :tagline="getTagLine(content)"
          :progress="content.progress || 0"
          :numCoachContents="content.num_coach_contents"
          :link="genContentLink(content.id, content.kind)"
          :contentId="content.content_id"
          :copiesCount="content.copies_count"
          @openCopiesModal="openCopiesModal"
        />
      </div>

    </div>

    <KIconButton
      class="left-button"
      v-if="leftButton"
      size="large"
      appearance="raised-button"
      @click="scrollLeft"
      icon="chevronLeft" />
    <KIconButton
      class="right-button"
      v-if="rightButton"
      size="large"
      appearance="raised-button"
      @click="scrollRight"
      icon="chevronRight" />
  </div>
</template>


<script>

  import { validateLinkObject } from 'kolibri.utils.validators';
  import responsiveWindowMixin from 'kolibri.coreVue.mixins.responsiveWindowMixin';
  import ChannelCard from './ChannelCard';

  export default {
    name: 'ChannelCardGroupGrid',
    components: {
      ChannelCard,
    },
    mixins: [responsiveWindowMixin],
    props: {
      contents: {
        type: Array,
        required: true,
      },
      genContentLink: {
        type: Function,
        validator(value) {
          return validateLinkObject(value(1, 'exercise'));
        },
        default: () => {},
        required: false,
      },
    },
    data: () => ({
      modalIsOpen: false,
      sharedContentId: null,
      uniqueId: null,
      isMounted: false,
      leftButton: false,
      rightButton: false,
      offset: 0,
      scrollOffset: 510,
    }),

    mounted() {
      this.isMounted = true;
      this.smoothScroll(0);
    },

    computed: {
    },

    methods: {
      openCopiesModal(contentId) {
        this.sharedContentId = contentId;
        this.uniqueId = this.contents.find(content => content.content_id === contentId).id;
        this.modalIsOpen = true;
      },
      getTagLine(content) {
        return content.tagline || content.description;
      },
      getBackgroundImage(content) {
        if (content.html5Thumbnail) {
          return `url(${content.html5Thumbnail})`;
        }
        // Random image if there's no thumnail
        return `url(https://picsum.photos/500/300?random=${Math.random()*10})`;
      },
      scrollLeft() {
        this.smoothScroll(this.scrollOffset);
      },
      scrollRight() {
        this.smoothScroll(-this.scrollOffset);
      },
      smoothScroll(offset) {
        const carousel = this.$refs.carousel;
        const elements = this.contents.length;
        const carouselWidth = elements * this.scrollOffset;
        let maxOffset = carouselWidth - carousel.offsetWidth;

        if (carousel.offsetWidth > carouselWidth) {
          maxOffset = 0;
        }

        this.leftButton = true;
        this.rightButton = true;
        this.offset += offset;

        // Left boundary, hide the left button
        if (this.offset >= 0) {
          this.offset = 0;
          this.leftButton = false;
        }

        // Right boundary, hide the right button
        if (this.offset <= -maxOffset) {
          this.rightButton = false;
          this.offset = -maxOffset;
        }

        carousel.setAttribute(
          'style',
          `transform: translate3d(${this.offset}px, 0, 0)`,
        );
      },
    },
  };

</script>


<style lang="scss" scoped>
  .carousel {
    display: flex;
    flex-wrap: no-wrap;
    transition: transform 0.3s ease-out;
  }

  .carousel-item {
    min-width: 500px;
    margin: 5px;
  }

  .container {
    position: relative;
    overflow: hidden;
  }

  .left-button,
  .right-button {
    color: white;
    position: absolute;
    top: calc(50% - 48px);
  }

  .left-button {
    left: 5px;
  }

  .right-button {
    right: 5px;
  }
</style>
