<template>
  <div class="with-connection-type sqlite-form">
    <div class="alert alert-warning">
      <i class="material-icons">warning</i>
      <span>
        BigQuery support is still in beta. Please report any problems on <a href="https://github.com/beekeeper-studio/beekeeper-studio/issues/new/choose">our issue tracker</a>.
      </span>
    </div>
    <div class="form-group">
      <label for="Project Id">ProjectId</label>
      <input
        type="text"
        class="form-control"
        placeholder="eg: example-project"
        v-model="config.bigQueryOptions.projectId"
      >
    </div>
    <div class="form-group">
      <label for="defaultDataset">Default Dataset</label>
      <input type="text" class="form-control" v-model="config.defaultDatabase" placeholder="(Optional)">
    </div>
    <toggle-form-area v-if="$config.isDevelopment" :expanded="devMode" title="[DEV MODE OVERRIDES]" :hideToggle="true">
      <template v-slot:header>
        <x-switch @click.prevent="devMode = !devMode" :toggled="devMode"></x-switch>
      </template>
      <div class="form-group"><label for="host">Host</label><input type="text" class="form-control" v-model="config.host"></div>
      <div class="form-group"><label for="port">Port</label><input type="text" class="form-control" v-model="config.port"></div>
    </toggle-form-area>
    <toggle-form-area
      :expanded="true"
      :hideToggle="true"
      title="Authentication"
    >
    <div class="row gutter">
          <div class="alert alert-info expand">
            <i class="material-icons-outlined">info</i>
            <span>
              You need a service account with the roles 'BigQuery Data Viewer' and 'BigQuery Job User' - <a
                href="https://docs.beekeeperstudio.io/docs/google-bigquery"
              > Read More</a>
            </span>
          </div>
        </div>

        <div class="form-group">
          <label for="KeyFilename">
            Service Account's JSON Private Key
          </label>
          <file-picker v-model="config.bigQueryOptions.keyFilename" />
        </div>
  </toggle-form-area>


  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import FilePicker from '@/components/common/form/FilePicker.vue'
import ToggleFormArea from '../common/ToggleFormArea.vue'

export default Vue.extend({
  components: { FilePicker, ToggleFormArea },
  data() {
    return {
      devMode: false,
      iamAuthenticationEnabled: this.config.bigQueryOptions?.iamAuthenticationEnabled || false
    }
  },
  watch: {
    devMode() {
      if (this.devMode) {
        this.config.host = 'localhost'
        this.config.port = 443
      } else {
        this.config.host = null
        this.config.port = null
      }
    }
  },
  methods: {
    toggleIAMAuthentication() {
      this.config.bigQueryOptions.iamAuthenticationEnabled = this.iamAuthenticationEnabled = !this.iamAuthenticationEnabled
    }
  },
  props: ['config'],
})
</script>
