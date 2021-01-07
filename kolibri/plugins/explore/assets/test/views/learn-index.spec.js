import VueRouter from 'vue-router';
import { mount, createLocalVue } from '@vue/test-utils';
import LearnIndex from '../../src/views/LearnIndex';
import makeStore from '../makeStore';

LearnIndex.methods.getDemographicInfo = function() {};

const localVue = createLocalVue();
localVue.use(VueRouter);

const router = new VueRouter({
  routes: [
    { path: '/recommended', name: 'RECOMMENDED' },
    { path: '/topics', name: 'TOPICS_ROOT' },
    { path: '/classes', name: 'ALL_CLASSES' },
  ],
});

function makeWrapper(options) {
  return mount(LearnIndex, {
    ...options,
    stubs: {
      breadcrumbs: true,
      contentUnavailablePage: true,
      CoreBase: {
        name: 'CoreBase',
        props: ['showSubNav'],
        template: `
          <div>
            <slot></slot>
            <slot name="sub-nav"></slot>
          </div>
        `,
      },
      topicsPage: true,
      TotalPoints: true,
    },
    localVue,
    router,
  });
}

function getElements(wrapper) {
  return {
    // hrefs need to match the routes in the mock router above
    classesLink: () => wrapper.find('[href="#/classes"]'),
    recommendedLink: () => wrapper.find('[href="#/recommended"]'),
    topicsLink: () => wrapper.find('[href="#/topics"]'),
    tabLinks: () => wrapper.findAllComponents({ name: 'NavbarLink' }),
    CoreBase: () => wrapper.findComponent({ name: 'CoreBase' }),
  };
}

describe('learn plugin index page', () => {
  let store;

  const setSessionUserKind = kind => {
    store.state.core.session.kind = [kind];
    store.state.core.session.user_id = 'test';
  };
  const setMemberships = memberships => {
    store.state.memberships = memberships;
  };
  const setCanAccessUnassignedContent = canAccess => {
    store.state.canAccessUnassignedContentSetting = canAccess;
  };

  beforeEach(() => {
    store = makeStore();
  });

  describe('when allowed to access unassigned content', () => {
    beforeEach(() => {
      setCanAccessUnassignedContent(true);
    });

    it('No recommended or topics', () => {
      setSessionUserKind('anonymous');
      setMemberships([]);
      const wrapper = makeWrapper({ store });
      const { tabLinks } = getElements(wrapper);
      expect(tabLinks().length).toEqual(0);
    });
  });

  describe('when not allowed to access unassigned content', () => {
    beforeEach(() => {
      setCanAccessUnassignedContent(false);
    });

    it('no tabs are available', () => {
      setSessionUserKind('anonymous');
      setMemberships([]);
      const wrapper = makeWrapper({ store });
      const { tabLinks } = getElements(wrapper);
      expect(tabLinks().length).toEqual(0);
    });
  });
});
