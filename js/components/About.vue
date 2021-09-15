<template>
    <Window title="About" 
            id="about" 
            fixedSize
            @onClose="$emit('onClose', $event, arguments[1])">
        <div class="content">
            <img src="../../images/icon64.png" alt="Icon" />
            <h3>DroneDB Desktop (Alpha)</h3>
            <p>{{ description }}</p>

            <p>Made with <i class="heart icon"></i> by <a href="#" @click="openSite">DroneDB</a></p>

            <strong>App Version:</strong> {{ appVersion }}<br/>
            <strong>Lib Version:</strong> {{ ddbVersion }}<br/>
        </div>
    </Window>
</template>

<script>
import Window from 'commonui/components/Window.vue';
import ddb from 'ddb';
import appInfo from 'appInfo';
import shell from 'commonui/dynamic/shell';

export default {
  components: {
      Window
  },
  data: function(){
      return {
          ddbVersion: ddb.getVersion(),
          appVersion: "",
          description: "",
          year: (new Date).getFullYear()
      };
  },
  mounted: async function(){
      const info = await appInfo.getPackageInfo();
      this.appVersion = info.version;
      this.description = info.description;
  },
  methods: {
      openSite: function(){
          shell.openItem("https://dronedb.app");
      }
  }
}
</script>

<style scoped>
.heart{
    color: red;
}
.content{
    text-align: center;
    margin: 8px;
}
h3{
    margin-top: 0;
    margin-bottom: 0;
}
</style>