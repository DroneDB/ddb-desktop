<template>
    <Window title="Share" 
            id="share" 
            modal
            fixedSize
            @onClose="handleWindowClose">
        <div class="content">
            <Login v-if="showLogin" 
                    @onLogin="share" 
                    :server="registry"
                    :registerUrl="registerUrl"
                    showTitle />
            <div v-else>
                <Message bindTo="error" />

                <div class="ui large form" v-if="!sharing && !url">
                    <div class="field">
                        <label><strong>Selected Items:</strong> {{files.length}}</label>
                    </div>
                    <div class="field">
                        <div class="cui select icon">
                            <i class="server icon"></i>
                            <select v-model="registry" title="Server to share to">
                                <option value="testhub.dronedb.app">hub.dronedb.app</option>
                            </select>
                        </div>
                    </div>
                    <!-- TODO: add tag?
                    <div class="field">
                        <div class="ui left icon input">
                            <i class="tag icon"></i>
                            <input v-model="tag" type="text" name="tag" placeholder="Tag (optional)">
                        </div>
                    </div> -->
                    <!-- TODO: add password 
                    <div class="field">
                        <div class="ui left icon input">
                            <i class="lock icon"></i>
                            <input v-model="password" type="password" name="password" placeholder="Password (optional)">
                        </div>
                    </div> -->
                    <button class="ui button large primary fluid" @click="share">
                        <i class="share square icon"></i> Share
                    </button>
                </div>

                <div v-if="sharing" class="sharing">
                    <h5 class="sharing-title">Uploading to {{ this.registry }}</h5>
                    <div v-if="totalBytes === 0">
                        <i class="icon circle notch spin" />
                    </div>

                    <div class="ui segment" v-if="totalBytes > 0">
                        <div v-for="f in fileUploads">
                            <div class="ui indicating progress small success">
                                <div class="bar" :style="{'min-width': (f.txBytes / f.totalBytes * 100.0).toFixed(2) + '%'}">
                                    <div class="progress"></div>
                                </div>
                                <div class="label">{{ f.filename }} - {{ (f.txBytes / f.totalBytes * 100.0).toFixed(2) }}%</div>
                            </div>
                        </div>
                        <div v-if="totalBytes > 0" class="remaining">
                            <span v-if="totalBytes - txBytes > 0">Remaining: {{ humanRemainingBytes }}</span>
                        </div>
                        <div class="ui bottom attached progress">
                            <div class="bar" :style="{'min-width': totalProgress + '%'}"></div>
                        </div>
                    </div>

                    <button class="ui button large negative fluid" @click="handleCancel">
                        <i class="stop circle outline icon"></i> Cancel
                    </button>
                </div>

                <div v-if="url">
                    <div class="ui icon positive message">
                        <i class="check circle outline icon"></i> 
                        <div class="content">
                            <div class="header">
                            Success!
                            </div>
                            Your files are available to the secret URL below.
                        </div>
                    </div>

                    <div class="ui action input fluid">
                        <input type="text" :value="url" @click="copyToClipboard" title="Copy to clipboard"/>
                        <button class="ui icon button teal" @click="copyToClipboard" title="Copy to clipboard">
                            <i :class="copyIcon" class="icon"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Window>
</template>

<script>
import Window from 'commonui/components/Window';
import Message from 'commonui/components/Message';
import Login from './Login';
import { bytesToSize } from 'commonui/classes/utils';
import copy from 'clipboard-copy';
import ddb from 'ddb';

export default {
  components: {
      Window, Message, Login
  },
  props: ["files"],
  data: function(){
      const defaultRegistry = ddb.getDefaultRegistry();

      return {
        //   defaultRegistry,
          error: "",
          registry: defaultRegistry,
          registerUrl: "https://dronedb.app/register",
          tag: "",
          password: "",
          sharing: false,
          showLogin: false,
          cancel: false,
          url: "",
          copyIcon: "copy",

          fileUploads: [],
          txBytes: 0,
          totalBytes: 0
      };
  },
  computed: {
    //   totalSize: function(){
    //       return bytesToSize(this.files.reduce((c, f) => c + f.entry.size, 0));
    //   }

    humanRemainingBytes: function(){
        return bytesToSize(this.totalBytes - this.txBytes);
    },

    totalProgress: function(){
        if (this.totalBytes === 0) return 0;
        return (this.txBytes / this.totalBytes * 100.0).toFixed(2);
    }
  },
  mounted: async function(){
  },
  watch: {
      registry: function(newVal, oldVal){
          if (newVal !== ddb.getDefaultRegistry()){
              this.registerUrl = "";
          }else{
              this.registerUrl = "https://dronedb.app/register";
          }
      }
  },
  methods: {
      bytesToSize,

      share: async function(){
          this.sharing = true;
          this.showLogin = false;
          this.error = "";
          this.url = "";
          this.cancel = false;
          this.fileUploads = [];
          this.txBytes = 0;
          this.totalBytes = 0;

          try{
            const url = await ddb.share(this.files.map(f => f.path.replace(/^file:\/\//, "")), `${this.registry}//`, {
                password: this.password
            }, (progress) => {
                const { txBytes, totalBytes} = progress;
                this.fileUploads = progress.files;
                this.txBytes = txBytes;
                this.totalBytes = totalBytes;

                return !this.cancel;
            });
            this.url = url;
          }catch(e){
              if (e.message === "Unauthorized"){
                this.showLogin = true;
              }else if (e.message.indexOf("Callback aborted") !== -1){
                // Nothing, user canceled
              }else{
                this.error = e.message;
              }
          }
          this.sharing = false;
      },

      handleCancel: function(){
          this.cancel = true;
      },

      handleWindowClose: function(e){
          if (this.sharing){
            this.cancel = true;
          }else{
            this.$emit('onClose', e, arguments[1]);
          }
      },

      copyToClipboard: function(n){
          copy(this.url);
          this.copyIcon = "check";
          this.copyTextTimeout = setTimeout(() => {
              this.copyIcon = "copy";
              this.copyTextTimeout = null;
          }, 2000);
      }
  },

  destroyed: function(){
      if (this.copyTextTimeout) clearTimeout(this.copyTextTimeout);
  }
}
</script>

<style scoped>
.content{
    width: 420px;
}
.sharing{
    text-align: center;
    .circle.notch{
        margin-bottom: 12px;
        height: 20px;
        width: 22px;
    }
    .remaining{
        margin-top: 36px;
    }
}
</style>