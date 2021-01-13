import mutations from './coreExplore/mutations';
import * as getters from './coreExplore/getters';
import * as actions from './coreExplore/actions';
import topicsRoot from './topicsRoot';
import topicsTree from './topicsTree';

export default {
  state() {
    return {
      pageName: '',
      examAttemptLogs: {},
      examLog: {},
      memberships: [],
    };
  },
  actions,
  getters,
  mutations,
  modules: {
    topicsRoot,
    topicsTree,
  },
};
