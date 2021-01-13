import mutations from './coreExplore/mutations';
import * as getters from './coreExplore/getters';
import * as actions from './coreExplore/actions';
import topicsRoot from './topicsRoot';
import topicsTree from './topicsTree';

import plugin_data from 'plugin_data';

export default {
  state() {
    return {
      pageName: '',
      examAttemptLogs: {},
      examLog: {},
      memberships: [],
      canAccessUnassignedContentSetting: plugin_data.allowLearnerUnassignedResourceAccess,
      allowGuestAccess: plugin_data.allowGuestAccess,
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
