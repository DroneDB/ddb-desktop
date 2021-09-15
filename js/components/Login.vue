<template>
    <div>
        <h5 v-if="showTitle">Enter your credentials for {{ server }}</h5>
        <Message bindTo="error" />
        <form class="ui large form">
            <div class="ui">
                <div class="field">
                    <div class="ui left icon input">
                        <i class="user icon"></i>
                        <input v-on:keyup.enter="login" v-model="username" autocomplete="off" type="text" name="username" placeholder="Username">
                    </div>
                </div>
                <div class="field">
                    <div class="ui left icon input">
                        <i class="key icon"></i>
                        <input v-on:keyup.enter="login" v-model="password" type="password" name="password" placeholder="Password">
                    </div>
                </div>
                <div @click="login" :class="{loading: loggingIn}" class="ui fluid icon large primary submit button"><i class="icon lock"></i> Login</div>
                <p class="register" v-if="registerUrl">Need an account? <a href="#" @click="register">Register</a></p>
            </div>
        </form>

    </div>
</template>

<script>
import Message from 'commonui/components/Message';
import ddb from 'ddb';

export default {
  components: {
      Message
  },
  props: {
      server: {
          type: String,
          default: "",
          required: true
      },
      registerUrl: {
          type: String,
          default: ""   
      },
      showTitle: {
          type: Boolean,
          default: false
      }
  },
  data: function(){
      return {
          error: "",
          username: "",
          password: "",
          loggingIn: false
      };
  },
  methods: {
      login: async function(){
          this.loggingIn = true;
          this.error = "";

          let token = null;
          try{
              token = await ddb.login(this.username, this.password, this.server);
          }catch(e){
              this.error = `${e.message}`;
          }

          this.loggingIn = false;

          if (token !== null) this.$emit('onLogin', token);
      },

      register: function(){
          ddb.shell.openItem(this.registerUrl);
      }
  }
}
</script>

<style scoped>
.register{
    margin-top: 8px;
    text-align: center;
    font-size: 90%;
}
</style>